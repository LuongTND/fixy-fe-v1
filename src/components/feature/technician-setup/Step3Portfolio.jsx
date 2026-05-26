'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as AntImage, Select, Steps } from 'antd';
import { vietnamProvincesApi, matchProvince, matchWard, filterAddressOption } from '@/apis/vietnam-provinces.api';

function getRawFile(file) {
  return file?.rawFile || file?.originFileObj || file;
}

function createPortfolioUploadItem(file) {
  const rawFile = getRawFile(file);
  const uid = file?.uid || `${rawFile?.name || 'portfolio'}-${rawFile?.lastModified || Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    uid,
    name: rawFile?.name || file?.name || 'Ảnh công trình',
    size: rawFile?.size || file?.size || 0,
    rawFile,
    previewUrl: rawFile instanceof Blob && rawFile.type?.startsWith('image/')
      ? URL.createObjectURL(rawFile)
      : '',
  };
}

export function Step3Portfolio({ onSubmit, onPrev, onUpdate, data = {}, submitting = false, isEditMode = false }) {
  const [radius, setRadius] = useState(data.maxDistanceKm || 25);
  const [address, setAddress] = useState({
    label: data.address?.label || '',
    city: data.address?.city || '',
    district: '',
    ward: data.address?.ward || '',
    detail: data.address?.detail || '',
    lat: data.address?.lat || '',
    lng: data.address?.lng || '',
    isDefault: data.address?.isDefault ?? true,
  });
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [legacyWardsMap, setLegacyWardsMap] = useState({});
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const loadProvincesData = useCallback(async (currentAddress = null) => {
    try {
      setLoadingProvinces(true);
      setLegacyWardsMap({});
      const provs = await vietnamProvincesApi.getProvinces();
      setProvinces(provs || []);
      
      if (currentAddress) {
        const matchedProv = matchProvince(provs || [], currentAddress.city);
        if (matchedProv) {
          setLoadingWards(true);
          const provData = await vietnamProvincesApi.getProvinceWithWards(matchedProv.code);
          const wardList = provData?.wards || [];
          setWards(wardList);
          
          const matchedW = matchWard(wardList, currentAddress.ward);
          
          setAddress({
            label: currentAddress.label || '',
            city: matchedProv.name,
            district: '',
            ward: matchedW ? matchedW.name : currentAddress.ward,
            detail: currentAddress.detail || '',
            lat: currentAddress.lat || '',
            lng: currentAddress.lng || '',
            isDefault: currentAddress.isDefault ?? true,
          });
          setLoadingWards(false);
          return;
        }
      }
      setWards([]);
    } catch (err) {
      console.error('Failed to load provinces:', err);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  const handleProvinceChange = async (cityName) => {
    setAddress(prev => ({ ...prev, city: cityName, ward: '' }));
    setWards([]);
    setLegacyWardsMap({});
    if (!cityName) return;
    
    try {
      setLoadingWards(true);
      const matchedProv = provinces.find(p => p.name === cityName);
      if (matchedProv) {
        const provData = await vietnamProvincesApi.getProvinceWithWards(matchedProv.code);
        setWards(provData?.wards || []);
      }
    } catch (err) {
      console.error('Failed to load wards:', err);
    } finally {
      setLoadingWards(false);
    }
  };

  const searchLegacyTimeoutRef = useRef(null);

  const handleWardSearch = async (searchText) => {
    if (!searchText || searchText.trim().length < 2) return;
    
    if (searchLegacyTimeoutRef.current) {
      clearTimeout(searchLegacyTimeoutRef.current);
    }

    searchLegacyTimeoutRef.current = setTimeout(async () => {
      try {
        const cleanedQuery = searchText.trim();
        const res = await vietnamProvincesApi.searchLegacyWards(cleanedQuery);
        const matches = res.value || [];
        
        const selectedProv = provinces.find(p => p.name === address.city);
        if (!selectedProv) return;
        
        const filteredMatches = matches.filter(m => m.ward.province_code === selectedProv.code);
        
        for (const match of filteredMatches) {
          const newWardCode = match.ward.code;
          if (!legacyWardsMap[newWardCode]) {
            const legacyRes = await vietnamProvincesApi.getLegacyWardsForNewWard(newWardCode);
            const legacyNames = (legacyRes.value || []).map(lw => lw.name);
            setLegacyWardsMap(prev => ({
              ...prev,
              [newWardCode]: legacyNames
            }));
          }
        }
      } catch (err) {
        console.error('Failed to search legacy wards:', err);
      }
    }, 400);
  };

  const getWardOptions = () => {
    return wards.map((w) => {
      const legacyNames = legacyWardsMap[w.code];
      const label = legacyNames && legacyNames.length > 0
        ? `${w.name} (Gộp từ: ${legacyNames.join(', ')})`
        : w.name;
      return {
        value: w.name,
        label: label,
      };
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProvincesData(data.address);
    }, 0);
    return () => clearTimeout(timer);
  }, [data.address, loadProvincesData]);

  const [portfolioUploads, setPortfolioUploads] = useState(() => (
    (data.portfolioUploads || []).map((file) => (file.previewUrl ? file : createPortfolioUploadItem(file)))
  ));
  const portfolioUploadsRef = useRef(portfolioUploads);
  const [basePrices, setBasePrices] = useState(() => (
    (data.workerService || []).reduce((acc, service) => ({
      ...acc,
      [service.categoryId]: service.basePrice || '',
    }), {})
  ));

  const selectedServices = data.workerService || [];

  useEffect(() => {
    portfolioUploadsRef.current = portfolioUploads;
  }, [portfolioUploads]);

  useEffect(() => () => {
    portfolioUploadsRef.current.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
  }, []);

  const updateAddress = (key, value) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const addPortfolioFiles = (fileList) => {
    const files = Array.from(fileList || []);
    setPortfolioUploads((current) => {
      const currentKeys = new Set(current.map((file) => file.uid || file.name));
      const nextFiles = files
        .map(createPortfolioUploadItem)
        .filter((file) => file.rawFile instanceof Blob && !currentKeys.has(file.uid));

      return [...current, ...nextFiles];
    });
  };

  const removePortfolioFile = (uid) => {
    setPortfolioUploads((current) => {
      const removed = current.find((file) => file.uid === uid);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((file) => file.uid !== uid);
    });
  };

  const handleSubmit = () => {
    const workerService = selectedServices.map((service, index) => ({
      ...service,
      basePrice: Number(basePrices[service.categoryId] || 0),
      isPrimary: index === 0,
    }));
    const finalData = {
      maxDistanceKm: Number(radius),
      address: {
        ...address,
        district: '',
        lat: address.lat === '' ? undefined : Number(address.lat),
        lng: address.lng === '' ? undefined : Number(address.lng),
      },
      portfolioUploads: portfolioUploads.map(getRawFile),
      workerService,
    };
    onUpdate(finalData);
    onSubmit(finalData);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-bg p-4 shadow-sm md:p-5">
        <Steps
          current={2}
          responsive
          items={[
            { title: 'Thông tin cơ bản', description: 'Dịch vụ và hồ sơ' },
            { title: 'Xác minh', description: 'Giấy tờ cần duyệt' },
            { title: 'Hoàn thiện', description: 'Ảnh và khu vực' },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <h2 className="m-0 font-h3">Service Area</h2>
            </div>
            <div className="flex flex-col gap-4 border-t border-border-light pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="block font-small-bold text-text-secondary">Nhãn địa chỉ</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={address.label}
                    onChange={(event) => updateAddress('label', event.target.value)}
                    placeholder="Nhà riêng, cửa hàng..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Tỉnh / thành phố</label>
                  <Select
                    showSearch
                    filterOption={filterAddressOption}
                    size="large"
                    className="w-full"
                    placeholder="Chọn Tỉnh / thành phố"
                    value={address.city || undefined}
                    onChange={(value) => handleProvinceChange(value)}
                    loading={loadingProvinces}
                    disabled={loadingProvinces}
                    options={provinces.map((prov) => ({
                      value: prov.name,
                      label: prov.name,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Phường / xã</label>
                  <Select
                    showSearch
                    filterOption={filterAddressOption}
                    onSearch={handleWardSearch}
                    size="large"
                    className="w-full"
                    placeholder="Chọn Phường / xã"
                    value={address.ward || undefined}
                    onChange={(value) => updateAddress('ward', value)}
                    loading={loadingWards}
                    disabled={loadingWards || !address.city}
                    options={getWardOptions()}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block font-small-bold text-text-secondary">Địa chỉ chi tiết</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={address.detail}
                    onChange={(event) => updateAddress('detail', event.target.value)}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Vĩ độ</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={address.lat}
                    onChange={(event) => updateAddress('lat', event.target.value)}
                    placeholder="10.776889"
                    type="number"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Kinh độ</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={address.lng}
                    onChange={(event) => updateAddress('lng', event.target.value)}
                    placeholder="106.700806"
                    type="number"
                    step="any"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <input
                  checked={address.isDefault}
                  onChange={(event) => updateAddress('isDefault', event.target.checked)}
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                />
                Đặt làm địa chỉ mặc định
              </label>

              <div className="flex items-center justify-between">
                <label className="font-small-bold text-text-tertiary">Maximum Travel Radius</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                    className="w-16 rounded border border-border-light px-2 py-1 text-right font-body-bold text-primary outline-none"
                  />
                  <span className="font-body-bold text-primary">km</span>
                </div>
              </div>
              <input
                className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-border-light"
                max="100"
                min="5"
                type="range"
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
              />
              <div className="flex justify-between text-[10px] font-bold uppercase text-text-tertiary">
                <span>5 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                <h2 className="m-0 font-h3">Portfolio</h2>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                Thêm ảnh
                <input
                  className="hidden"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => addPortfolioFiles(event.target.files)}
                />
              </label>
            </div>
            {portfolioUploads.length === 0 ? (
              <div className="rounded-lg bg-background px-4 py-3 text-sm text-text-tertiary">
                Chưa chọn ảnh công trình. Bạn có thể bổ sung ảnh để hồ sơ thuyết phục hơn.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {portfolioUploads.map((file) => (
                  <div key={file.uid} className="overflow-hidden rounded-xl border border-border-light bg-background shadow-sm">
                    <div className="relative aspect-[1.45] bg-white">
                      {file.previewUrl ? (
                        <AntImage
                          src={file.previewUrl}
                          alt={file.name}
                          className="h-full w-full object-cover cursor-zoom-in"
                          rootClassName="h-full w-full block"
                          preview={{ mask: 'Xem ảnh' }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-text-tertiary">
                          Không thể xem trước
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePortfolioFile(file.uid);
                        }}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/95 text-error shadow-sm hover:bg-error-light cursor-pointer transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                    <div className="px-3 py-2">
                      {/* <p className="m-0 truncate text-sm font-semibold text-text-secondary">{file.name}</p>
                      <p className="m-0 text-[11px] text-text-tertiary">{Math.ceil(file.size / 1024)} KB</p> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h2 className="m-0 font-h3">Base Pricing</h2>
              </div>
              <p className="mb-6 font-small text-text-tertiary">Set your starting rates per selected service category.</p>
              <div className="space-y-4">
                {selectedServices.length === 0 && (
                  <p className="text-sm text-text-tertiary">Chưa chọn dịch vụ ở bước 1.</p>
                )}
                {selectedServices.map((service) => (
                  <div key={service.categoryId} className="rounded-lg border border-border-light bg-background p-4">
                    <label className="mb-2 block font-small-bold">{service.categoryName || service.categoryId}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">₫</span>
                      <input
                        className="w-full rounded-lg border border-border-light py-2 pl-8 pr-4 text-right font-body-bold outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0"
                        type="number"
                        min="0"
                        value={basePrices[service.categoryId] || ''}
                        onChange={(event) => setBasePrices((current) => ({
                          ...current,
                          [service.categoryId]: event.target.value,
                        }))}
                      />
                    </div>
                    <span className="mt-1 block text-[10px] text-text-tertiary">Min. base fee per visit</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="flex flex-col gap-4">
              <button
                className="w-full rounded-full border-none bg-primary py-4 font-body-bold text-white shadow-md transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (isEditMode ? 'Đang cập nhật...' : 'Đang gửi...') : (isEditMode ? 'Cập nhật và gửi lại' : 'Gửi hồ sơ')}
              </button>
              <button className="flex items-center justify-center gap-2 border-none bg-transparent py-2 font-body text-text-tertiary transition-colors hover:text-text-secondary" onClick={onPrev}>
                <span className="material-symbols-outlined">arrow_back</span>
                {isEditMode ? 'Quay lại bước trước' : 'Back to Step 2'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
