'use client';
import Link from 'next/link';

export function OrderTrackingView() {
  return (
    <div className="max-w-[1000px] mx-auto py-0 font-montserrat">
      {/* Page Title & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/bookings" className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#dec0b1]/20 flex items-center justify-center hover:bg-[#F5F5F5] transition-all no-underline">
            <span className="material-symbols-outlined text-[#1b1c1c] text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">Theo dõi đặt lịch</h1>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#dec0b1]/10 shadow-sm w-fit">
          <span className="text-[#818A91] font-medium text-xs">Mã đơn:</span>
          <span className="text-[#1b1c1c] font-bold text-xs">#VT-9928341</span>
          <div className="w-[1px] h-3 bg-[#E8E8E8]"></div>
          <span className="text-[#FF8228] font-bold text-xs uppercase tracking-wider">Sửa chữa điện lạnh</span>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#dec0b1]/10 p-3 sm:p-6 mb-6 overflow-x-auto">
        <div className="flex justify-between min-w-[360px] sm:min-w-[500px] relative">
          {/* Connector Line Base */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-[#F5F5F5] z-0"></div>

          {[
            { id: 1, label: 'Xác nhận', icon: 'check_circle', status: 'completed', time: '08:45' },
            { id: 2, label: 'Đang đến', icon: 'moped', status: 'active', time: 'Dự kiến: 5p' },
            { id: 3, label: 'Thực hiện', icon: 'build', status: 'pending' },
            { id: 4, label: 'Hoàn thành', icon: 'verified', status: 'pending' },
          ].map((step, idx, arr) => (
            <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
              {/* Connector Highlight */}
              {idx < arr.length - 1 && step.status === 'completed' && (
                <div className="absolute top-4 left-1/2 w-full h-[2px] bg-[#39B54A] z-0"></div>
              )}
              {idx < arr.length - 1 && step.status === 'active' && (
                <div className="absolute top-4 left-1/2 w-full h-[2px] bg-gradient-to-r from-[#FF8228] to-[#F5F5F5] z-0"></div>
              )}

              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all ${step.status === 'completed' ? 'bg-[#39B54A] text-white shadow-md' :
                step.status === 'active' ? 'bg-[#FF8228] text-white ring-4 ring-[#FF8228]/20 shadow-lg scale-110' :
                  'bg-white border-2 border-[#E8E8E8] text-[#818A91]'
                }`}>
                <span className={`material-symbols-outlined text-[16px] ${step.status !== 'pending' ? 'material-symbols-filled' : ''}`}>
                  {step.status === 'completed' ? 'check' : step.icon}
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 ${step.status === 'completed' ? 'text-[#39B54A]' :
                step.status === 'active' ? 'text-[#FF8228]' :
                  'text-[#818A91]'
                }`}>
                {step.label}
              </p>
              {step.time && <p className="text-[9px] font-medium text-[#818A91]">{step.time}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area: Live Map */}
        <div className="lg:col-span-8 h-[400px] relative rounded-2xl overflow-hidden shadow-sm border border-[#dec0b1]/10 bg-white">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" alt="Live tracking map" src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80" />
          </div>

          {/* Map Controls & Status */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#39B54A] rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-[#1b1c1c]">Tín hiệu: Ổn định</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 md:right-auto z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/20 flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 bg-[#FF8228] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <span className="material-symbols-outlined text-[24px] fill-current">moped</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#818A91] uppercase tracking-wider mb-0.5">Thợ đang di chuyển</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#1b1c1c]">850 mét</span>
                  <span className="w-1 h-1 bg-[#E8E8E8] rounded-full"></span>
                  <span className="text-lg font-extrabold text-[#FF8228]">3-5p</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Details */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Technician Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#dec0b1]/10 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img className="w-14 h-14 rounded-xl object-cover border-2 border-[#FF8228]/20 shadow-md" alt="Technician" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39B54A] border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1b1c1c] mb-0.5">Nguyễn Văn Nam</h3>
                <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2 py-0.5 rounded-lg w-fit">
                  <span className="material-symbols-outlined text-[#FF8228] text-xs fill-current">star</span>
                  <span className="text-[10px] font-extrabold text-[#1b1c1c]">4.9</span>
                  <span className="text-[9px] font-bold text-[#818A91] ml-0.5">(128)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => alert('Tính năng gọi ẩn danh đang được phát triển.')}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-[#FF8228] text-[#FF8228] font-bold hover:bg-[#FF8228]/5 transition-all group"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">ring_volume</span>
                <span className="text-[10px]">Gọi ẩn danh</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-[#E8E8E8] text-[#1b1c1c] font-bold hover:border-[#FF8228]/30 hover:bg-[#F5F5F5] transition-all group">
                <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">chat</span>
                <span className="text-[10px]">Nhắn tin</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#E8E8E8] space-y-3">
              <div>
                <label className="text-[9px] font-bold text-[#818A91] uppercase tracking-[0.2em] block mb-0.5">Dịch vụ đang sửa</label>
                <p className="text-sm font-bold text-[#1b1c1c]">Sửa máy lạnh Inverter</p>
                <p className="text-[10px] text-[#818A91] mt-0.5">Lỗi: Kêu to và không lạnh sâu</p>
              </div>
            </div>
          </div>

          {/* Location & Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#dec0b1]/10 p-6 space-y-5">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#818A91] text-lg">location_on</span>
              </div>
              <div>
                <label className="text-[9px] font-bold text-[#818A91] uppercase tracking-[0.2em] block mb-0.5">Điểm đến</label>
                <p className="text-xs font-bold text-[#1b1c1c] leading-snug">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E8E8] space-y-3">
              <div className="flex justify-between items-center text-xs text-[#4A4A4A]">
                <span>Phí dịch vụ cơ bản</span>
                <span className="font-bold text-[#1b1c1c]">150.000đ</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#39B54A]">
                <span>Phí di chuyển</span>
                <span className="font-bold">Miễn phí</span>
              </div>
              <div className="pt-3 flex justify-between items-center border-t border-[#E8E8E8] border-dashed">
                <span className="font-bold text-sm text-[#1b1c1c]">Tổng tạm tính</span>
                <span className="text-lg font-extrabold text-[#FF8228]">150.000đ</span>
              </div>
            </div>
          </div>

          {/* Destructive Actions */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-white border-2 border-[#EA4335] text-[#EA4335] rounded-2xl font-bold hover:bg-[#EA4335]/5 transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              Hủy yêu cầu
            </button>
            <div className="bg-[#EA4335]/5 p-4 rounded-xl border border-[#EA4335]/10 flex gap-3">
              <span className="material-symbols-outlined text-[#EA4335] text-lg shrink-0">info</span>
              <p className="text-[9px] text-[#EA4335] leading-relaxed font-medium">
                <span className="font-bold">Lưu ý:</span> Hủy khi thợ đã di chuyển có thể phát sinh phí <span className="font-bold">20.000đ</span>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
