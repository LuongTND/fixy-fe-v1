'use client';

import { useState } from 'react';
import '../admin-dashboard.css';
import { AdminShell } from '../_components/AdminShell';
import { TechnicianStats } from '@/components/feature/admin/technicians/TechnicianStats';
import { TechnicianTable } from '@/components/feature/admin/technicians/TechnicianTable';

export default function AdminTechniciansPage() {
  const [profileSummary, setProfileSummary] = useState({ items: [], totalCount: 0 });

  return (
    <AdminShell activeKey="technicians">
      <section className="admin-page-heading">
        <div>
          <h2>Quản Lý Kỹ Thuật Viên</h2>
          <p>Duyệt hồ sơ, kiểm tra năng lực và quản lý mạng lưới chuyên gia dịch vụ.</p>
        </div>
      </section>

      <TechnicianStats profiles={profileSummary.items} totalCount={profileSummary.totalCount} />
      <TechnicianTable onProfilesLoaded={setProfileSummary} />
    </AdminShell>
  );
}
