'use client';

/**
 * Floating Action Button - Quick booking CTA
 * Fixed position, expands on hover to show label
 */
export function FloatingActionButton() {
  return (
    <button className="fab" aria-label="Đặt Thợ Nhanh">
      <span className="material-symbols-outlined">add</span>
      <span className="fab-label">Đặt Thợ Nhanh</span>
    </button>
  );
}
