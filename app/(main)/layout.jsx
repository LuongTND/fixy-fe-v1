import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { FloatingActionButton } from '@/components/feature/home/FloatingActionButton';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        {children}
      </main>
      <Footer />
      <MobileNav />
      <FloatingActionButton />
    </div>
  );
}
