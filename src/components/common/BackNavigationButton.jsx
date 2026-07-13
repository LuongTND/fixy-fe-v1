'use client';

import { useRouter } from 'next/navigation';

export function BackNavigationButton({ children, className = '', fallbackHref = '/' }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" className={className} onClick={handleBack}>
      {children}
    </button>
  );
}
