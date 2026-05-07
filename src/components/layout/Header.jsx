'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className='bg-white shadow'>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='text-2xl font-bold text-blue-600'>
            Fixy
          </Link>
          <div className='flex gap-4'>
            <Link href='/' className='hover:text-blue-600'>
              Home
            </Link>
            <Link href='/login' className='hover:text-blue-600'>
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
