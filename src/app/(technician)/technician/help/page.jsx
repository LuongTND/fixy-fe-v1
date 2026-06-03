import { SupportCenterView } from '@/components/feature/support/SupportCenterView';

export const metadata = {
  title: 'Trung tâm hỗ trợ thợ - Vua Thợ',
};

export default function TechnicianHelpPage() {
  return <SupportCenterView audience="worker" />;
}
