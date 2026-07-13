'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Image as AntImage, Spin, Tabs } from 'antd';
import { workerProfileApi } from '@/apis/worker-profile.api';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getImageUrl(img) {
  return img?.fileUrl || img?.url || img?.preview;
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#777777]">
      {children}
    </label>
  );
}

function FieldInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-[#DDDDDD] px-3 py-2.5 text-sm text-[#383838] outline-none transition focus:border-primary focus-visible:!outline-none focus:!ring-0 disabled:cursor-not-allowed disabled:bg-[#F5F5F5]"
    />
  );
}

function SaveButton({ loading, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 rounded-lg bg-[#FF8228] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? <Spin size="small" />
        : <span className="material-symbols-outlined text-[18px]">save</span>}
      Lưu thay đổi
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1: Basic Profile Info
// ══════════════════════════════════════════════════════════════
function BasicInfoTab({ profile, onSaved }) {
  const { message } = App.useApp();
  const [form, setForm] = useState({
    phone:           profile?.phone ?? '',
    bio:             profile?.bio ?? '',
    experienceYears: profile?.experienceYears ?? 0,
    maxDistanceKm:   profile?.maxDistanceKm ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await workerProfileApi.updateMe({
        phone:           form.phone || undefined,
        bio:             form.bio || undefined,
        experienceYears: Number(form.experienceYears) || 0,
        maxDistanceKm:   Number(form.maxDistanceKm) || 0,
      });
      message.success('Đã cập nhật thông tin hồ sơ.');
      onSaved?.();
    } catch {
      message.error('Không thể lưu thông tin, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Số điện thoại</FieldLabel>
          <FieldInput value={form.phone} onChange={set('phone')} placeholder="0901 234 567" />
        </div>
        <div>
          <FieldLabel>Kinh nghiệm (năm)</FieldLabel>
          <FieldInput value={form.experienceYears} onChange={set('experienceYears')} type="number" placeholder="2" />
        </div>
        <div>
          <FieldLabel>Bán kính phục vụ (km)</FieldLabel>
          <FieldInput value={form.maxDistanceKm} onChange={set('maxDistanceKm')} type="number" placeholder="25" />
        </div>
      </div>
      <div>
        <FieldLabel>Giới thiệu bản thân</FieldLabel>
        <textarea
          rows={4}
          value={form.bio ?? ''}
          onChange={(e) => set('bio')(e.target.value)}
          placeholder="Mô tả ngắn về kinh nghiệm và thế mạnh của bạn..."
          className="w-full resize-none rounded-lg border border-[#DDDDDD] px-3 py-2.5 text-sm text-[#383838] outline-none transition focus:border-primary focus-visible:!outline-none focus:!ring-0"
        />
      </div>
      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 2: Identification Images (CCCD)
// ══════════════════════════════════════════════════════════════
function IdentificationTab({ profile, onSaved }) {
  const { message } = App.useApp();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    citizenIdNumber:    profile?.citizenIdNumber ?? '',
    citizenIdIssueDate: profile?.citizenIdIssueDate ? profile.citizenIdIssueDate.slice(0, 10) : '',
    citizenIdIssuePlace: profile?.citizenIdIssuePlace ?? '',
  });
  const [newImages, setNewImages] = useState([]);   // File objects for upload
  const [previews, setPreviews] = useState([]);      // { url, isNew, file? }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const existing = (profile?.identificationImages || profile?.identificateImages || []).map((img) => ({
      url: getImageUrl(img),
      isNew: false,
    }));
    queueMicrotask(() => {
      if (alive) setPreviews(existing);
    });

    return () => {
      alive = false;
    };
  }, [profile]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f) => ({ url: URL.createObjectURL(f), isNew: true, file: f }));
    setPreviews((prev) => [...prev, ...next]);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeNew = (index) => {
    const preview = previews[index];
    if (preview.isNew) URL.revokeObjectURL(preview.url);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => {
      const newIdx = previews.slice(0, index).filter((p) => p.isNew).length;
      return prev.filter((_, i) => i !== newIdx);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workerProfileApi.updateIdentificationImages({
        citizenIdNumber:    form.citizenIdNumber || undefined,
        citizenIdIssueDate: form.citizenIdIssueDate || undefined,
        citizenIdIssuePlace: form.citizenIdIssuePlace || undefined,
        images: newImages,
      });
      message.success('Đã cập nhật thông tin CCCD.');
      onSaved?.();
    } catch {
      message.error('Không thể lưu, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Số CCCD</FieldLabel>
          <FieldInput value={form.citizenIdNumber} onChange={set('citizenIdNumber')} placeholder="012345678901" />
        </div>
        <div>
          <FieldLabel>Ngày cấp</FieldLabel>
          <FieldInput value={form.citizenIdIssueDate} onChange={set('citizenIdIssueDate')} type="date" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Nơi cấp</FieldLabel>
          <FieldInput value={form.citizenIdIssuePlace} onChange={set('citizenIdIssuePlace')} placeholder="Cục Cảnh sát QLHC về TTXH" />
        </div>
      </div>

      <div>
        <FieldLabel>Ảnh CCCD ({previews.length}/2)</FieldLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={p.url || i} className="group relative aspect-[1.6] overflow-hidden rounded-lg border border-[#DDDDDD] bg-[#FAFAFA]">
              <AntImage
                src={p.url}
                alt={`CCCD ${i + 1}`}
                className="!h-full !w-full !object-cover"
                rootClassName="block h-full w-full"
                preview={{ mask: 'Xem ảnh' }}
              />
              {p.isNew && (
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#EA4335] shadow-sm hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              {p.isNew && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">Mới</span>
              )}
            </div>
          ))}
          {previews.length < 2 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[1.6] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#DDDDDD] text-[#9A9A9A] transition hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              <span className="text-xs font-semibold">Thêm ảnh</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <p className="mt-2 text-xs text-[#9A9A9A]">Chụp rõ 4 góc, không bị chói sáng. Tối đa 2 ảnh (mặt trước & mặt sau).</p>
      </div>

      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 3: Portfolio Images
// ══════════════════════════════════════════════════════════════
function PortfolioTab({ profile, onSaved }) {
  const { message } = App.useApp();
  const fileRef = useRef(null);
  const [images, setImages] = useState(() =>
    (profile?.portfolioImages || profile?.profolioImages || []).map((img) => ({
      id: img.id,
      url: getImageUrl(img),
      isNew: false,
    }))
  );
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f) => ({ id: null, url: URL.createObjectURL(f), isNew: true, file: f }));
    setImages((prev) => [...prev, ...next]);
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!newFiles.length) { message.info('Không có ảnh mới để tải lên.'); return; }
    setUploading(true);
    try {
      await workerProfileApi.uploadPortfolioImages(newFiles);
      message.success(`Đã tải lên ${newFiles.length} ảnh portfolio.`);
      setNewFiles([]);
      onSaved?.();
    } catch {
      message.error('Tải ảnh thất bại, vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (img, index) => {
    if (img.isNew) {
      URL.revokeObjectURL(img.url);
      setImages((prev) => prev.filter((_, i) => i !== index));
      setNewFiles((prev) => {
        const newIdx = images.slice(0, index).filter((p) => p.isNew).length;
        return prev.filter((_, i) => i !== newIdx);
      });
      return;
    }
    if (!img.id) return;
    setDeletingId(img.id);
    try {
      await workerProfileApi.deletePortfolioImage(img.id);
      setImages((prev) => prev.filter((_, i) => i !== index));
      message.success('Đã xoá ảnh.');
    } catch {
      message.error('Xoá ảnh thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.url || i} className="group relative aspect-square overflow-hidden rounded-xl border border-[#DDDDDD] bg-[#FAFAFA]">
            <AntImage
              src={img.url}
              alt={`Portfolio ${i + 1}`}
              className="!h-full !w-full !object-cover"
              rootClassName="block h-full w-full"
              preview={{ mask: 'Xem ảnh' }}
            />
            <button
              type="button"
              disabled={deletingId === img.id}
              onClick={() => handleDelete(img, i)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#EA4335] opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-white disabled:opacity-50"
            >
              {deletingId === img.id
                ? <Spin size="small" />
                : <span className="material-symbols-outlined text-[16px]">delete</span>}
            </button>
            {img.isNew && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">Mới</span>
            )}
          </div>
        ))}

        {/* Add more button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DDDDDD] text-[#9A9A9A] transition hover:border-primary hover:text-primary"
        >
          <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
          <span className="text-xs font-semibold">Thêm ảnh</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

      {newFiles.length > 0 && (
        <p className="text-sm text-[#555555]">
          <span className="font-bold text-primary">{newFiles.length}</span> ảnh mới chưa được lưu.
        </p>
      )}

      <div className="flex justify-end">
        <SaveButton loading={uploading} onClick={handleUpload} disabled={!newFiles.length} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main exported component
// ══════════════════════════════════════════════════════════════
export function ProfileEditView() {
  const { message } = App.useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await workerProfileApi.getMe();
      setProfile(res?.data || res);
    } catch {
      message.error('Không thể tải hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) fetchProfile();
    });

    return () => {
      alive = false;
    };
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const tabs = [
    {
      key: 'basic',
      label: (
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">person</span>
          Thông tin cơ bản
        </span>
      ),
      children: <BasicInfoTab profile={profile} onSaved={fetchProfile} />,
    },
    {
      key: 'cccd',
      label: (
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">badge</span>
          CCCD / Định danh
        </span>
      ),
      children: <IdentificationTab profile={profile} onSaved={fetchProfile} />,
    },
    {
      key: 'portfolio',
      label: (
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">photo_library</span>
          Portfolio
        </span>
      ),
      children: <PortfolioTab profile={profile} onSaved={fetchProfile} />,
    },
  ];

  return (
    <div className="mx-auto max-w-[900px] p-5 md:p-6">
      {/* Header */}
      <div className="mb-6 rounded-xl border border-border-light bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">manage_accounts</span>
          <div>
            <h2 className="m-0 text-xl font-bold text-[#383838]">Hồ sơ của tôi</h2>
            <p className="m-0 mt-0.5 text-sm text-[#777777]">
              Cập nhật thông tin nghề nghiệp, giấy tờ và ảnh công trình.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border-light bg-white p-5 shadow-sm">
        <Tabs items={tabs} destroyOnHidden={false} />
      </div>
    </div>
  );
}
