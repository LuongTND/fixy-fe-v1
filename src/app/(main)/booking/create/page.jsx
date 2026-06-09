'use client';

import { Suspense } from 'react';
import { CreateRequestView } from '@/components/feature/booking/CreateRequestView';

export default function BookingCreatePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-text-tertiary">Đang tải form yêu cầu...</div>}>
      <CreateRequestView />
    </Suspense>
  );
}
