'use client';

import { SearchFilters } from '@/components/feature/search/SearchFilters';
import { WorkerCard } from '@/components/feature/search/WorkerCard';

const mockPros = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    specialty: 'Master Electrician',
    rating: 4.9,
    completedJobs: '1,240+',
    distance: 'Dist. 7, HCM (2.4 km)',
    priceRange: '150k - 300k',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOGeSym0oLOOqAIVZXZg_bB8_20bgpLFaY2su6f_gN1rZcGe1ttUBR0XgLL_Otujk4L8TULf_spyf6BjD5FRVp0mECKJtFfp1qHt_moBhWpRfhL8VaL9Lk_PjeHLqcrPycH4cZ9IKGfdP1olcKIgIr43-b6iAuH1xzeohfOaEHUOpsKr4j5VqY3ktu6-3Bi6Per6Gs4QCbBcuBT4jNioNr3tkY0BnbpM7oL3gN60TJe8dphfSwggTZgBOGSrponx7txoIAnncd6Kk',
    online: true,
  },
  {
    id: 2,
    name: 'Trần Thị Minh',
    specialty: 'Plumbing Specialist',
    rating: 4.8,
    completedJobs: '850+',
    distance: 'Binh Thanh, HCM (4.1 km)',
    priceRange: '200k - 500k',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANOoWPaKVwLp9LSdkHAP4Ielhe6OGrqudemPw9XjJYya3dOMTSFj11O_iSIIFX2x7jCDBXNRkT71p-Ll2brG4HPAKA1FAzcPfQsHS5oSiDV-sJJNG_HcoZIDKBeX6QgyrpAgHheEbSS_zUYdOj9WRDrcFreAXVobxs2GYPb09A9c4t4JhyTDbW5uOv36IssgXUNPy9MPDX2CsmecmA7BLB9mYbGP_q45oAh94zRhEXQ-I-i_O2rIe-3i_KYLd1Dxun0Qu3Ecgjxiw',
    online: false,
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    specialty: 'AC & HVAC Expert',
    rating: 4.7,
    completedJobs: '620+',
    distance: 'Dist. 1, HCM (1.2 km)',
    priceRange: '300k - 800k',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb8KjRoMiHd17x0evRkEDa-Cp8az7dpbSHeV3OM6kXQs4GMr31s88pb3iaHS5cF7Vmuh3nsbpONpMGXJ6B2yhiWZe-yGEMpvPn_k2Bax_XznB8Zz19VFbOe5JM9-KlCLZ9HSxjrVDnrBEb5lDHlNb8JB1Hjro4AZM_rvdFD_IZ--kulV7QhLWSEsgMtlXdOqiidHlHWxPFsnDvdosPHskDoubnfVjgBO0gln0VChBVQtOQEt1huq5trpFjQ43cRq_uMoIsJpSiPzU',
    online: true,
  },
  {
    id: 4,
    name: 'Phạm Minh Đức',
    specialty: 'Security & Locksmith',
    rating: 5.0,
    completedJobs: '210+',
    distance: 'Go Vap, HCM (6.5 km)',
    priceRange: '100k - 400k',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBljuxaE_VOgVaieT55jaLryUeuUT91AItHii4-5wtie4DkhcndTmiBiDhRFFxXRTvAhP8nTqk29GdDP8WFMjXTfHcfXWXeSpZMwxb57hR_fQOYquz0FprRNwY7sFw4AS88zaHywO3kNgpCJZvjrJ9oPyikl1LhNLx54EV5KbFug-Jrw0RuoWcghtJ9UEdtJsQsgDSQc0UbRdw_52LjhgkcY6bkXq5A5-LoZkvWnqbp5j9F8sopnEkPzSiSHbVBRn340i0zSFC-dao',
    online: true,
  }
];

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8">
      
      {/* Search & Filter Header */}
      <section className="mb-10">
        <div className="bg-surface-bg rounded-xl shadow-sm border border-border-light p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block font-small-bold mb-2 text-text-tertiary">What service do you need?</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
                <input className="w-full pl-11 pr-4 py-3 border-2 border-border-light rounded-lg bg-white hover:border-primary/50 focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all outline-none" placeholder="Electrician, Plumber, AC Repair..." type="text"/>
              </div>
            </div>
            <div className="md:col-span-4">
              <label className="block font-small-bold mb-2 text-text-tertiary">Location</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">location_on</span>
                <input className="w-full pl-11 pr-4 py-3 border-2 border-border-light rounded-lg bg-white hover:border-primary/50 focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all outline-none" placeholder="District 1, Ho Chi Minh City" type="text"/>
              </div>
            </div>
            <div className="md:col-span-3">
              <button className="w-full bg-primary border-none cursor-pointer text-white font-body-bold py-3 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95" style={{ color: '#FFFFFF' }}>
                Search Professionals
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-[280px] shrink-0 space-y-6">
          <SearchFilters />
        </aside>

        {/* Results Section */}
        <div className="flex-1">
          {/* Sorting & Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="font-h3 text-text-primary m-0">128 Results found</h2>
              <p className="text-small text-text-tertiary m-0">Showing top-rated professionals in your area</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-small font-small-bold text-text-secondary">Sort by:</span>
              <select className="border-2 border-border-light rounded-lg text-small px-4 py-2 bg-surface-bg hover:border-primary/50 focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all outline-none text-text-primary">
                <option>Highest Rated</option>
                <option>Nearest to Me</option>
                <option>Lowest Price</option>
                <option>Most Completed Orders</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPros.map(pro => (
              <WorkerCard key={pro.id} pro={pro} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex justify-center items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-light bg-surface-bg hover:bg-surface-variant transition-all text-text-secondary cursor-pointer">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border-none bg-primary text-white font-body-bold cursor-pointer" style={{ color: '#FFFFFF' }}>1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-light bg-surface-bg hover:bg-surface-variant transition-all text-text-secondary cursor-pointer">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-light bg-surface-bg hover:bg-surface-variant transition-all text-text-secondary cursor-pointer">3</button>
            <span className="px-2 text-text-tertiary">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-light bg-surface-bg hover:bg-surface-variant transition-all text-text-secondary cursor-pointer">12</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-light bg-surface-bg hover:bg-surface-variant transition-all text-text-secondary cursor-pointer">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
