'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { App, Image as AntImage, Modal } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SupportTicketModal } from '@/components/common/SupportTicketModal';
import { bookingApi } from '@/apis/booking.api';
import { goongApi } from '@/apis/goong.api';
import { paymentApi } from '@/apis/payment.api';
import { walletApi } from '@/apis/wallet.api';
import { reviewApi } from '@/apis/review.api';
import { voucherApi } from '@/apis/voucher.api';
import { useAuth } from '@/hooks/useAuth';
import { useChatHub } from '@/hooks/useChatHub';
import { MEDIA_CATEGORY, SUPPORT_CATEGORY, SUPPORT_PRIORITY } from '@/constants/enums';
import { formatBookingPrice as formatCurrency, formatBookingDate as formatDate, parseBackendDate } from '@/utils/format';
import { getBookingStatusKey, STATUS_CONFIGS } from '@/utils/booking';

const GOONG_JS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
const GOONG_CSS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
const DEFAULT_MAP_CENTER = [108.2208, 16.0678];

function createMarkerElement({ variant = 'worker', icon, label, imageUrl }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'booking-map-marker';

  const bubble = document.createElement('div');
  bubble.className = `booking-map-marker__bubble booking-map-marker__bubble--${variant}`;

  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = label;
    image.className = 'booking-map-marker__image';
    bubble.appendChild(image);
  } else {
    const span = document.createElement('span');
    span.className = 'material-symbols-outlined booking-map-marker__icon';
    span.textContent = icon;
    bubble.appendChild(span);
  }

  const caption = document.createElement('span');
  caption.textContent = label;
  caption.className = 'booking-map-marker__caption';

  wrapper.appendChild(bubble);
  wrapper.appendChild(caption);
  return wrapper;
}

// Polyline decoder helper
function decodePolyline(encodedString) {
  let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      lat_change,
      lng_change;

  const factor = Math.pow(10, 5);

  while (index < encodedString.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = encodedString.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += lat_change;

    shift = 0;
    result = 0;

    do {
      byte = encodedString.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += lng_change;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

function TrackingGoongMap({ workerLocation, destination, workerInfo }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver;

    const ensureGoongAssets = () => new Promise((resolve, reject) => {
      if (window.goongjs) {
        resolve(window.goongjs);
        return;
      }

      if (!document.querySelector(`link[href="${GOONG_CSS_URL}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = GOONG_CSS_URL;
        document.head.appendChild(link);
      }

      const existingScript = document.querySelector(`script[src="${GOONG_JS_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.goongjs), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = GOONG_JS_URL;
      script.async = true;
      script.onload = () => resolve(window.goongjs);
      script.onerror = reject;
      document.body.appendChild(script);
    });

    const resizeMap = () => {
      if (!containerRef.current || !mapRef.current) return;
      mapRef.current.resize();
    };

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const [configResponse, goongjs] = await Promise.all([
        fetch('/api/goong/map-config'),
        ensureGoongAssets(),
      ]);
      const config = await configResponse.json();

      if (cancelled || !config.maptilesKey || !goongjs || !containerRef.current) return;

      const center = workerLocation || destination || DEFAULT_MAP_CENTER;
      goongjs.accessToken = config.maptilesKey;
      mapRef.current = new goongjs.Map({
        container: containerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center,
        zoom: workerLocation && destination ? 13 : 15,
      });

      mapRef.current.on('error', (event) => {
        if (event?.error?.message?.includes('Source layer "trees" does not exist')) return;
        console.warn('Goong map warning:', event?.error || event);
      });

      mapRef.current.on('styleimagemissing', (event) => {
        if (!event?.id || mapRef.current?.hasImage(event.id)) return;
        const size = 16;
        mapRef.current.addImage(event.id, {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),
        });
      });

      workerMarkerRef.current = new goongjs.Marker(createMarkerElement({
        variant: 'worker',
        icon: 'two_wheeler',
        label: workerInfo?.fullName ? workerInfo.fullName.split(' ').slice(-2).join(' ') : 'Thợ',
        imageUrl: workerInfo?.avatarUrl,
      }));

      destinationMarkerRef.current = new goongjs.Marker(createMarkerElement({ variant: 'destination', icon: 'home_pin', label: 'Bạn' }));

      if (workerLocation) {
        workerMarkerRef.current.setLngLat(workerLocation).addTo(mapRef.current);
      }

      if (destination) {
        destinationMarkerRef.current.setLngLat(destination).addTo(mapRef.current);
      }

      mapRef.current.on('load', () => {
        resizeMap();
        setMapLoaded(true);
      });
      resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(containerRef.current);
      requestAnimationFrame(resizeMap);
      [120, 300, 700].forEach((delay) => window.setTimeout(resizeMap, delay));
    }

    initMap().catch((error) => console.warn('Failed to initialize Goong map:', error));

    return () => {
      cancelled = true;
      setMapLoaded(false);
      setRouteGeometry(null);
      resizeObserver?.disconnect();
      workerMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      mapRef.current?.remove();
      workerMarkerRef.current = null;
      destinationMarkerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (workerLocation) {
      workerMarkerRef.current?.setLngLat(workerLocation).addTo(mapRef.current);
    } else {
      workerMarkerRef.current?.remove();
    }

    if (destination) {
      destinationMarkerRef.current?.setLngLat(destination).addTo(mapRef.current);
    } else {
      destinationMarkerRef.current?.remove();
    }

    mapRef.current.resize();

    if (workerLocation && destination) {
      const minLng = Math.min(workerLocation[0], destination[0]);
      const maxLng = Math.max(workerLocation[0], destination[0]);
      const minLat = Math.min(workerLocation[1], destination[1]);
      const maxLat = Math.max(workerLocation[1], destination[1]);
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 70, maxZoom: 15, duration: 700 });
    } else if (workerLocation || destination) {
      mapRef.current.flyTo({ center: workerLocation || destination, zoom: 15, essential: true });
    }
  }, [workerLocation?.[0], workerLocation?.[1], destination?.[0], destination?.[1]]);

  // 1. Fetch route line from Goong Trip API
  useEffect(() => {
    if (!workerLocation || !destination) {
      setRouteGeometry(null);
      return;
    }

    let active = true;
    async function getRoute() {
      try {
        const originStr = `${workerLocation[1]},${workerLocation[0]}`;
        const destStr = `${destination[1]},${destination[0]}`;
        const res = await goongApi.trip({
          origin: originStr,
          destination: destStr,
          vehicle: 'bike',
          roundtrip: 'false',
        });
        if (!active) return;
        const geom = res?.trips?.[0]?.geometry || null;
        setRouteGeometry(geom);
      } catch (err) {
        console.warn('Failed to load map route path:', err);
      }
    }
    getRoute();

    return () => {
      active = false;
    };
  }, [workerLocation?.[0], workerLocation?.[1], destination?.[0], destination?.[1]]);

  // 2. Draw or update the route line layer on Goong Map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const mapInstance = mapRef.current;

    if (!routeGeometry) {
      if (mapInstance.getLayer('route-line')) {
        mapInstance.removeLayer('route-line');
      }
      if (mapInstance.getSource('route')) {
        mapInstance.removeSource('route');
      }
      return;
    }

    let coordinates = decodePolyline(routeGeometry);
    if (coordinates.length > 0 && workerLocation && destination) {
      coordinates = [
        [workerLocation[0], workerLocation[1]],
        ...coordinates,
        [destination[0], destination[1]]
      ];
    }

    if (mapInstance.getSource('route')) {
      mapInstance.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    } else {
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      mapInstance.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF8228',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
  }, [routeGeometry, mapLoaded, workerLocation?.[0], workerLocation?.[1], destination?.[0], destination?.[1]]);

  return (
    <div className="relative h-[260px] overflow-hidden bg-slate-100 md:h-[320px]">
      <div ref={containerRef} className="absolute inset-0 h-full w-full [&_.goongjs-canvas]:!h-full [&_.goongjs-canvas]:!w-full [&_.mapboxgl-canvas]:!h-full [&_.mapboxgl-canvas]:!w-full" />
    </div>
  );
}

export function BookingDetailsView({ bookingId }) {
  const { message } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' or 'vnpay'
  const [paying, setPaying] = useState(false);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null); // Selected eligible voucher object
  const [voucherError, setVoucherError] = useState('');
  const [eligibleVouchers, setEligibleVouchers] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [proposalActing, setProposalActing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [bookingReview, setBookingReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [geocodedAddress, setGeocodedAddress] = useState(null);
  const reviewImagesRef = useRef([]);

  const statusKey = getBookingStatusKey(booking?.status);

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [supportTicket, setSupportTicket] = useState({
    open: false,
    category: SUPPORT_CATEGORY.DISPUTE,
    priority: SUPPORT_PRIORITY.HIGH,
    subject: '',
    description: '',
    contextLabel: '',
  });
  const messagesEndRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setTimeout(() => {
        setToken(storedToken);
      }, 0);
    }
  }, []);

  const handleIncomingMessage = useCallback((msg) => {
    if (msg.bookingId !== bookingId) return;

    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const sorted = [...prev, msg].sort((a, b) => {
        const dateA = parseBackendDate(a.createdDate || a.createdAt);
        const dateB = parseBackendDate(b.createdDate || b.createdAt);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
      return sorted;
    });

    if (chatOpen) {
      bookingApi.markChatRead(bookingId).catch(() => {});
    }
  }, [bookingId, chatOpen]);

  const isChatActive = booking && ['confirmed', 'traveling', 'arrived', 'inprogress', 'pendingpayment'].includes(statusKey);
  const shouldConnectChatHub = chatOpen && isChatActive;
  const { isConnected } = useChatHub(bookingId, token, handleIncomingMessage, shouldConnectChatHub);

  const openSupportTicket = ({
    category = SUPPORT_CATEGORY.DISPUTE,
    priority = SUPPORT_PRIORITY.HIGH,
    subject = 'Báo cáo vấn đề đặt lịch',
    description = '',
    contextLabel = 'Ticket sẽ được gắn với booking hiện tại để đội hỗ trợ kiểm tra nhanh hơn.',
  } = {}) => {
    setSupportTicket({ open: true, category, priority, subject, description, contextLabel });
  };

  useEffect(() => {
    reviewImagesRef.current = reviewImages;
  }, [reviewImages]);

  useEffect(() => {
    return () => {
      reviewImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  // Fetch Booking Detail
  const fetchBooking = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await bookingApi.getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
      if (showLoading) {
        message.error(error.response?.data?.message || error.message || 'Không thể tải chi tiết đặt lịch.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch Wallet Balance for payment
  const fetchWallet = async () => {
    try {
      const data = await walletApi.getWallet();
      setWallet(data);
    } catch (err) {
      console.warn('Failed to load wallet:', err);
    }
  };

  const fetchBookingReview = async () => {
    if (!bookingId || statusKey !== 'completed') return;
    setLoadingReview(true);
    try {
      const data = await reviewApi.getByBookingId(bookingId);
      setBookingReview(data || null);
    } catch {
      setBookingReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const fetchTracking = async () => {
    if (!bookingId) return;
    try {
      const data = await bookingApi.getTracking(bookingId);
      setTracking(data || null);
    } catch (error) {
      console.warn('Failed to load tracking:', error);
    }
  };

  // Chat message loading
  const loadChatMessages = async () => {
    if (!bookingId) return;
    try {
      const response = await bookingApi.getChatMessages(bookingId, {
        PageNumber: 1,
        PageSize: 100,
      });
      const items = response?.items || response?.data || response || [];
      // Sort messages oldest first
      const sorted = [...items].sort((a, b) => {
        const dateA = parseBackendDate(a.createdDate || a.createdAt);
        const dateB = parseBackendDate(b.createdDate || b.createdAt);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
      setChatMessages(sorted);
    } catch (error) {
      console.warn('Failed to load chat messages:', error);
    }
  };

  // Initial load
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      fetchBooking(true);
      fetchWallet();
      fetchTracking();
    });

    return () => {
      alive = false;
    };
  }, [bookingId]);

  // Load review when status is completed
  useEffect(() => {
    let alive = true;
    if (statusKey === 'completed') {
      queueMicrotask(() => {
        if (alive) {
          fetchBookingReview();
        }
      });
    }
    return () => {
      alive = false;
    };
  }, [bookingId, statusKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load eligible vouchers when status is pendingpayment
  useEffect(() => {
    if (statusKey === 'pendingpayment') {
      const loadEligible = async () => {
        setLoadingEligible(true);
        try {
          const list = await voucherApi.getEligible(bookingId);
          setEligibleVouchers(list || []);
        } catch (error) {
          console.warn('Failed to load eligible vouchers:', error);
        } finally {
          setLoadingEligible(false);
        }
      };
      loadEligible();
    }
  }, [bookingId, statusKey]);

  // Polling for live status updates & chat messages
  useEffect(() => {
    const liveStatusKey = getBookingStatusKey(booking?.status);
    const shouldPoll = !booking || ['pending', 'matching', 'confirmed', 'traveling', 'arrived', 'inprogress', 'pendingpayment'].includes(liveStatusKey);
    if (!shouldPoll) return undefined;

    const interval = setInterval(() => {
      fetchBooking(false);
      if (chatOpen && !isConnected) {
        loadChatMessages();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [bookingId, booking?.status, chatOpen, isConnected]);

  useEffect(() => {
    const liveStatusKey = getBookingStatusKey(booking?.status);
    if (!['traveling', 'arrived'].includes(liveStatusKey)) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (alive) fetchTracking();
    });
    const interval = setInterval(fetchTracking, 7000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [bookingId, booking?.status]);

  useEffect(() => {
    let alive = true;
    const address = booking?.address?.trim();

    if (!address) {
      queueMicrotask(() => {
        if (alive) setGeocodedAddress(null);
      });
      return undefined;
    }

    async function normalizeAddress() {
      try {
        const payload = await goongApi.geocode({
          address,
          limit: 1,
          has_deprecated_administrative_unit: true,
        });
        const result = payload?.results?.[0] || null;
        if (!alive) return;
        setGeocodedAddress(result);
      } catch (error) {
        if (!alive) return;
        console.warn('Failed to normalize booking address:', error);
        setGeocodedAddress(null);
      }
    }

    normalizeAddress();
    return () => {
      alive = false;
    };
  }, [booking?.address]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Open chat drawer
  const handleOpenChat = () => {
    if (statusKey === 'pending' || statusKey === 'matching') {
      message.warning('Vui lòng đợi kỹ thuật viên nhận lịch để có thể nhắn tin.');
      return;
    }
    setChatOpen(true);
    loadChatMessages();
    // Mark messages as read
    bookingApi.markChatRead(bookingId).catch(() => { });
  };

  // Send text chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text || sendingMessage) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('Type', '0'); // Text type
      formData.append('Content', text);

      await bookingApi.sendChatMessage(bookingId, formData);
      setChatText('');
      await loadChatMessages();
    } catch {
      message.error('Không thể gửi tin nhắn.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Send image chat message
  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || sendingMessage) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('Type', '1'); // Image type
      formData.append('File', file);

      await bookingApi.sendChatMessage(bookingId, formData);
      await loadChatMessages();
    } catch {
      message.error('Không thể gửi hình ảnh.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Accept proposal
  const handleRespondProposal = async (accept) => {
    setProposalActing(true);
    try {
      await bookingApi.respondProposal(bookingId, { accept, rejectReason: accept ? null : 'Khách hàng không đồng ý đề xuất.' });
      message.success(accept ? 'Đã đồng ý đề xuất.' : 'Đã từ chối đề xuất.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể phản hồi đề xuất.');
    } finally {
      setProposalActing(false);
    }
  };

  // Voucher
  const handleApplyVoucher = async (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : voucherCode).trim().toUpperCase();
    if (!code) {
      setVoucherError('Vui lòng nhập mã voucher.');
      return;
    }
    setVoucherError('');
    setVoucherApplying(true);
    try {
      let list = eligibleVouchers;
      if (list.length === 0) {
        list = await voucherApi.getEligible(bookingId);
        setEligibleVouchers(list || []);
      }
      
      const found = list.find(v => v.code.toUpperCase() === code);
      if (found) {
        if (!found.isEligible) {
          throw new Error(formatIneligibleReason(found.ineligibleReason) || 'Voucher không đủ điều kiện sử dụng.');
        }
        setSelectedVoucher(found);
        setVoucherCode(code);
        setVoucherModalOpen(false);
        message.success(`Đã chọn voucher: ${code}. Chi tiết giảm giá hiển thị ở phần Chi phí.`);
      } else {
        throw new Error('Mã voucher không tồn tại hoặc không áp dụng cho đơn này.');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Mã voucher không hợp lệ.';
      setVoucherError(errMsg);
      if (typeof codeToApply === 'string') {
        message.error(errMsg);
      }
    } finally {
      setVoucherApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setSelectedVoucher(null);
    setVoucherError('');
  };

  // Payment process
  const handleProcessPayment = async () => {
    setPaying(true);
    try {
      if (selectedVoucher) {
        try {
          await voucherApi.apply({ code: selectedVoucher.code, bookingId });
        } catch (voucherError) {
          const errMsg = voucherError.response?.data?.message || voucherError.message || 'Không thể áp dụng voucher này.';
          message.error(`Lỗi áp dụng voucher: ${errMsg}`);
          setPaying(false);
          return;
        }
      }

      if (paymentMethod === 'wallet') {
        const baseTotal = booking?.totalAmount || booking?.estimatedPrice || booking?.finalPrice || 0;
        const discount = selectedVoucher ? selectedVoucher.calculatedDiscount : 0;
        const total = Math.max(0, baseTotal - discount);
        
        if (wallet && wallet.balance < total) {
          message.warning('Số dư ví không đủ. Vui lòng nạp thêm tiền hoặc chọn VNPay.');
          setPaying(false);
          return;
        }
        await paymentApi.payBookingWithWallet(bookingId);
        message.success('Thanh toán bằng ví thành công.');
        await fetchBooking(true);
      } else if (paymentMethod === 'vnpay') {
        const { paymentUrl } = await paymentApi.createBookingVnpayPayment(bookingId);
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          throw new Error('Không nhận được liên kết thanh toán từ VNPAY.');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Thanh toán thất bại.');
    } finally {
      setPaying(false);
    }
  };

  const handleReviewImagesChange = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    setReviewImages((current) => {
      const next = [
        ...current,
        ...files.map((file) => ({
          file,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        })),
      ].slice(0, 6);

      current.forEach((image) => {
        if (!next.includes(image)) URL.revokeObjectURL(image.previewUrl);
      });
      return next;
    });
    event.target.value = '';
  };

  const handleRemoveReviewImage = (index) => {
    setReviewImages((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      message.warning('Vui lòng chọn số sao đánh giá.');
      return;
    }

    setReviewSubmitting(true);
    try {
      await reviewApi.createReview(bookingId, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImages.map((image) => image.file),
      });
      message.success('Đã gửi đánh giá dịch vụ.');
      setReviewComment('');
      setReviewRating(0);
      setReviewImages((current) => {
        current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
      await fetchBookingReview();
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi đánh giá.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Status mapping
  const statusMeta = STATUS_CONFIGS[statusKey] || STATUS_CONFIGS.pending;
  const technician = booking?.worker || booking?.technician || (
    booking?.workerName || booking?.workerFullName
      ? {
        fullName: booking.workerName || booking.workerFullName,
        avatar: booking.workerAvatarUrl || booking.workerAvatar || null,
        phone: booking.workerPhone || booking.workerPhoneNumber || null,
      }
      : null
  );
  const isProposed = booking?.workerProposedPrice && booking?.workerProposedPrice > 0;
  const hasProposal = statusKey === 'pending' && isProposed;

  const totalAmount = booking?.totalAmount || booking?.finalPrice || booking?.estimatedPrice || 0;
  const discountAmount = selectedVoucher ? selectedVoucher.calculatedDiscount : 0;
  const finalTotalAmount = Math.max(0, totalAmount - discountAmount);
  const hasWorkerLocation = Boolean(
    tracking?.workerLat
    && tracking?.workerLng
    && Number(tracking.workerLat) !== 0
    && Number(tracking.workerLng) !== 0,
  );
  const workerMapLocation = hasWorkerLocation
    ? [Number(tracking.workerLng), Number(tracking.workerLat)]
    : null;
  const destinationMapLocation = booking?.lat && booking?.lng && Number(booking.lat) !== 0 && Number(booking.lng) !== 0
    ? [Number(booking.lng), Number(booking.lat)]
    : null;
  const displayAddress = geocodedAddress?.formatted_address || booking?.address || 'Chưa cập nhật địa chỉ';
  const addressCompound = geocodedAddress?.compound
    ? [geocodedAddress.compound.commune, geocodedAddress.compound.province].filter(Boolean).join(', ')
    : '';
  const trackerProgressClass = statusKey === 'completed'
    ? 'w-[80%]'
    : ['inprogress', 'arrived'].includes(statusKey)
      ? 'w-[54%]'
      : statusKey === 'traveling'
        ? 'w-[27%]'
        : 'w-0';
  // Stepper config for live tracking
  const trackerSteps = [
    { label: 'Xác nhận', icon: 'check_circle', active: ['confirmed', 'traveling', 'arrived', 'inprogress', 'completed'].includes(statusKey), completed: ['traveling', 'arrived', 'inprogress', 'completed'].includes(statusKey) },
    { label: 'Đang đến', icon: 'moped', active: ['traveling', 'arrived', 'inprogress', 'completed'].includes(statusKey), completed: ['arrived', 'inprogress', 'completed'].includes(statusKey) },
    { label: 'Thực hiện', icon: 'build', active: ['inprogress', 'completed'].includes(statusKey), completed: ['completed'].includes(statusKey) },
    { label: 'Hoàn thành', icon: 'verified', active: statusKey === 'completed', completed: statusKey === 'completed' },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] py-16 font-montserrat text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#FF8228]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#FF8228] animate-spin">sync</span>
          </div>
          <p className="text-sm font-semibold text-[#818A91]">Đang tải chi tiết đặt lịch...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-[800px] py-12 px-4 font-montserrat">
        <div className="rounded-2xl border-2 border-dashed border-[#dec0b1]/30 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#818A91] mb-3">search_off</span>
          <p className="font-bold text-[#1b1c1c] text-lg mb-2">Không tìm thấy yêu cầu đặt lịch</p>
          <p className="text-sm text-[#818A91] mb-6">Yêu cầu này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link href="/bookings" className="inline-flex items-center gap-2 rounded-xl bg-[#FF8228] px-6 py-2.5 font-bold text-white shadow-md hover:brightness-105 no-underline transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Lịch sử đặt lịch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 font-montserrat text-[#1b1c1c] min-h-screen">

      {/* Header bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/bookings')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-[#F5F5F5] transition-all"
          >
            <span className="material-symbols-outlined text-[#1b1c1c]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Chi tiết đặt lịch</h1>
            <p className="text-xs font-semibold text-[#818A91] mt-0.5">Mã đặt lịch: #{booking.code || booking.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openSupportTicket()}
            className="inline-flex items-center gap-2 rounded-full border border-[#FF8228]/40 bg-white px-4 py-2 text-xs font-bold text-[#FF8228] shadow-sm transition-all hover:bg-[#FFF4ED]"
          >
            <span className="material-symbols-outlined text-[16px]">report</span>
            Báo cáo vấn đề
          </button>
          <div className={`flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${statusMeta.color} shadow-sm`}>
            <span className="material-symbols-outlined text-[16px]">{statusMeta.icon}</span>
            <span>{statusMeta.label}</span>
          </div>
        </div>
      </div>

      {/* Stepper for Traveling -> Arrived -> InProgress -> Completed */}
      {['confirmed', 'traveling', 'arrived', 'inprogress', 'completed'].includes(statusKey) && (
        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-6">Trạng thái công việc</h2>
          <div className="relative flex justify-between items-center w-full max-w-[800px] mx-auto overflow-x-auto py-2">
            <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-100 -z-10" />
            <div
              className={`absolute top-[28px] left-[10%] h-[2px] bg-[#39B54A] -z-10 transition-all duration-700 ${trackerProgressClass}`}
            />
            {trackerSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[70px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.completed ? 'bg-[#39B54A] text-white shadow-md' :
                  step.active ? 'bg-[#FF8228] text-white ring-4 ring-[#FF8228]/20 shadow-md' :
                    'bg-white border-2 border-slate-200 text-[#818A91]'
                  }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {step.completed ? 'check' : step.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 ${step.completed ? 'text-[#39B54A]' :
                  step.active ? 'text-[#FF8228]' :
                    'text-[#818A91]'
                  }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {['traveling', 'arrived'].includes(statusKey) && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#FF8228]/15 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF8228]/10 text-[#FF8228]">
                <span className="material-symbols-outlined text-[28px]">near_me</span>
              </div>
              <div>
                <h2 className="m-0 text-base font-extrabold text-[#1b1c1c]">Theo dõi vị trí thợ</h2>
                <p className="m-0 mt-1 text-xs leading-relaxed text-[#818A91]">
                  {hasWorkerLocation
                    ? `Cập nhật lần cuối: ${formatDate(tracking.locationUpdatedAt)}`
                    : 'Đang chờ thợ bật chia sẻ vị trí. Vị trí 0,0 sẽ không được hiển thị.'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${hasWorkerLocation ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-[#818A91]'
              }`}>
              <span className="material-symbols-outlined text-[16px]">
                {hasWorkerLocation ? 'gps_fixed' : 'gps_off'}
              </span>
              {hasWorkerLocation ? 'Đang có tín hiệu' : 'Chưa có vị trí'}
            </div>
          </div>

          <TrackingGoongMap workerLocation={workerMapLocation} destination={destinationMapLocation} workerInfo={tracking?.workerInfo} />

          <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-3">
            <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91]">Kỹ thuật viên</span>
              <p className="mt-1 text-sm font-extrabold text-[#1b1c1c]">{tracking?.workerInfo?.fullName || booking.workerName || 'Kỹ thuật viên'}</p>
              <p className="mt-1 text-xs font-semibold text-[#818A91]">Số điện thoại bảo mật</p>
            </div>
            <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91]">Tọa độ hiện tại</span>
              <p className="mt-1 text-sm font-extrabold text-[#1b1c1c]">
                {hasWorkerLocation
                  ? `${Number(tracking.workerLat).toFixed(6)}, ${Number(tracking.workerLng).toFixed(6)}`
                  : 'Chưa khả dụng'}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-[#818A91]">{displayAddress}</p>
              {hasWorkerLocation && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${tracking.workerLat},${tracking.workerLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#FF8228] no-underline hover:underline"
                >
                  Mở bản đồ
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91]">Điểm đến</span>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[#1b1c1c]">{displayAddress}</p>
              {addressCompound && <p className="mt-1 text-xs font-semibold text-[#818A91]">{addressCompound}</p>}
              {/* {geocodedAddress?.deprecated_description && geocodedAddress.deprecated_description !== displayAddress && (
                <p className="mt-2 rounded-lg bg-[#FFF4ED] px-3 py-2 text-[11px] font-semibold leading-relaxed text-[#A85B23]">
                  TÃªn cÅ©: {geocodedAddress.deprecated_description}
                </p>
              )} */}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Left column (8 cols) */}
        <div className="space-y-6 lg:col-span-8">

          {/* Proposal Notification (Negotiation Sub-state) */}
          {hasProposal && (
            <article className="rounded-2xl border border-[#FF8228]/20 bg-[#FF8228]/5 p-6 shadow-md animate-fade-in">
              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF8228]/10 text-[#FF8228]">
                  <span className="material-symbols-outlined text-[28px]">handshake</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#FF8228]">Đề xuất mới từ thợ</h3>
                  <p className="text-xs text-[#818A91] mt-0.5">Kỹ thuật viên muốn thương lượng lại chi phí hoặc thời gian đặt lịch.</p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-white p-4 border border-[#dec0b1]/20">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Giá đề xuất</span>
                      <span className="text-lg font-black text-[#FF8228]">{formatCurrency(booking.workerProposedPrice)}</span>
                      {booking.estimatedPrice && (
                        <span className="text-xs text-slate-400 block line-through">Giá gốc: {formatCurrency(booking.estimatedPrice)}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Thời gian đề xuất</span>
                      <span className="text-sm font-bold text-[#1b1c1c]">{formatDate(booking.workerProposedTime)}</span>
                    </div>
                    {booking.workerProposedNote && (
                      <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Ghi chú từ thợ</span>
                        <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed italic">&quot;{booking.workerProposedNote}&quot;</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      disabled={proposalActing}
                      onClick={() => handleRespondProposal(true)}
                      className="flex-1 rounded-xl bg-[#39B54A] py-2.5 font-bold text-white text-xs hover:brightness-105 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      Đồng ý đề xuất
                    </button>
                    <button
                      type="button"
                      disabled={proposalActing}
                      onClick={() => handleRespondProposal(false)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 font-bold text-xs text-rose-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Pending Payment Card */}
          {statusKey === 'pendingpayment' && (
            <article className="rounded-2xl border border-rose-100 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <h3 className="text-base font-bold">Thanh toán đặt lịch</h3>
              </div>
              <p className="text-xs text-[#818A91] mb-5">Vui lòng chọn phương thức thanh toán bên dưới để xác nhận công việc này.</p>

              <button
                type="button"
                onClick={() => openSupportTicket({
                  category: SUPPORT_CATEGORY.PAYMENT,
                  priority: SUPPORT_PRIORITY.HIGH,
                  subject: 'Cần hỗ trợ thanh toán booking',
                  description: `Tôi cần hỗ trợ thanh toán cho booking #${String(bookingId).slice(0, 8).toUpperCase()}.`,
                  contextLabel: 'Dành cho lỗi ví, voucher hoặc cổng thanh toán của booking này.',
                })}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#FF8228]/30 bg-[#FFF8F5] px-4 py-2 text-xs font-bold text-[#FF8228] transition-all hover:bg-[#FFF0E6]"
              >
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                Báo lỗi thanh toán
              </button>

              {/* Voucher input */}
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#818A91] mb-2">
                  <span className="material-symbols-outlined text-[15px] text-[#FF8228]">local_activity</span>
                  Mã Voucher / Khuyến mãi
                </label>

                {selectedVoucher ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider truncate">{selectedVoucher.code}</p>
                      {selectedVoucher.calculatedDiscount > 0 && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">Sẽ giảm {formatCurrency(selectedVoucher.calculatedDiscount)} (áp dụng khi thanh toán)</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100 text-emerald-500 transition-colors shrink-0"
                      title="Xóa voucher"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        if (voucherError) setVoucherError('');
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleApplyVoucher(); }}
                      placeholder="Nhập mã voucher..."
                      disabled={voucherApplying}
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1b1c1c] placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 outline-none focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/15 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={voucherApplying || !voucherCode.trim()}
                      className="shrink-0 px-3.5 py-2.5 rounded-xl bg-[#FF8228] text-white text-xs font-bold hover:brightness-105 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {voucherApplying ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                )}

                {voucherError && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {voucherError}
                  </p>
                )}

                {!selectedVoucher && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setVoucherModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8228] hover:text-[#E66F18] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">local_activity</span>
                      {loadingEligible ? 'Đang tải voucher...' : `Chọn voucher từ kho (${eligibleVouchers.filter(v => v.isEligible).length} khả dụng)`}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${paymentMethod === 'wallet' ? 'border-[#FF8228] bg-[#FF8228]/5 shadow-sm' : 'border-slate-200 hover:border-[#FF8228]/40'
                    }`}
                >
                  <span className="material-symbols-outlined text-[#FF8228]">account_balance_wallet</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-[#1b1c1c]">Ví của tôi</span>
                    <span className="block text-[10px] text-[#818A91] mt-0.5">Số dư:  {formatCurrency(wallet?.balance || 0)}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'wallet' ? 'border-[#FF8228]' : 'border-slate-300'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8228]" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${paymentMethod === 'vnpay' ? 'border-[#FF8228] bg-[#FF8228]/5 shadow-sm' : 'border-slate-200 hover:border-[#FF8228]/40'
                    }`}
                >
                  <span className="material-symbols-outlined text-[#FF8228]">account_balance</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-[#1b1c1c]">VNPAY Gateway</span>
                    <span className="block text-[10px] text-[#818A91] mt-0.5">Thẻ ATM/QR Code</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'vnpay' ? 'border-[#FF8228]' : 'border-slate-300'}`}>
                    {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8228]" />}
                  </div>
                </button>
              </div>

              {paymentMethod === 'wallet' && wallet && wallet.balance < finalTotalAmount && (
                <div className="mb-5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Ví không đủ số dư để thanh toán ({formatCurrency(finalTotalAmount)}). Vui lòng nạp thêm hoặc chọn VNPAY.</span>
                </div>
              )}

              <button
                type="button"
                disabled={paying || (paymentMethod === 'wallet' && wallet && wallet.balance < finalTotalAmount)}
                onClick={handleProcessPayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF8228] py-3 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? 'Đang thanh toán...' : paymentMethod === 'wallet' ? 'Xác nhận thanh toán bằng ví' : 'Thanh toán qua VNPAY'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </article>
          )}

          {/* Job Details Card */}
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-4">Thông tin dịch vụ</h2>

            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4ED] text-[#FF8228]">
                <span className="material-symbols-outlined text-[28px]">home_repair_service</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-base md:text-lg">{booking.categoryName || booking.category?.name || 'Yêu cầu dịch vụ'}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#4A4A4A] whitespace-pre-line">{booking.description || 'Không có mô tả chi tiết'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Ngày đặt lịch</span>
                <p className="font-bold text-sm text-[#1b1c1c] mt-0.5">{formatDate(booking.scheduledAt || booking.createdDate)}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Địa điểm nhận thợ</span>
                <p className="font-bold text-sm text-[#1b1c1c] mt-0.5 leading-relaxed">{displayAddress}</p>
                {addressCompound && <p className="mt-1 text-xs font-semibold text-[#818A91]">{addressCompound}</p>}
                {/* {geocodedAddress?.deprecated_description && geocodedAddress.deprecated_description !== displayAddress && (
                  <p className="mt-2 rounded-lg bg-[#FFF4ED] px-3 py-2 text-[11px] font-semibold leading-relaxed text-[#A85B23]">
                    TÃªn cÅ©: {geocodedAddress.deprecated_description}
                  </p>
                )} */}
              </div>
            </div>

            {/* Request Photos */}
            {booking.media && booking.media.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block mb-3">Hình ảnh mô tả sự cố</span>
                <AntImage.PreviewGroup>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {booking.media.map((med) => (
                      <div key={med.id || med.fileUrl} className="group aspect-square overflow-hidden rounded-xl border border-slate-200 bg-[#F5F5F5]">
                        <AntImage
                          src={med.fileUrl || med.url}
                          alt="Ảnh mô tả"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          preview={{ mask: 'Xem ảnh' }}
                        />
                      </div>
                    ))}
                  </div>
                </AntImage.PreviewGroup>
              </div>
            )}
          </article>

          {/* Completion Proof Photos Card */}
          {statusKey === 'completed' && booking.media && (
            <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#39B54A]">
                  <span className="material-symbols-outlined">photo_library</span>
                </div>
                <h3 className="text-base font-bold text-[#39B54A]">Ảnh nghiệm thu công việc</h3>
              </div>

              <AntImage.PreviewGroup>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {booking.media
                    .filter((med) => med.category === MEDIA_CATEGORY.COMPLETION || med.category === 4)
                    .map((med) => (
                      <div key={med.id || med.fileUrl} className="group aspect-square overflow-hidden rounded-xl border border-slate-200 bg-[#F5F5F5]">
                        <AntImage
                          src={med.fileUrl || med.url}
                          alt="Ảnh hoàn thành"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          preview={{ mask: 'Xem ảnh' }}
                        />
                      </div>
                    ))}
                </div>
              </AntImage.PreviewGroup>

              {booking.media.filter((med) => med.category === MEDIA_CATEGORY.COMPLETION || med.category === 4).length === 0 && (
                <p className="text-xs text-[#818A91] italic">Không có ảnh nghiệm thu được lưu.</p>
              )}
            </article>
          )}

        </div>

        {/* Right column (4 cols) */}
        <div className="space-y-6 lg:col-span-4">

          {/* Billing Summary */}
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-4">Chi tiết chi phí</h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-[#4A4A4A]">
                <span>Phí dịch vụ cơ bản</span>
                <span className="font-semibold">{formatCurrency(booking.basePrice || booking.estimatedPrice)}</span>
              </div>
              {isProposed && (
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Giá thợ đề xuất</span>
                  <span className="font-semibold text-[#FF8228] bg-orange-50 px-2 py-0.5 rounded-md">{formatCurrency(booking.workerProposedPrice)}</span>
                </div>
              )}
              {selectedVoucher && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold text-xs">
                  <span>Giảm giá ({selectedVoucher.code})</span>
                  <span>-{formatCurrency(selectedVoucher.calculatedDiscount)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-800">Tổng cộng</span>
                <span className="text-xl font-black text-[#FF8228]">{formatCurrency(finalTotalAmount)}</span>
              </div>
            </div>

          </article>

          {statusKey === 'completed' && (
            <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8228]/10 text-[#FF8228]">
                  <span className="material-symbols-outlined">rate_review</span>
                </div>
                <div>
                  <h2 className="m-0 text-sm font-extrabold text-[#1b1c1c]">Đánh giá dịch vụ</h2>
                  <p className="m-0 mt-0.5 text-xs text-[#818A91]">Chia sẻ trải nghiệm sau khi hoàn thành.</p>
                </div>
              </div>

              {loadingReview ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-semibold text-[#818A91]">Đang tải đánh giá...</div>
              ) : bookingReview ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#dec0b1]/20 bg-[#FFF8F3] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-sm font-extrabold text-[#1b1c1c]">{bookingReview.customer?.fullName || 'Đánh giá của bạn'}</p>
                        <p className="m-0 mt-1 text-xs text-[#818A91]">{formatDate(bookingReview.createdDate || bookingReview.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[#FF8228] shadow-sm">
                        <span className="material-symbols-outlined text-[16px] material-symbols-filled">star</span>
                        <span className="text-xs font-black">{Number(bookingReview.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    {bookingReview.comment && <p className="m-0 text-sm leading-relaxed text-[#4A4A4A]">{bookingReview.comment}</p>}

                    {!!bookingReview.images?.length && (
                      <AntImage.PreviewGroup>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {bookingReview.images.map((image) => {
                            const url = image.fileUrl || image.url;
                            if (!url) return null;
                            return (
                              <div key={image.id || url} className="aspect-square overflow-hidden rounded-lg border border-white bg-slate-50">
                                <AntImage src={url} alt="Ảnh đánh giá" className="h-full w-full object-cover" preview={{ mask: 'Xem' }} />
                              </div>
                            );
                          })}
                        </div>
                      </AntImage.PreviewGroup>
                    )}
                  </div>

                  {bookingReview.workerReply ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="m-0 text-xs font-bold uppercase tracking-wider text-emerald-600">Phản hồi từ kỹ thuật viên</p>
                      <p className="m-0 mt-2 text-sm leading-relaxed text-[#1b1c1c]">{bookingReview.workerReply}</p>
                      {(bookingReview.repliedAt || bookingReview.repliedDate) && <p className="m-0 mt-2 text-[11px] text-[#818A91]">{formatDate(bookingReview.repliedAt || bookingReview.repliedDate)}</p>}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-[#818A91]">
                      Kỹ thuật viên chưa phản hồi đánh giá này.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-5 flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95"
                        aria-label={`${star} sao`}
                      >
                        <span className={`material-symbols-outlined text-[34px] ${(reviewHoverRating || reviewRating) >= star ? 'text-[#FF8228]' : 'text-slate-300'}`}>
                          star
                        </span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition-all focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/15"
                    placeholder="Nhận xét về thái độ, chất lượng và thời gian xử lý..."
                  />

                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Ảnh đánh giá</p>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#FF8228] px-3 py-1.5 text-xs font-bold text-[#FF8228] transition-all hover:bg-[#FF8228]/5">
                        <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                        Thêm ảnh
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleReviewImagesChange} />
                      </label>
                    </div>

                    {reviewImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {reviewImages.map((image, index) => (
                          <div key={image.previewUrl} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveReviewImage(index)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-sm"
                              aria-label="Xóa ảnh"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={reviewSubmitting}
                    onClick={handleSubmitReview}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8228] py-3 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </>
              )}
            </article>
          )}

          {/* Technician Info */}
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-4">Kỹ thuật viên phụ trách</h2>

            {technician ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={technician.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6BDEHEz7H6UzRq5va4XltTBkQl6L_LC4FNAHi2Ak5vGY72Qvl64jJOJNFb1gPziJN0ujIQT2M-ouDjr9TTOEarYTqKbTuI9ZO4TgjTeG_ZK7ZDWzfKaQIyF2U8Qr1ry_Pb98eZHu4ViEQ024J0TQyMltzfn6P_RcCf_QjwNr98rK4cPSVM2nrEQVA8aqJ4k3K5nosdsW4B3QsTNm78rHm_0dPkdxTRDDM0taG5PBjpKXrsTQUp6iFaK-lXwD2KAVGuV2s5S-MBJ8'}
                      alt={technician.fullName || 'Thợ'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#39B54A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-base truncate">{technician.fullName || technician.name || 'Kỹ thuật viên'}</h4>
                    <p className="text-xs text-[#818A91] mt-0.5">Số điện thoại bảo mật</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => message.info('Tính năng gọi ẩn danh đang được phát triển.')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-[#FF8228] text-[#FF8228] font-bold hover:bg-[#FF8228]/5 transition-all text-xs"
                  >
                    <span className="material-symbols-outlined text-lg">ring_volume</span>
                    <span>Gọi ẩn danh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    disabled={statusKey === 'pending' || statusKey === 'matching'}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={statusKey === 'pending' || statusKey === 'matching' ? "Chờ kỹ thuật viên chấp nhận lịch để nhắn tin" : ""}
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    <span>Nhắn tin</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_search</span>
                <p className="text-xs font-semibold text-[#818A91]">Đang tìm kiếm kỹ thuật viên phù hợp nhất...</p>
              </div>
            )}
          </article>

        </div>
      </div>

      {/* Floating / Slide-out Chat Drawer */}
      {chatOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] transition-opacity" onClick={() => setChatOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[100] flex flex-col animate-slide-in">

            {/* Chat header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">close</span>
                </button>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">{technician?.fullName || 'Hộp thoại thương lượng'}</h3>
                  <p className="text-[10px] text-[#818A91] mt-0.5">ID Đặt lịch #{bookingId.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 shadow-sm shrink-0">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-[10px] font-bold text-slate-500">{isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
              {chatMessages.map((msg, i) => {
                const isMe = msg.senderId === user?.userId;
                return (
                  <div key={i} className={`flex gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-auto">
                        <img
                          src={technician?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6BDEHEz7H6UzRq5va4XltTBkQl6L_LC4FNAHi2Ak5vGY72Qvl64jJOJNFb1gPziJN0ujIQT2M-ouDjr9TTOEarYTqKbTuI9ZO4TgjTeG_ZK7ZDWzfKaQIyF2U8Qr1ry_Pb98eZHu4ViEQ024J0TQyMltzfn6P_RcCf_QjwNr98rK4cPSVM2nrEQVA8aqJ4k3K5nosdsW4B3QsTNm78rHm_0dPkdxTRDDM0taG5PBjpKXrsTQUp6iFaK-lXwD2KAVGuV2s5S-MBJ8'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${isMe ? 'bg-[#FF8228] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                      }`}>
                      {msg.fileUrl && (
                        <div className="mb-2 max-w-[240px] overflow-hidden rounded-lg">
                          <img src={msg.fileUrl} alt="Hình đính kèm" className="w-full h-auto object-cover max-h-40" />
                        </div>
                      )}
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                      <span className={`block text-[8px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-[#818A91]'}`}>
                        {parseBackendDate(msg.createdDate || msg.createdAt)?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input footer */}
            {isChatActive ? (
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex shrink-0">
                    <label className="p-2 text-[#FF8228] hover:bg-orange-50 rounded-full cursor-pointer transition-colors" title="Gửi ảnh">
                      <span className="material-symbols-outlined text-[20px]">image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleSendImage} />
                    </label>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#FF8228] focus:border-[#FF8228] outline-none bg-slate-50 resize-none max-h-24"
                      placeholder="Nhập tin nhắn để thỏa thuận..."
                      rows={1}
                    />
                    <button type="submit" disabled={sendingMessage} className="absolute right-2.5 bottom-2 text-[#FF8228] disabled:opacity-50 transition-transform active:scale-95">
                      <span className="material-symbols-outlined text-[20px] material-symbols-filled">send</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                <p className="text-xs font-semibold text-slate-400">Cuộc hội thoại đã kết thúc</p>
              </div>
            )}

          </div>
        </>
      )}

      <SupportTicketModal
        open={supportTicket.open}
        onClose={() => setSupportTicket((current) => ({ ...current, open: false }))}
        bookingId={bookingId}
        defaultCategory={supportTicket.category}
        defaultPriority={supportTicket.priority}
        defaultSubject={supportTicket.subject}
        defaultDescription={supportTicket.description}
        contextLabel={supportTicket.contextLabel}
      />

      {/* Voucher Selection Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#FF8228] text-[22px]">local_activity</span>
            <span className="text-base font-black text-[#1b1c1c]">Kho Voucher Khuyến Mãi</span>
          </div>
        }
        open={voucherModalOpen}
        onCancel={() => setVoucherModalOpen(false)}
        footer={null}
        width={500}
        destroyOnHidden
        className="rounded-2xl overflow-hidden [&_.ant-modal-content]:!p-5 [&_.ant-modal-content]:!rounded-2xl"
      >
        <div className="py-2">
          <p className="text-xs text-[#818A91] mb-4">Danh sách các mã giảm giá áp dụng cho đơn dịch vụ này của bạn.</p>
          
          {loadingEligible ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              Đang tải danh sách voucher...
            </div>
          ) : eligibleVouchers.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <span className="material-symbols-outlined text-[32px] text-slate-300">sentiment_neutral</span>
              <p className="mt-2 text-xs font-bold text-slate-400">Không tìm thấy voucher khả dụng.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {eligibleVouchers.map((v) => {
                const isSelected = selectedVoucher?.code === v.code;
                return (
                  <div
                    key={v.id}
                    className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                      isSelected 
                        ? 'border-[#FF8228] bg-orange-50/20' 
                        : v.isEligible 
                          ? 'border-slate-200 hover:border-[#FF8228]/50 hover:bg-[#FFF8F4]/20 cursor-pointer'
                          : 'border-slate-100 bg-slate-50/50 opacity-70'
                    }`}
                    onClick={() => {
                      if (v.isEligible) {
                        handleApplyVoucher(v.code);
                      }
                    }}
                  >
                    {isSelected && (
                      <span className="absolute top-0 right-0 rounded-bl-lg bg-[#FF8228] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        Đang chọn
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center rounded bg-orange-50 border border-[#dec0b1]/30 px-2 py-0.5 text-xs font-black text-[#FF8228] uppercase tracking-wider">
                          {v.code}
                        </div>
                        
                        <p className="mt-2 text-xs font-bold text-slate-800 leading-snug">
                          {v.description || (v.type === 0 ? `Giảm ${v.value}%` : `Giảm ${formatCurrency(v.value)}`)}
                        </p>

                        <div className="mt-2 space-y-1 text-[10px] font-semibold text-[#818A91]">
                          {v.minOrderValue > 0 && (
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              Đơn tối thiểu: <span className="text-[#4A4A4A] font-bold">{formatCurrency(v.minOrderValue)}</span>
                            </p>
                          )}
                          {v.expiresAt && (
                            <p className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              Hạn dùng: <span className="text-[#4A4A4A] font-bold">{new Date(v.expiresAt).toLocaleDateString('vi-VN')}</span>
                            </p>
                          )}
                        </div>

                        {!v.isEligible && v.ineligibleReason && (
                          <div className="mt-3 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-500 flex items-start gap-1">
                            <span className="material-symbols-outlined text-[12px] shrink-0 mt-0.5">info</span>
                            <span>{formatIneligibleReason(v.ineligibleReason)}</span>
                          </div>
                        )}
                      </div>

                      {v.isEligible && (
                        <button
                          type="button"
                          className={`self-center rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-sm shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 text-white hover:brightness-105'
                              : 'bg-[#FF8228] text-white hover:brightness-105'
                          }`}
                        >
                          {isSelected ? 'Đã chọn' : 'Dùng ngay'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setVoucherModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-[#818A91] hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

const formatIneligibleReason = (reason) => {
  if (!reason) return '';
  const text = String(reason).toLowerCase();
  if (text.includes('already used') || text.includes('maximum number of times')) {
    return 'Bạn đã sử dụng voucher này tối đa số lần cho phép';
  }
  if (text.includes('minordervalue') || text.includes('minimum order')) {
    return 'Đơn hàng chưa đạt giá trị tối thiểu';
  }
  if (text.includes('category') || text.includes('service')) {
    return 'Voucher không áp dụng cho dịch vụ này';
  }
  if (text.includes('expired')) {
    return 'Voucher đã hết hạn';
  }
  if (text.includes('city')) {
    return 'Không áp dụng tại thành phố của bạn';
  }
  if (text.includes('first order')) {
    return 'Chỉ áp dụng cho đơn hàng đầu tiên';
  }
  return reason;
};
