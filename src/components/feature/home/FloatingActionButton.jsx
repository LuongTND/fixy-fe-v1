'use client';

import { useRouter } from 'next/navigation';
import { FloatButton } from "antd";

export function FloatingActionButton() {
  const router = useRouter();

  return (
    <FloatButton
      className="home-float-button"
      icon={<span className="material-symbols-outlined">add</span>}
      tooltip="Đặt Thợ Nhanh"
      aria-label="Đặt Thợ Nhanh"
      onClick={() => router.push('/booking/create')}
    />
  );
}
