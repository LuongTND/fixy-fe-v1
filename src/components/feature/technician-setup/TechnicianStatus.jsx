'use client';

import { useEffect, useState } from 'react';
import { workerProfileApi } from '@/apis/worker-profile.api';
import { StatusPending } from './status/StatusPending';
import { StatusRejected } from './status/StatusRejected';
import { StatusApproved } from './status/StatusApproved';
import { StatusSuspended } from './status/StatusSuspended';

function mapWorkerStatus(status) {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    if (normalized.includes('approve')) return 'approved';
    if (normalized.includes('reject')) return 'rejected';
    if (normalized.includes('suspend')) return 'suspended';
    return 'pending';
  }

  switch (status) {
    case 1:
      return 'approved';
    case 2:
      return 'rejected';
    case 3:
      return 'suspended';
    case 0:
    default:
      return 'pending';
  }
}

export function TechnicianStatus({ profile: initialProfile = null, onRefresh, onStartEdit }) {
  const [fetchedProfile, setFetchedProfile] = useState(null);
  const [loading, setLoading] = useState(!initialProfile);
  const profile = initialProfile || fetchedProfile;

  useEffect(() => {
    if (initialProfile) {
      return;
    }

    let ignore = false;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await workerProfileApi.getMe();
        if (!ignore) setFetchedProfile(response || null);
      } catch {
        if (!ignore) setFetchedProfile(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    queueMicrotask(fetchProfile);

    return () => {
      ignore = true;
    };
  }, [initialProfile]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border-light bg-surface-bg p-8 text-center text-sm font-semibold text-text-tertiary shadow-sm">
        Đang kiểm tra trạng thái hồ sơ...
      </div>
    );
  }

  if (!profile?.id) {
    return (
      <div className="rounded-xl border border-border-light bg-surface-bg p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-text-secondary">Chưa có hồ sơ thợ</h2>
        <p className="m-0 text-sm text-text-tertiary">Vui lòng hoàn tất các bước thiết lập hồ sơ để gửi xét duyệt.</p>
      </div>
    );
  }

  const status = mapWorkerStatus(profile.status);
  const statusLabel = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
    suspended: 'Tạm ngưng',
  }[status];

  return (
    <div className="w-full">
      <div className="mb-5 rounded-xl border border-border-light bg-surface-bg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">Trạng thái hồ sơ</p>
            <h2 className="m-0 mt-1 text-xl font-bold text-text-secondary">{statusLabel}</h2>
            <p className="m-0 mt-1 text-sm text-text-tertiary">{profile.email || profile.phone || profile.fullName}</p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-full border border-border-light bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary"
            >
              Làm mới
            </button>
          )}
        </div>
      </div>

      {status === 'pending' && <StatusPending profile={profile} />}
      {status === 'rejected' && <StatusRejected profile={profile} onStartEdit={onStartEdit} />}
      {status === 'approved' && <StatusApproved profile={profile} />}
      {status === 'suspended' && <StatusSuspended profile={profile} />}
    </div>
  );
}
