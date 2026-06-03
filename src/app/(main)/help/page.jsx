import { SupportCenterView } from '@/components/feature/support/SupportCenterView';

export const metadata = {
  title: 'Trung tâm hỗ trợ - Vua Thợ',
};

export default function HelpPage() {
  return <SupportCenterView audience="customer" />;
}
