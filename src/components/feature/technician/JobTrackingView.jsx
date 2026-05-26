'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { App, Image as AntImage } from 'antd';
import { bookingApi } from '@/apis/booking.api';
import { mediaApi } from '@/apis/media.api';
import { reviewApi } from '@/apis/review.api';
import { useAuth } from '@/hooks/useAuth';
import { useChatHub } from '@/hooks/useChatHub';
import { MEDIA_CATEGORY, MEDIA_OWNER_TYPE } from '@/constants/enums';
import { formatBookingPrice as formatCurrency, formatBookingDate as formatDate, parseBackendDate } from '@/utils/format';
import { getBookingStatusKey } from '@/utils/booking';


const STEP_CONFIG = [
  { key: 'confirmed',  label: 'Đã xác nhận', icon: 'check_circle' },
  { key: 'traveling',  label: 'Đang di chuyển', icon: 'directions_car' },
  { key: 'arrived',    label: 'Đã đến nơi',     icon: 'location_on' },
  { key: 'inprogress', label: 'Đang thực hiện',  icon: 'build' },
  { key: 'completed',  label: 'Hoàn thành',    icon: 'verified' },
];

const WORKER_LOCATION_MIN_INTERVAL_MS = 10000;
const WORKER_LOCATION_MIN_DISTANCE_M = 30;

function getDistanceMeters(from, to) {
  if (!from || !to) return Infinity;
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function JobTrackingView({ bookingId }) {
  const { message } = App.useApp();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  // Proposal modal states
  const [proposalModal, setProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    proposedPrice: '',
    proposedTime: '',
    proposedNote: '',
  });

  // Reject modal states
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Đang bận, không thể nhận');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Upload photo states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadedMediaIds, setUploadedMediaIds] = useState([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  const [bookingReview, setBookingReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const statusKey = getBookingStatusKey(booking?.status);

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const lastLocationUpdateRef = useRef({ at: 0, coords: null });
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

  // Fetch Booking Detail
  const fetchBooking = async (showLoading = false) => {
    if (!bookingId) return;
    if (showLoading) setLoading(true);
    try {
      const data = await bookingApi.getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
      if (showLoading) {
        message.error(error.response?.data?.message || error.message || 'Không thể tải thông tin công việc.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load chat messages
  const loadChatMessages = async () => {
    if (!bookingId) return;
    try {
      const response = await bookingApi.getChatMessages(bookingId, {
        PageNumber: 1,
        PageSize: 100,
      });
      const items = response?.items || response?.data || response || [];
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

  const fetchBookingReview = async () => {
    if (!bookingId) return;
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

  // Initial load
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      fetchBooking(true);
      fetchBookingReview();
    });

    return () => {
      alive = false;
    };
  }, [bookingId]);

  // Polling for booking updates & chat messages
  useEffect(() => {
    const liveStatusKey = getBookingStatusKey(booking?.status);
    const shouldPoll = !booking || ['pending', 'matching', 'confirmed', 'traveling', 'arrived', 'inprogress', 'pendingpayment'].includes(liveStatusKey);
    if (!shouldPoll) return undefined;

    const interval = setInterval(() => {
      fetchBooking(false);
      if (chatOpen && !isConnected) {
        loadChatMessages();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [bookingId, booking?.status, chatOpen, isConnected]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const handleOpenChat = () => {
    if (statusKey === 'pending' || statusKey === 'matching') {
      message.warning('Vui lòng chấp nhận yêu cầu đặt lịch để có thể nhắn tin.');
      return;
    }
    setChatOpen(true);
    loadChatMessages();
    bookingApi.markChatRead(bookingId).catch(() => {});
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text || sendingMessage) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('Type', '0');
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

  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || sendingMessage) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('Type', '1');
      formData.append('File', file);

      await bookingApi.sendChatMessage(bookingId, formData);
      await loadChatMessages();
    } catch {
      message.error('Không thể gửi hình ảnh.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Transition actions
  const handleAcceptJob = async () => {
    setTransitioning(true);
    try {
      await bookingApi.acceptBooking(bookingId);
      message.success('Đã chấp nhận yêu cầu đặt lịch.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể chấp nhận yêu cầu.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleDeclineJob = async () => {
    const reason = rejectReason === 'other' ? customRejectReason.trim() : rejectReason;
    if (!reason) {
      message.warning('Vui lòng chọn hoặc nhập lý do từ chối.');
      return;
    }
    setTransitioning(true);
    try {
      await bookingApi.declineBooking(bookingId, reason);
      message.success('Đã từ chối công việc.');
      setRejectModal(false);
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể từ chối công việc.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleProposeJob = async () => {
    const proposedPrice = Number(proposalForm.proposedPrice);
    if (!proposalForm.proposedPrice || !Number.isFinite(proposedPrice) || proposedPrice <= 0) {
      message.warning('Vui lòng nhập giá đề xuất hợp lệ.');
      return;
    }
    if (!proposalForm.proposedTime) {
      message.warning('Vui lòng chọn thời gian đề xuất.');
      return;
    }
    setTransitioning(true);
    try {
      await bookingApi.proposeBooking(bookingId, {
        proposedPrice,
        proposedTime: new Date(proposalForm.proposedTime).toISOString(),
        proposedNote: proposalForm.proposedNote.trim(),
      });
      message.success('Đã gửi đề xuất thương lượng mới cho khách hàng.');
      setProposalModal(false);
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi đề xuất thương lượng.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleStartTravel = async () => {
    setTransitioning(true);
    try {
      await bookingApi.startTravel(bookingId);
      message.success('Đang di chuyển đến nhà khách hàng.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Thao tác thất bại.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleArrived = async () => {
    setTransitioning(true);
    try {
      await bookingApi.arrive(bookingId);
      message.success('Đã xác nhận đến nơi.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Thao tác thất bại.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleStartWork = async () => {
    setTransitioning(true);
    try {
      await bookingApi.startWork(bookingId);
      message.success('Bắt đầu tiến hành sửa chữa.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Thao tác thất bại.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const response = await mediaApi.upload({
        category: MEDIA_CATEGORY.COMPLETION,
        ownerType: MEDIA_OWNER_TYPE.BOOKING,
        files,
      });
      const items = response?.items || response?.data || response || [];
      const mediaList = Array.isArray(items) ? items : [items];
      
      const newIds = mediaList.map(item => item.id || item.mediaId || item.fileId).filter(Boolean);
      const newUrls = mediaList.map(item => item.fileUrl || item.url).filter(Boolean);

      setUploadedMediaIds(prev => [...prev, ...newIds]);
      setUploadedPhotoUrls(prev => [...prev, ...newUrls]);
      message.success('Đã tải ảnh lên thành công.');
    } catch (error) {
      message.error(error.message || 'Không thể tải ảnh lên.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (uploadedMediaIds.length === 0) {
      message.warning('Vui lòng tải lên ít nhất 1 ảnh nghiệm thu trước khi hoàn thành.');
      return;
    }
    setTransitioning(true);
    try {
      await bookingApi.completeBooking(bookingId, { mediaIds: uploadedMediaIds });
      message.success('Xác nhận hoàn thành dịch vụ.');
      await fetchBooking(true);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Thao tác thất bại.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleReplyReview = async () => {
    const reply = replyText.trim();
    if (!bookingReview?.id || !reply) {
      message.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setReplying(true);
    try {
      await reviewApi.replyToReview(bookingReview.id, reply);
      message.success('Đã phản hồi đánh giá của khách hàng.');
      setReplyText('');
      await fetchBookingReview();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể phản hồi đánh giá.');
    } finally {
      setReplying(false);
    }
  };

  const isProposed = booking?.workerProposedPrice && booking?.workerProposedPrice > 0;
  const isCompleted = statusKey === 'completed';

  const customerName = booking?.customer?.fullName || booking?.user?.fullName || booking?.customer?.name || booking?.user?.name || 'Khách hàng';
  const customerAvatar = booking?.customer?.avatar || booking?.user?.avatarUrl || '';

  const totalAmount = booking?.totalAmount || booking?.finalPrice || booking?.estimatedPrice || 0;
  const legacyMedia = Array.isArray(booking?.media) ? booking.media : [];
  const requestImages = Array.isArray(booking?.requestImages) && booking.requestImages.length > 0
    ? booking.requestImages
    : legacyMedia.filter((med) => med.category !== MEDIA_CATEGORY.COMPLETION && med.category !== 4);
  const completeImages = Array.isArray(booking?.completeImages) && booking.completeImages.length > 0
    ? booking.completeImages
    : legacyMedia.filter((med) => med.category === MEDIA_CATEGORY.COMPLETION || med.category === 4);

  // Find step index
  const currentStepIndex = STEP_CONFIG.findIndex(s => s.key === statusKey);
  const stepProgressClass = currentStepIndex <= 0
    ? 'h-0'
    : currentStepIndex === 1
      ? 'h-1/4'
      : currentStepIndex === 2
        ? 'h-1/2'
        : currentStepIndex === 3
          ? 'h-3/4'
          : 'h-full';

  useEffect(() => {
    if (statusKey !== 'traveling' || typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const last = lastLocationUpdateRef.current;
        const elapsed = Date.now() - last.at;
        const moved = getDistanceMeters(last.coords, nextCoords);

        if (elapsed < WORKER_LOCATION_MIN_INTERVAL_MS && moved < WORKER_LOCATION_MIN_DISTANCE_M) {
          return;
        }

        lastLocationUpdateRef.current = { at: Date.now(), coords: nextCoords };
        bookingApi.updateWorkerLocation(nextCoords).catch((error) => {
          console.warn('Failed to update worker location:', error);
        });
      },
      (error) => {
        console.warn('Worker location unavailable:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 12000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [statusKey]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] py-0 font-montserrat text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#FF8228]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#FF8228] animate-spin">sync</span>
          </div>
          <p className="text-sm font-semibold text-[#818A91]">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-[800px] py-12 px-4 font-montserrat text-center">
        <div className="rounded-2xl border-2 border-dashed border-[#dec0b1]/30 bg-white p-10 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#818A91] mb-3">warning</span>
          <p className="font-bold text-lg mb-4">Không tìm thấy thông tin công việc</p>
          <p className="text-sm text-[#818A91]">Đơn hàng này không tồn tại hoặc bạn không được phân bổ thực hiện.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 font-montserrat text-[#1b1c1c] min-h-screen">
      
      {/* Job header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Chi tiết công việc #{booking.code || booking.id.substring(0, 8).toUpperCase()}</h1>
          <p className="text-xs font-semibold text-[#818A91] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#FF8228]">calendar_today</span>
            Thời gian hẹn: {formatDate(booking.scheduledAt || booking.createdDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm border ${
            statusKey === 'pending' ? 'text-amber-500 bg-amber-50 border-amber-200' :
            statusKey === 'matching' ? 'text-orange-500 bg-orange-50 border-orange-200' :
            statusKey === 'pendingpayment' ? 'text-rose-500 bg-rose-50 border-rose-200' :
            statusKey === 'confirmed' ? 'text-emerald-500 bg-emerald-50 border-emerald-200' :
            statusKey === 'completed' ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'
          }`}>
            {statusKey === 'pending' ? 'Chờ phản hồi' :
             statusKey === 'matching' ? 'Đang ghép thợ' :
             statusKey === 'pendingpayment' ? 'Chờ khách trả tiền' :
             statusKey === 'confirmed' ? 'Đã nhận' :
             statusKey === 'traveling' ? 'Đang đi tới' :
             statusKey === 'arrived' ? 'Đã đến nơi' :
             statusKey === 'inprogress' ? 'Đang thực hiện' :
             statusKey === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Progress + Control Actions */}
        <div className="lg:col-span-8 space-y-6">

          {/* Execution Tracker (If Confirmed / Moving / Arrived / Working / Done) */}
          {['confirmed', 'traveling', 'arrived', 'inprogress', 'completed'].includes(statusKey) && (
            <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-6">Tiến trình dịch vụ</h2>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-slate-100 hidden md:block" />
                <div className={`absolute left-[19px] top-0 hidden w-1 bg-[#39B54A] transition-all duration-500 md:block ${stepProgressClass}`} />

                <div className="space-y-6 relative">
                  {STEP_CONFIG.map((step, i) => {
                    const done = isCompleted || i < currentStepIndex;
                    const active = !isCompleted && i === currentStepIndex;
                    return (
                      <div key={step.key} className={`flex items-start gap-4 ${!done && !active ? 'opacity-40' : ''}`}>
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                          done ? 'bg-[#39B54A] text-white' : active ? 'bg-white border-4 border-[#FF8228]' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {done ? <span className="material-symbols-outlined text-[20px] material-symbols-filled">check</span>
                            : active ? <div className="w-2.5 h-2.5 rounded-full bg-[#FF8228] animate-pulse" />
                            : <span className="material-symbols-outlined text-[20px]">{step.icon}</span>}
                        </div>
                        <div className="pt-1.5 flex-1">
                          <h3 className={`text-xs font-bold uppercase tracking-wider ${done ? 'text-[#39B54A]' : active ? 'text-[#FF8228]' : 'text-[#818A91]'}`}>{step.label}</h3>
                          {done && <p className="text-[11px] text-[#39B54A] mt-0.5 font-medium">Đã hoàn thành</p>}
                          {active && <p className="text-[11px] text-[#818A91] mt-0.5 font-medium">Đang xử lý...</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Stepper */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                {statusKey === 'confirmed' && (
                  <button onClick={handleStartTravel} disabled={transitioning} className="px-6 py-2.5 bg-[#FF8228] text-white rounded-xl font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">directions_car</span>
                    Bắt đầu di chuyển
                  </button>
                )}
                {statusKey === 'traveling' && (
                  <button onClick={handleArrived} disabled={transitioning} className="px-6 py-2.5 bg-[#FF8228] text-white rounded-xl font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Xác nhận đã đến nơi
                  </button>
                )}
                {statusKey === 'arrived' && (
                  <button onClick={handleStartWork} disabled={transitioning} className="px-6 py-2.5 bg-[#FF8228] text-white rounded-xl font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">build</span>
                    Bắt đầu thực hiện sửa chữa
                  </button>
                )}
                {statusKey === 'inprogress' && (
                  <button onClick={handleCompleteBooking} disabled={transitioning} className="px-6 py-2.5 bg-[#39B54A] text-white rounded-xl font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Xác nhận hoàn thành công việc
                  </button>
                )}
                {statusKey === 'completed' && (
                  <div className="flex items-center gap-2 text-[#39B54A]">
                    <span className="material-symbols-outlined text-[24px]">task_alt</span>
                    <span className="font-bold text-sm">Công việc đã hoàn thành và bàn giao!</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Pending State Proposals and Actions */}
          {statusKey === 'pending' && (
            <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-base font-bold mb-3">Phản hồi yêu cầu công việc</h2>
              <p className="text-xs text-[#818A91] mb-6">Bạn có thể chấp nhận công việc theo điều kiện gốc, đề xuất thay đổi hoặc từ chối yêu cầu.</p>

              {isProposed ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
                  <h4 className="text-xs font-bold text-[#FF8228] uppercase tracking-wider">Đề xuất thương lượng đã gửi</h4>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-[#818A91]">Giá bạn đề xuất:</span>
                      <span className="block font-bold text-sm text-[#FF8228] mt-0.5">{formatCurrency(booking.workerProposedPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[#818A91]">Thời gian bạn đề xuất:</span>
                      <span className="block font-bold text-[#1b1c1c] mt-0.5">{formatDate(booking.workerProposedTime)}</span>
                    </div>
                    {booking.workerProposedNote && (
                      <div className="sm:col-span-2 pt-2 border-t border-slate-200 text-[#4A4A4A] italic">
                        &quot;{booking.workerProposedNote}&quot;
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#818A91] mt-4 font-bold uppercase tracking-wider">Đang chờ khách hàng đồng ý hoặc phản hồi tin nhắn...</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleAcceptJob} disabled={transitioning} className="px-5 py-2.5 bg-[#39B54A] text-white rounded-xl font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Chấp nhận công việc
                  </button>
                  <button onClick={() => setProposalModal(true)} disabled={transitioning} className="px-5 py-2.5 border-2 border-[#FF8228] text-[#FF8228] bg-white rounded-xl font-bold text-xs hover:bg-orange-50 transition-all flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                    Đề xuất giá/giờ mới
                  </button>
                  <button onClick={() => setRejectModal(true)} disabled={transitioning} className="px-5 py-2.5 border border-slate-200 text-rose-500 bg-white rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    Từ chối
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Pending Payment waiting state */}
          {statusKey === 'pendingpayment' && (
            <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center py-10">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500 mb-3 animate-pulse">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="font-bold text-base">Đang chờ khách hàng thanh toán</h3>
              <p className="text-xs text-[#818A91] mt-1 max-w-[400px] mx-auto leading-relaxed">
                Khách hàng đã chấp nhận điều kiện dịch vụ và đang tiến hành thanh toán. Hệ thống sẽ tự động thông báo khi đơn được xác nhận.
              </p>
            </section>
          )}

          {/* Photo proof (For InProgress and Completed states) */}
          {['inprogress', 'completed'].includes(statusKey) && (
            <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91]">Ảnh nghiệm thu công việc</h2>
                <span className="px-2 py-0.5 bg-[#FF8228]/10 text-[#FF8228] rounded-md text-[10px] font-bold uppercase tracking-wider">Yêu cầu ảnh chụp</span>
              </div>

              {statusKey === 'inprogress' && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/60 transition-all cursor-pointer mb-5 relative">
                  <input type="file" multiple accept="image/*" onChange={handleUploadPhotos} disabled={uploadingPhotos} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="material-symbols-outlined text-slate-400 mb-2 text-[36px]">add_a_photo</span>
                  <p className="text-xs font-bold text-[#1b1c1c]">Chọn hoặc chụp ảnh nghiệm thu</p>
                  <p className="text-[10px] text-[#818A91] mt-1 max-w-[280px] text-center">Bao gồm thiết bị đã được sửa chữa hoặc biên bản nghiệm thu (tối đa 5 ảnh)</p>
                  {uploadingPhotos && <span className="text-xs text-[#FF8228] font-bold mt-2">Đang tải ảnh lên...</span>}
                </div>
              )}

              {/* Render Uploaded / Existing Photos */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {uploadedPhotoUrls.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover [&_.ant-image-mask]:!flex [&_.ant-image-mask]:!items-center [&_.ant-image-mask]:!justify-center [&_.ant-image]:!h-full [&_.ant-image]:!w-full">
                    <AntImage
                      src={url}
                      alt={`Ảnh nghiệm thu ${i + 1}`}
                      className="transition-transform duration-200 group-hover:scale-105"
                      preview={{ mask: 'Xem' }}
                    />
                  </div>
                ))}
                {/* Fallback to show booking.media if already completed */}
                {statusKey === 'completed' && completeImages.length > 0 && completeImages
                  .map((med) => (
                    <div key={med.id || med.fileUrl} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover [&_.ant-image-mask]:!flex [&_.ant-image-mask]:!items-center [&_.ant-image-mask]:!justify-center [&_.ant-image]:!h-full [&_.ant-image]:!w-full">
                      <AntImage
                        src={med.fileUrl || med.url}
                        alt="Nghiệm thu"
                        className="transition-transform duration-200 group-hover:scale-105"
                        preview={{ mask: 'Xem' }}
                      />
                    </div>
                  ))}
              </div>
            </section>
          )}

          {statusKey === 'completed' && (
            <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Đánh giá từ khách hàng</h2>
                  <p className="m-0 mt-1 text-xs text-[#818A91]">Phản hồi lại đánh giá sau khi hoàn thành dịch vụ.</p>
                </div>
                <span className="material-symbols-outlined text-[#FF8228]">rate_review</span>
              </div>

              {loadingReview ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-semibold text-[#818A91]">Đang tải đánh giá...</div>
              ) : bookingReview ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#dec0b1]/20 bg-[#FFF8F3] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-sm font-extrabold text-[#1b1c1c]">{bookingReview.customer?.fullName || customerName}</p>
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
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {bookingReview.images.map((image) => {
                            const url = image.fileUrl || image.url;
                            if (!url) return null;
                            return (
                              <div key={image.id || url} className="group aspect-square overflow-hidden rounded-lg border border-white bg-slate-50 [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover [&_.ant-image-mask]:!flex [&_.ant-image-mask]:!items-center [&_.ant-image-mask]:!justify-center [&_.ant-image]:!h-full [&_.ant-image]:!w-full">
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
                      <p className="m-0 text-xs font-bold uppercase tracking-wider text-emerald-600">Phản hồi của bạn</p>
                      <p className="m-0 mt-2 text-sm leading-relaxed text-[#1b1c1c]">{bookingReview.workerReply}</p>
                      {(bookingReview.repliedAt || bookingReview.repliedDate) && <p className="m-0 mt-2 text-[11px] text-[#818A91]">{formatDate(bookingReview.repliedAt || bookingReview.repliedDate)}</p>}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#818A91]">Phản hồi đánh giá</label>
                      <textarea
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition-all focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/15"
                        placeholder="Cảm ơn khách hàng hoặc giải thích thêm về dịch vụ..."
                      />
                      <button
                        type="button"
                        disabled={replying}
                        onClick={handleReplyReview}
                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8228] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {replying ? 'Đang gửi phản hồi...' : 'Gửi phản hồi'}
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs text-[#818A91]">
                  Khách hàng chưa gửi đánh giá cho công việc này.
                </div>
              )}
            </section>
          )}

          {/* Job summary details */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-4">Thông tin công việc chi tiết</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Mô tả từ khách hàng</span>
                <p className="text-sm font-semibold text-[#4A4A4A] mt-1 leading-relaxed whitespace-pre-line">{booking.description || 'Không có mô tả chi tiết'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block">Địa điểm thực hiện</span>
                <p className="text-sm font-bold text-[#1b1c1c] mt-1">{booking.address || 'Chưa cập nhật địa chỉ'}</p>
              </div>
            </div>

            {/* Customer problem images */}
            {requestImages.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818A91] block mb-3">Hình ảnh khách đính kèm</span>
                <AntImage.PreviewGroup>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {requestImages
                      .map((med) => (
                        <div key={med.id || med.fileUrl} className="group aspect-square overflow-hidden rounded-xl border border-slate-200 bg-[#F5F5F5] [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover [&_.ant-image-mask]:!flex [&_.ant-image-mask]:!items-center [&_.ant-image-mask]:!justify-center [&_.ant-image]:!h-full [&_.ant-image]:!w-full">
                          <AntImage
                            src={med.fileUrl || med.url}
                            alt="Ảnh sự cố"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            preview={{ mask: 'Xem' }}
                          />
                        </div>
                      ))}
                  </div>
                </AntImage.PreviewGroup>
              </div>
            )}
          </section>

        </div>

        {/* Right Column (4 cols): Customer Profile + Fee Summary */}
        <div className="lg:col-span-4 space-y-6">

          {/* Customer Profile Card */}
          <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="bg-[#FF8228] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shrink-0 bg-slate-200">
                <img
                  src={customerAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6BDEHEz7H6UzRq5va4XltTBkQl6L_LC4FNAHi2Ak5vGY72Qvl64jJOJNFb1gPziJN0ujIQT2M-ouDjr9TTOEarYTqKbTuI9ZO4TgjTeG_ZK7ZDWzfKaQIyF2U8Qr1ry_Pb98eZHu4ViEQ024J0TQyMltzfn6P_RcCf_QjwNr98rK4cPSVM2nrEQVA8aqJ4k3K5nosdsW4B3QsTNm78rHm_0dPkdxTRDDM0taG5PBjpKXrsTQUp6iFaK-lXwD2KAVGuV2s5S-MBJ8'}
                  alt="Khách hàng" className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-white text-base truncate">{customerName}</h3>
                <p className="text-xs text-white/80 mt-0.5">Khách hàng của Fixy</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => message.info('Tính năng gọi ẩn danh đang được phát triển.')}
                  className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-all"
                  title="Gọi ẩn danh"
                >
                  <span className="material-symbols-outlined text-[20px]">ring_volume</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  disabled={statusKey === 'pending' || statusKey === 'matching'}
                  className="w-10 h-10 flex items-center justify-center bg-[#FF8228] text-white rounded-full hover:brightness-105 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={statusKey === 'pending' || statusKey === 'matching' ? "Vui lòng chấp nhận yêu cầu để nhắn tin" : ""}
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </button>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs">
                <span className="text-[#818A91] font-bold uppercase tracking-wider block mb-1">Số điện thoại liên hệ</span>
                <span className="font-bold text-slate-500">Số điện thoại bảo mật</span>
              </div>
            </div>
          </section>

          {/* Pricing & Billing */}
          <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#818A91] mb-4">Chi tiết thu nhập</h3>
            <div className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Phí gốc của dịch vụ</span>
                <span>{formatCurrency(booking.basePrice || booking.estimatedPrice)}</span>
              </div>
              {isProposed && (
                <div className="flex justify-between text-[#FF8228]">
                  <span>Bạn đề xuất mới</span>
                  <span>{formatCurrency(booking.workerProposedPrice)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Tổng thu tạm tính</span>
                <span className="font-black text-lg text-[#FF8228]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* Floating Proposal Modal */}
      {proposalModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setProposalModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[450px] p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base">Đề xuất giá/giờ mới</h3>
              <button onClick={() => setProposalModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#818A91] mb-1.5">Giá đề xuất mới (VNĐ)</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 250000"
                  value={proposalForm.proposedPrice}
                  onChange={e => setProposalForm(p => ({ ...p, proposedPrice: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#FF8228] focus:ring-1 focus:ring-[#FF8228] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#818A91] mb-1.5">Thời gian thực hiện đề xuất</label>
                <input
                  type="datetime-local"
                  value={proposalForm.proposedTime}
                  onChange={e => setProposalForm(p => ({ ...p, proposedTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#FF8228] focus:ring-1 focus:ring-[#FF8228] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#818A91] mb-1.5">Lý do đề xuất thay đổi</label>
                <textarea
                  placeholder="Ghi chú thêm về đề xuất (Ví dụ: Cần thêm thiết bị đặc thù, kẹt lịch làm việc...)"
                  value={proposalForm.proposedNote}
                  onChange={e => setProposalForm(p => ({ ...p, proposedNote: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#FF8228] focus:ring-1 focus:ring-[#FF8228] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs">
              <button onClick={() => setProposalModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleProposeJob} disabled={transitioning} className="px-5 py-2.5 bg-[#FF8228] text-white rounded-xl font-bold hover:brightness-105 transition-all">Gửi đề xuất</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Job Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setRejectModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-rose-500">Từ chối công việc</h3>
              <button onClick={() => setRejectModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="space-y-2.5 mb-5">
              {['Đang bận, không thể nhận', 'Quá xa khu vực hoạt động', 'Ngoài chuyên môn', 'Không phù hợp lịch làm việc', 'other'].map((reasonOption) => (
                <label key={reasonOption} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  rejectReason === reasonOption ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:bg-slate-50/60'
                }`}>
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reasonOption}
                    checked={rejectReason === reasonOption}
                    onChange={() => setRejectReason(reasonOption)}
                    className="accent-rose-500 shrink-0"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {reasonOption === 'other' ? 'Lý do khác' : reasonOption}
                  </span>
                </label>
              ))}
            </div>

            {rejectReason === 'other' && (
              <textarea
                value={customRejectReason}
                onChange={e => setCustomRejectReason(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none mb-5"
              />
            )}

            <div className="flex gap-3 justify-end text-xs">
              <button onClick={() => setRejectModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleDeclineJob} disabled={transitioning} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:brightness-105 transition-all">Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="font-extrabold text-sm leading-tight">{customerName}</h3>
                  <p className="text-[10px] text-[#818A91] mt-0.5">Đặt lịch #{bookingId.substring(0, 8).toUpperCase()}</p>
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
                          src={customerAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6BDEHEz7H6UzRq5va4XltTBkQl6L_LC4FNAHi2Ak5vGY72Qvl64jJOJNFb1gPziJN0ujIQT2M-ouDjr9TTOEarYTqKbTuI9ZO4TgjTeG_ZK7ZDWzfKaQIyF2U8Qr1ry_Pb98eZHu4ViEQ024J0TQyMltzfn6P_RcCf_QjwNr98rK4cPSVM2nrEQVA8aqJ4k3K5nosdsW4B3QsTNm78rHm_0dPkdxTRDDM0taG5PBjpKXrsTQUp6iFaK-lXwD2KAVGuV2s5S-MBJ8'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isMe ? 'bg-[#FF8228] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
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
                      placeholder="Nhập tin nhắn để thương lượng..."
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

    </main>
  );
}
