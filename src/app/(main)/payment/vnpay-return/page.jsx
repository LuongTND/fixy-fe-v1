import { Suspense } from 'react';
import { VnpayReturnView } from '@/components/feature/payment/VnpayReturnView';

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={null}>
      <VnpayReturnView />
    </Suspense>
  );
}
