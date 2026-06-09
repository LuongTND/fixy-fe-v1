'use client';

import { useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { addressApi } from '@/apis/address.api';
import { bookingApi } from '@/apis/booking.api';
import { goongApi } from '@/apis/goong.api';
import { mediaApi } from '@/apis/media.api';
import { workerProfileApi } from '@/apis/worker-profile.api';
import { serviceCategoryApi } from '@/apis/service-category.api';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { BOOKING_SCHEDULED_TYPE, MEDIA_CATEGORY, MEDIA_OWNER_TYPE } from '@/constants/enums';
import { TechnicianSelectModal } from './TechnicianSelectModal';

const GOONG_JS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
const GOONG_CSS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
const DEFAULT_MAP_CENTER = [106.700806, 10.776889];

function formatCurrency(value = 0) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function getPriceValue(payload) {
  if (typeof payload === 'number') return payload;
  if (typeof payload === 'string' && payload.trim() !== '') return Number(payload);
  const value =
    payload?.price ??
    payload?.basePrice ??
    payload?.estimatedPrice ??
    payload?.amount ??
    payload?.value ??
    payload?.data?.price ??
    payload?.data?.basePrice ??
    payload?.data?.estimatedPrice ??
    payload?.data?.amount;
  return Number(value || 0);
}

function formatSavedAddress(address) {
  return [address?.detail, address?.ward, address?.district, address?.city].filter(Boolean).join(', ');
}

function getUploadedMediaItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.files)) return payload.files;
  if (payload) return [payload];
  return [];
}

function getMediaId(media) {
  return media?.id || media?.mediaId || media?.fileId || '';
}

function GoongMapPreview({ selectedLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const initialLocationRef = useRef(selectedLocation);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver;

    const resizeMap = () => {
      if (!containerRef.current || !mapRef.current) return;
      mapRef.current.resize();
    };

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

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const [configResponse, goongjs, styleResponse] = await Promise.all([
        fetch('/api/goong/map-config'),
        ensureGoongAssets(),
        fetch('https://tiles.goong.io/assets/goong_map_web.json').then((res) => res.json()).catch(() => null),
      ]);
      const config = await configResponse.json();

      if (cancelled || !config.maptilesKey || !goongjs || !containerRef.current) return;

      const initialLocation = initialLocationRef.current;
      const center = initialLocation?.lat && initialLocation?.lng
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_MAP_CENTER;

      goongjs.accessToken = config.maptilesKey;

      let mapStyle = 'https://tiles.goong.io/assets/goong_map_web.json';
      if (styleResponse && Array.isArray(styleResponse.layers)) {
        styleResponse.layers = styleResponse.layers.filter((layer) => layer.id !== 'poi-tree');
        mapStyle = styleResponse;
      }

      mapRef.current = new goongjs.Map({
        container: containerRef.current,
        style: mapStyle,
        center,
        zoom: initialLocation ? 15 : 12,
      });

      mapRef.current.on('error', (e) => {
        if (e && e.error && typeof e.error.message === 'string' && e.error.message.includes('Source layer "trees" does not exist')) {
          return;
        }
        console.warn('Goong map warning:', e.error || e);
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

      markerRef.current = new goongjs.Marker({ color: '#FF8228' })
        .setLngLat(center)
        .addTo(mapRef.current);

      mapRef.current.on('load', resizeMap);
      resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(containerRef.current);
      requestAnimationFrame(resizeMap);
      [120, 300, 700].forEach((delay) => window.setTimeout(resizeMap, delay));
    }

    initMap().catch(() => { });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  /*
  useEffect(() => {
    if (serviceCategoryError) message.error('Không thể tải danh mục dịch vụ.');
  }, [message, serviceCategoryError]);
  */

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !selectedLocation?.lat || !selectedLocation?.lng) return;
    const nextCenter = [selectedLocation.lng, selectedLocation.lat];
    mapRef.current.resize();
    markerRef.current.setLngLat(nextCenter);
    mapRef.current.flyTo({ center: nextCenter, zoom: 15, essential: true });
  }, [selectedLocation?.lat, selectedLocation?.lng]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full [&_.goongjs-canvas]:!h-full [&_.goongjs-canvas]:!w-full [&_.mapboxgl-canvas]:!h-full [&_.mapboxgl-canvas]:!w-full" />;
}

export function CreateRequestView() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proType, setProType] = useState('auto');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const { parentCategories: services, error: serviceCategoryError } = useServiceCategories({ parentsOnly: true });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [problemImages, setProblemImages] = useState([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [scheduledType, setScheduledType] = useState(BOOKING_SCHEDULED_TYPE.NOW);
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!workerId) return;

    let alive = true;
    const fetchWorker = async () => {
      try {
        const workerData = await workerProfileApi.getPublicById(workerId);
        if (!alive) return;

        if (workerData) {
          setSelectedWorker(workerData);
          setProType('manual');

          const workerServices = workerData.services || [];
          const primarySvc = workerServices.find((s) => s.isPrimary) || workerServices[0];
          if (primarySvc?.categoryId) {
            setSelectedService(primarySvc.categoryId);
          }
        }
      } catch (err) {
        console.error('Failed to pre-select worker from query:', err);
      }
    };

    fetchWorker();

    return () => {
      alive = false;
    };
  }, [workerId]);

  useEffect(() => {
    if (!selectedService && services[0]?.id) {
      queueMicrotask(() => setSelectedService(services[0].id));
    }
  }, [selectedService, services]);

  useEffect(() => {
    if (serviceCategoryError) message.error('Không thể tải danh mục dịch vụ.');
  }, [message, serviceCategoryError]);

  /*
  useEffect(() => {
    let alive = true;
    legacyServiceCategoryLoader()
      .then((data) => {
        if (!alive) return;
        const parentCategories = (data || []).filter((category) => !category.parentId && category.isActive !== false);
        setServices(parentCategories);
        if (parentCategories[0]?.id) setSelectedService(parentCategories[0].id);
      })
      .catch(() => {
        if (alive) message.error('Không thể tải danh mục dịch vụ.');
      });
    return () => { alive = false; };
  }, []);
  */

  useEffect(() => {
    let alive = true;
    addressApi.getMe()
      .then((data) => {
        if (!alive) return;
        const addresses = Array.isArray(data) ? data : [];
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
        if (defaultAddress && !selectedLocation) {
          const addressText = formatSavedAddress(defaultAddress);
          setSelectedLocation({
            address: addressText,
            addressId: defaultAddress.id,
            lat: Number(defaultAddress.lat || 0),
            lng: Number(defaultAddress.lng || 0),
            source: 'saved',
          });
          setAddressQuery(addressText);
        }
      })
      .catch(() => {
        if (alive) setSavedAddresses([]);
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;

    if (!selectedService) {
      queueMicrotask(() => {
        if (alive) setEstimatedCost(0);
      });
      return () => { alive = false; };
    }

    queueMicrotask(() => {
      if (alive) setIsPriceLoading(true);
    });
    serviceCategoryApi.getPrice(selectedService)
      .then((price) => {
        if (!alive) return;
        setEstimatedCost(getPriceValue(price));
      })
      .catch(() => {
        if (!alive) return;
        setEstimatedCost(0);
      })
      .finally(() => {
        if (alive) setIsPriceLoading(false);
      });

    return () => { alive = false; };
  }, [selectedService]);

  useEffect(() => () => {
    problemImages.forEach((image) => {
      if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
    });
  }, [problemImages]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (!isSuggestionOpen || query.length < 2 || selectedLocation?.address === query) {
      queueMicrotask(() => setAddressSuggestions([]));
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLocationLoading(true);
      setLocationError('');
      try {
        const options = selectedLocation?.lat && selectedLocation?.lng
          ? {
            location: `${selectedLocation.lat},${selectedLocation.lng}`,
            origin: `${selectedLocation.lat},${selectedLocation.lng}`,
            radius: 10,
            limit: 10,
            more_compound: true,
            has_deprecated_administrative_unit: true,
          }
          : { limit: 10, more_compound: true, has_deprecated_administrative_unit: true };
        setAddressSuggestions(await goongApi.autocomplete(query, options));
      } catch {
        setLocationError('Không thể tải gợi ý địa chỉ. Vui lòng thử lại.');
        setAddressSuggestions([]);
      } finally {
        setIsLocationLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [addressQuery, isSuggestionOpen, selectedLocation]);

  const getGeocodedLocation = async (address) => {
    const payload = await goongApi.geocode({ address, has_deprecated_administrative_unit: true });
    const result = payload?.results?.[0];
    const location = result?.geometry?.location;
    return {
      address: result?.formatted_address || address,
      lat: location?.lat,
      lng: location?.lng,
      source: 'goong',
    };
  };

  const getReverseGeocodedLocation = async (lat, lng) => {
    const payload = await goongApi.geocode({
      latlng: `${lat},${lng}`,
      limit: 5,
      has_deprecated_administrative_unit: true,
      has_vnid: true,
    });
    const result = payload?.results?.[0];
    const location = result?.geometry?.location;
    return {
      address: result?.formatted_address || 'Vị trí hiện tại của tôi',
      lat: location?.lat ?? lat,
      lng: location?.lng ?? lng,
      source: 'gps',
    };
  };

  const handleSelectSuggestion = async (suggestion) => {
    const address = suggestion.description || suggestion.structured_formatting?.main_text || '';
    if (!address) return;
    setAddressQuery(address);
    setAddressSuggestions([]);
    setIsSuggestionOpen(false);
    setIsLocationLoading(true);
    setLocationError('');

    try {
      setSelectedLocation(await getGeocodedLocation(address));
    } catch {
      setLocationError('Không thể xác định tọa độ từ địa chỉ này.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleGeocodeAddress = async () => {
    const address = addressQuery.trim();
    if (!address) {
      setLocationError('Vui lòng nhập địa chỉ nhận thợ.');
      return;
    }

    setIsLocationLoading(true);
    setLocationError('');
    try {
      const location = await getGeocodedLocation(address);
      setSelectedLocation(location);
      setAddressQuery(location.address);
    } catch {
      setLocationError('Không thể xác định tọa độ từ địa chỉ này.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ lấy vị trí hiện tại.');
      return;
    }

    setIsLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const location = await getReverseGeocodedLocation(lat, lng);
          setSelectedLocation(location);
          setAddressQuery(location.address);
        } catch {
          setSelectedLocation({ address: 'Vị trí hiện tại của tôi', lat, lng, source: 'gps' });
          setAddressQuery('Vị trí hiện tại của tôi');
        } finally {
          setAddressSuggestions([]);
          setIsSuggestionOpen(false);
          setIsLocationLoading(false);
        }
      },
      () => {
        setLocationError('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền định vị hoặc nhập địa chỉ.');
        setIsLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSavedAddress = (address) => {
    const addressText = formatSavedAddress(address);
    setSelectedLocation({
      address: addressText,
      addressId: address.id,
      lat: Number(address.lat || 0),
      lng: Number(address.lng || 0),
      source: 'saved',
    });
    setAddressQuery(addressText);
    setAddressSuggestions([]);
    setIsSuggestionOpen(false);
    setLocationError('');
  };

  const handleAddProblemImages = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5 - problemImages.length);
    setProblemImages((current) => [
      ...current,
      ...files.map((file) => ({
        uid: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ].slice(0, 5));
    event.target.value = '';
  };

  const handleRemoveProblemImage = (uid) => {
    setProblemImages((current) => {
      const target = current.find((image) => image.uid === uid);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.uid !== uid);
    });
  };

  const handleCreateDraft = async () => {
    if (!selectedService) {
      message.warning('Vui lòng chọn loại dịch vụ.');
      return;
    }
    if (!description.trim()) {
      message.warning('Vui lòng mô tả vấn đề cần hỗ trợ.');
      return;
    }
    if (!selectedLocation?.address || (!selectedLocation?.addressId && (!selectedLocation?.lat || !selectedLocation?.lng))) {
      message.warning('Vui lòng chọn địa chỉ nhận thợ.');
      return;
    }
    if (scheduledType === BOOKING_SCHEDULED_TYPE.SCHEDULED && !scheduledAt) {
      message.warning('Vui lòng chọn ngày giờ đặt lịch.');
      return;
    }
    if (proType === 'manual' && !selectedWorker?.id) {
      message.warning('Vui lòng chọn thợ cụ thể hoặc chuyển sang kết nối nhanh.');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaIds = [];
      if (problemImages.length > 0) {
        const uploaded = await mediaApi.upload({
          category: MEDIA_CATEGORY.REQUEST,
          ownerType: MEDIA_OWNER_TYPE.BOOKING,
          files: problemImages.map((image) => image.file),
        });
        mediaIds = getUploadedMediaItems(uploaded).map(getMediaId).filter(Boolean);
      }

      const draft = await bookingApi.createDraft({
        categoryId: selectedService,
        description: description.trim(),
        mediaIds,
        addressId: selectedLocation.addressId || null,
        address: selectedLocation.address,
        lat: Number(selectedLocation.lat || 0),
        lng: Number(selectedLocation.lng || 0),
        scheduledType,
        scheduledAt: scheduledType === BOOKING_SCHEDULED_TYPE.NOW ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
        workerProfileId: proType === 'manual' ? selectedWorker.id : null,
        autoMatch: proType === 'auto',
      });
      const draftId = draft?.draftId || draft?.id;
      if (draftId) sessionStorage.setItem('bookingDraftId', draftId);
      message.success('Đã tạo bản nháp yêu cầu dịch vụ.');
      router.push('/booking/checkout');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tạo yêu cầu dịch vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceInfo = services.find((item) => item.id === selectedService);

  return (
    <div className="mx-auto max-w-[1000px] py-0 font-montserrat">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1b1c1c] md:text-3xl">Tạo yêu cầu dịch vụ</h1>
        <p className="mt-1 text-base text-[#818A91]">Hoàn thành thông tin để hệ thống tạo bản nháp đặt dịch vụ.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                <span className="material-symbols-outlined text-[20px] text-[#FF8228]">category</span>
              </div>
              <h2 className="text-lg font-bold text-[#1b1c1c]">1. Chọn loại dịch vụ</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((item) => {
                const isActive = selectedService === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedService(item.id)}
                    className={`group relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${isActive
                        ? 'border-[#FF8228] bg-[#FF8228]/5 shadow-md shadow-[#FF8228]/5'
                        : 'border-[#F0F0F0] hover:border-[#FF8228]/30 hover:bg-[#F5F5F5] hover:shadow-sm'
                      }`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-[#FF8228] text-white shadow-lg shadow-[#FF8228]/20' : 'bg-[#F8F9FA] text-[#818A91] group-hover:bg-white group-hover:text-[#FF8228]'
                      }`}>
                      <span className="material-symbols-outlined text-[28px] transition-transform group-hover:scale-110">handyman</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-base font-bold ${isActive ? 'text-[#FF8228]' : 'text-[#1b1c1c]'}`}>{item.name}</p>
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-[#818A91]">
                        {item.description || 'Dịch vụ sửa chữa và bảo trì tại nhà.'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                <span className="material-symbols-outlined text-[20px] text-[#FF8228]">description</span>
              </div>
              <h2 className="text-lg font-bold text-[#1b1c1c]">2. Mô tả vấn đề</h2>
            </div>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-[#E8E8E8] p-4 text-sm leading-relaxed text-[#1b1c1c] outline-none transition-all placeholder:text-[#818A91] focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/10"
              placeholder="Mô tả chi tiết sự cố bạn đang gặp phải..."
            />

            <div className="mt-6">
              <p className="mb-3 text-sm font-bold text-[#1b1c1c]">Tải lên hình ảnh (tối đa 5 ảnh)</p>
              <div className="flex flex-wrap gap-3">
                <label className="group flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E8E8E8] text-[#818A91] transition-all hover:border-[#FF8228] hover:bg-[#FF8228]/5">
                  <input className="hidden" type="file" accept="image/*" multiple disabled={problemImages.length >= 5} onChange={handleAddProblemImages} />
                  <span className="material-symbols-outlined text-2xl transition-transform group-hover:scale-110">add_a_photo</span>
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">Thêm ảnh</span>
                </label>
                {problemImages.map((image) => (
                  <div key={image.uid} className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-[#E8E8E8] shadow-sm">
                    <img className="h-full w-full object-cover" alt="Tình trạng cần sửa" src={image.previewUrl} />
                    <button
                      type="button"
                      onClick={() => handleRemoveProblemImage(image.uid)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[10px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#818A91]">Ảnh sẽ được tải lên khi gửi yêu cầu và gắn vào bản nháp đặt lịch.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                <span className="material-symbols-outlined text-[20px] text-[#FF8228]">location_on</span>
              </div>
              <h2 className="text-lg font-bold text-[#1b1c1c]">3. Vị trí của bạn</h2>
            </div>

            <div className="mb-4 rounded-3xl border border-[#E8E8E8] bg-[#F8F9FA] p-3 md:p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    className="w-full rounded-2xl border border-[#E8E8E8] bg-white py-3.5 pl-10 pr-11 text-sm text-[#1b1c1c] shadow-sm outline-none transition-all focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/10"
                    placeholder="Nhập địa chỉ nhận thợ..."
                    type="text"
                    value={addressQuery}
                    onChange={(event) => {
                      setAddressQuery(event.target.value);
                      setSelectedLocation(null);
                      setIsSuggestionOpen(true);
                    }}
                    onFocus={() => setIsSuggestionOpen(true)}
                    onBlur={() => window.setTimeout(() => setIsSuggestionOpen(false), 160)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleGeocodeAddress();
                      }
                    }}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#818A91]">search</span>
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-[#FF8228]/10 text-[#FF8228] transition-all hover:bg-[#FF8228] hover:text-white"
                    aria-label="Xác nhận địa chỉ"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  {isSuggestionOpen && addressSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-xl">
                      {addressSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id || suggestion.description}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FF8228]/5"
                        >
                          <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#FF8228]">place</span>
                          <span>
                            <span className="block text-sm font-bold text-[#1b1c1c]">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </span>
                            {suggestion.structured_formatting?.secondary_text && (
                              <span className="mt-0.5 block text-xs text-[#818A91]">{suggestion.structured_formatting.secondary_text}</span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocationLoading}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#E8E8E8] bg-white px-5 py-3.5 text-xs font-bold text-[#1b1c1c] shadow-sm transition-all hover:border-[#FF8228] hover:text-[#FF8228] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                  {isLocationLoading ? 'Đang tìm...' : 'Vị trí hiện tại'}
                </button>
              </div>
            </div>

            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#818A91]">
                  <span className="material-symbols-outlined text-[16px] text-[#FF8228]">home_pin</span>
                  Địa chỉ đã lưu
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {savedAddresses.map((address) => {
                    const addressText = formatSavedAddress(address);
                    const isActive = selectedLocation?.addressId === address.id;
                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(address)}
                        className={`rounded-2xl border p-3 text-left transition-all ${isActive ? 'border-[#FF8228] bg-[#FF8228]/5' : 'border-[#E8E8E8] bg-white hover:border-[#FF8228]/40'
                          }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#1b1c1c]">{address.label || 'Địa chỉ'}</span>
                          {address.isDefault && <span className="rounded-full bg-[#39B54A]/10 px-2 py-0.5 text-[10px] font-bold text-[#2C9901]">Mặc định</span>}
                        </div>
                        <p className="m-0 line-clamp-2 text-xs leading-relaxed text-[#818A91]">{addressText}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {locationError && <p className="mb-3 text-xs font-semibold text-[#EA4335]">{locationError}</p>}
            {selectedLocation && (
              <div className="mb-4 rounded-2xl border border-[#FF8228]/20 bg-[#FF8228]/5 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#FF8228]">check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-[#1b1c1c]">{selectedLocation.address}</p>
                    {selectedLocation.lat && selectedLocation.lng && (
                      <p className="mt-1 text-xs text-[#818A91]">{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-[#E8E8E8] bg-[#F5F5F5] shadow-inner md:h-[420px]">
              <GoongMapPreview selectedLocation={selectedLocation} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                  <span className="material-symbols-outlined text-[20px] text-[#FF8228]">calendar_month</span>
                </div>
                <h2 className="text-lg font-bold text-[#1b1c1c]">4. Thời gian</h2>
              </div>
              <div className="mb-5 flex rounded-2xl bg-[#F5F5F5] p-1">
                <button type="button" onClick={() => setScheduledType(BOOKING_SCHEDULED_TYPE.NOW)} className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${scheduledType === BOOKING_SCHEDULED_TYPE.NOW ? 'bg-white text-[#FF8228] shadow-sm' : 'text-[#818A91] hover:text-[#1b1c1c]'}`}>Ngay bây giờ</button>
                <button type="button" onClick={() => setScheduledType(BOOKING_SCHEDULED_TYPE.SCHEDULED)} className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${scheduledType === BOOKING_SCHEDULED_TYPE.SCHEDULED ? 'bg-white text-[#FF8228] shadow-sm' : 'text-[#818A91] hover:text-[#1b1c1c]'}`}>Đặt lịch sau</button>
              </div>
              {scheduledType === BOOKING_SCHEDULED_TYPE.SCHEDULED ? (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8E8E8] p-3.5 text-[#1b1c1c] outline-none focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/10"
                />
              ) : (
                <div className="flex w-full items-center justify-between rounded-2xl border border-[#E8E8E8] bg-[#F5F5F5] p-3.5 text-[#818A91]">
                  <span className="text-sm font-medium">Hệ thống sẽ tìm thợ gần bạn</span>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                  <span className="material-symbols-outlined text-[20px] text-[#FF8228]">person_search</span>
                </div>
                <h2 className="text-lg font-bold text-[#1b1c1c]">5. Chọn thợ</h2>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className={`flex w-full items-center rounded-2xl border-2 p-4 text-left transition-all ${proType === 'auto' ? 'border-[#FF8228] bg-[#FF8228]/5' : 'border-[#E8E8E8] hover:border-[#FF8228]/30'}`}
                  onClick={() => {
                    setProType('auto');
                    setSelectedWorker(null);
                  }}
                >
                  <span className={`h-4 w-4 rounded-full border-2 ${proType === 'auto' ? 'border-[#FF8228] bg-[#FF8228]' : 'border-[#D4D4D4]'}`} />
                  <span className="ml-3">
                    <span className="block text-sm font-bold text-[#1b1c1c]">Kết nối nhanh</span>
                    <span className="block text-[10px] text-[#818A91]">Hệ thống chọn thợ phù hợp</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`flex w-full items-center rounded-2xl border-2 p-4 text-left transition-all ${proType === 'manual' ? 'border-[#FF8228] bg-[#FF8228]/5' : 'border-[#E8E8E8] hover:border-[#FF8228]/30'}`}
                  onClick={() => { setProType('manual'); setIsModalOpen(true); }}
                >
                  <span className={`h-4 w-4 rounded-full border-2 ${proType === 'manual' ? 'border-[#FF8228] bg-[#FF8228]' : 'border-[#D4D4D4]'}`} />
                  <span className="ml-3">
                    <span className="block text-sm font-bold text-[#1b1c1c]">Chọn thợ cụ thể</span>
                    <span className="block text-[10px] text-[#818A91]">
                      {selectedWorker?.fullName ? `Đã chọn ${selectedWorker.fullName}` : 'Xem hồ sơ, giá và kinh nghiệm'}
                    </span>
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>

        <aside className="self-start space-y-5 lg:sticky lg:top-24 lg:col-span-4">
          <div className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-lg font-bold text-[#1b1c1c]">Tóm tắt yêu cầu</h3>
            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-[#4A4A4A]">
                <span>Dịch vụ</span>
                <span className="text-right font-bold text-[#1b1c1c]">{selectedServiceInfo?.name || 'Chưa chọn'}</span>
              </div>
              <div className="flex justify-between gap-3 text-[#4A4A4A]">
                <span>Tạm tính</span>
                <span className="text-right font-bold text-[#1b1c1c]">
                  {isPriceLoading ? 'Đang tải...' : formatCurrency(estimatedCost)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[#4A4A4A]">
                <span>Thời gian</span>
                <span className="text-right font-bold text-[#1b1c1c]">{scheduledType === 0 ? 'Ngay bây giờ' : scheduledAt || 'Chưa chọn'}</span>
              </div>
              <div className="flex justify-between gap-3 text-[#4A4A4A]">
                <span>Chọn thợ</span>
                <span className="text-right font-bold text-[#1b1c1c]">{proType === 'auto' ? 'Hệ thống tự chọn' : selectedWorker?.fullName || 'Chưa chọn'}</span>
              </div>
              <div className="flex justify-between gap-3 text-[#4A4A4A]">
                <span>Ảnh đính kèm</span>
                <span className="font-bold text-[#1b1c1c]">{problemImages.length}/5</span>
              </div>
              <div className="border-t border-[#E8E8E8] pt-4">
                <span className="block font-bold text-[#1b1c1c]">Địa chỉ</span>
                <p className="mt-1 text-xs leading-relaxed text-[#818A91]">{selectedLocation?.address || 'Chưa chọn địa chỉ'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateDraft}
              disabled={isSubmitting}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl !bg-[#FF8228] py-3.5 text-sm font-bold !text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang tạo yêu cầu...' : 'Gửi yêu cầu ngay'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5F5F5] py-3 text-[#818A91]">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Bảo mật & An toàn</span>
            </div>
          </div>
        </aside>
      </div>

      <TechnicianSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={selectedService}
        selectedWorker={selectedWorker}
        onSelect={(worker) => {
          setSelectedWorker(worker);
          setProType('manual');
        }}
      />
    </div>
  );
}
