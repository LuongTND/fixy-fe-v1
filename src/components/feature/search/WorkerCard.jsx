'use client';

import { useRouter } from 'next/navigation';

export function WorkerCard({ pro }) {
  const router = useRouter();
  
  return (
    <div className="bg-surface-bg rounded-xl border border-border-light shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer"
         onClick={() => router.push(`/worker/${pro.id}`)}>
      <div className="flex p-4 gap-5 items-start">
        <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative shadow-sm border border-border-light">
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={pro.avatar} alt={pro.name} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col h-28 justify-between py-0.5">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-body-bold text-text-primary truncate pr-2">{pro.name}</h3>
              <div className="flex items-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-small-bold ml-[2px]">{pro.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-primary font-small font-semibold mt-0.5">{pro.specialty}</p>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center text-text-tertiary gap-2">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-small truncate">{pro.distance}</span>
            </div>
            <div className="flex items-center text-text-tertiary gap-2">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span className="text-small font-medium">{pro.completedJobs} completed</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between border-t border-border-light pt-4">
        <div className="text-primary font-body-bold">
          {pro.priceRange} <span className="text-text-tertiary font-small">VND</span>
        </div>
        <button 
          className="bg-primary text-white px-6 py-2 rounded-lg border-none font-small-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          style={{ color: '#FFFFFF' }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/worker/${pro.id}`);
          }}
        >
          Đặt Ngay
        </button>
      </div>
    </div>
  );
}
