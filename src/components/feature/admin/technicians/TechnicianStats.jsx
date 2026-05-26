'use client';

import { Card } from 'antd';
import { SymbolIcon } from '@/app/(main)/dashboard/_components/AdminShell';
import { WORKER_STATUS, WORKER_STATUS_TEXT } from '@/constants/enums';

const emptyStats = {
  total: 0,
  pending: 0,
  approved: 0,
  suspended: 0,
};

const normalizeStatus = (status) => {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    if (normalized.includes('approve') || normalized.includes('active')) return WORKER_STATUS.APPROVED;
    if (normalized.includes('suspend') || normalized.includes('lock') || normalized.includes('block')) return WORKER_STATUS.SUSPENDED;
    if (normalized.includes('reject')) return WORKER_STATUS.REJECTED;
    return WORKER_STATUS.PENDING;
  }

  return Number.isInteger(status) ? status : WORKER_STATUS.PENDING;
};

export function TechnicianStats({ profiles = [], totalCount = 0 }) {
  const stats = profiles.reduce((acc, profile) => {
    const status = normalizeStatus(profile.status);
    if (WORKER_STATUS_TEXT[status] === WORKER_STATUS_TEXT[WORKER_STATUS.PENDING]) acc.pending += 1;
    if (WORKER_STATUS_TEXT[status] === WORKER_STATUS_TEXT[WORKER_STATUS.APPROVED]) acc.approved += 1;
    if (WORKER_STATUS_TEXT[status] === WORKER_STATUS_TEXT[WORKER_STATUS.SUSPENDED]) acc.suspended += 1;
    return acc;
  }, { ...emptyStats, total: totalCount });

  const statCards = [
    { icon: 'engineering', label: 'Tổng kỹ thuật viên', value: stats.total.toLocaleString('vi-VN'), tone: 'orange' },
    { icon: 'pending_actions', label: 'Chờ duyệt', value: stats.pending.toLocaleString('vi-VN'), tone: 'blue' },
    { icon: 'verified', label: 'Đang hoạt động', value: stats.approved.toLocaleString('vi-VN'), tone: 'green' },
    { icon: 'block', label: 'Tài khoản khóa', value: stats.suspended.toLocaleString('vi-VN'), tone: 'error' },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="admin-tech-stat-card">
          <div className="flex items-center gap-4">
            <span className={`admin-tech-stat-icon admin-tech-stat-${stat.tone}`}>
              <SymbolIcon>{stat.icon}</SymbolIcon>
            </span>
            <div>
              <p className="m-0 text-xs font-semibold uppercase text-[#555555]">{stat.label}</p>
              <h3 className="m-0 text-2xl font-bold text-[#383838]">{stat.value}</h3>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
