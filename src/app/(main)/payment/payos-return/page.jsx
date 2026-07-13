import { Suspense } from 'react';
import { PayosReturnView } from '@/components/feature/payment/PayosReturnView';

export default function PayosReturnPage() {
  return (
    <Suspense fallback={null}>
      <PayosReturnView />
    </Suspense>
  );
}
