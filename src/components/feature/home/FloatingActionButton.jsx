'use client';

import { useRouter } from 'next/navigation';

/**
 * Floating Action Button - Quick booking CTA
 * Fixed position, expands on hover to show label
 */
export function FloatingActionButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push('/booking/create')} 
      className="fab" 
      aria-label="Đặt Thợ Nhanh"
    >
      <span className="material-symbols-outlined">add</span>
      <span className="fab-label">Đặt Thợ Nhanh</span>
    </button>
  );
}
