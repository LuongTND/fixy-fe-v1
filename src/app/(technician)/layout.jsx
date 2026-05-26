import { TechnicianShell } from '@/components/feature/technician/TechnicianShell';

export const metadata = {
  title: 'Vua Thợ - Technician Dashboard',
  description: 'Bảng điều khiển dành cho thợ nghề Vua Thợ',
};

export default function TechnicianLayout({ children }) {
  return <TechnicianShell>{children}</TechnicianShell>;
}
