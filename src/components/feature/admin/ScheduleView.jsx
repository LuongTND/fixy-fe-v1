'use client';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'event_note', label: 'Lịch làm việc', active: true },
  { icon: 'handyman', label: 'Thợ của tôi' },
  { icon: 'group', label: 'Khách hàng' },
  { icon: 'payments', label: 'Thanh toán' },
  { icon: 'settings', label: 'Cài đặt' },
];

const WORKING_HOURS = [
  { day: 'Thứ 2', on: true, start: '08:00', end: '17:00' },
  { day: 'Thứ 3', on: true, start: '08:00', end: '17:00' },
  { day: 'Thứ 4', on: true, start: '08:00', end: '17:00' },
  { day: 'Chủ Nhật', on: false },
];

const HOLIDAYS = [
  { name: 'Tết Nguyên Đán', sub: 'Nghỉ dài hạn hàng năm', blocked: true },
  { name: 'Giỗ tổ Hùng Vương', sub: '10/03 Âm lịch', blocked: false },
  { name: '30/4 - 1/5', sub: 'Giải phóng & Quốc tế Lao động', blocked: false },
  { name: 'Quốc Khánh 2/9', sub: 'Ngày lễ quốc gia', blocked: false },
];

function Toggle({ on }) {
  return (
    <div className={`w-10 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${on ? 'bg-primary-container' : 'bg-text-disabled/30'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${on ? 'right-1' : 'left-1'}`} />
    </div>
  );
}

export function ScheduleView() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-on-background">
      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-0 h-screen bg-surface-bg border-r border-border-light flex flex-col p-md gap-md z-50 transition-all duration-300 overflow-hidden ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-sm mb-lg relative ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 min-w-[40px] bg-primary-container rounded-[8px] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white">handyman</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="font-h3 text-primary-container leading-none">Vua Thợ</p>
              <p className="text-xs text-text-muted">Thợ nghề</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white border border-border-light rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-surface-container-low z-[60]"
          >
            <span className="material-symbols-outlined text-[16px]">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-xs">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              title={item.label}
              className={`flex items-center gap-sm rounded-lg transition-colors ${collapsed ? 'justify-center py-sm' : 'px-md py-sm'} ${item.active ? 'bg-primary-container text-white font-body-bold' : 'text-text-secondary hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined min-w-[24px]">{item.icon}</span>
              {!collapsed && <span className="font-body whitespace-nowrap">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer nav */}
        <div className="mt-auto border-t border-border-light pt-md flex flex-col gap-xs">
          {[
            { icon: 'help', label: 'Help Center', className: 'text-text-secondary hover:bg-surface-container-low' },
            { icon: 'logout', label: 'Đăng xuất', className: 'text-error hover:bg-error-container/30' },
          ].map((item) => (
            <a key={item.label} href="#" title={item.label}
              className={`flex items-center gap-sm py-sm rounded-lg transition-colors ${collapsed ? 'justify-center' : 'px-md'} ${item.className}`}
            >
              <span className="material-symbols-outlined min-w-[24px]">{item.icon}</span>
              {!collapsed && <span className="font-body whitespace-nowrap">{item.label}</span>}
            </a>
          ))}
        </div>
      </aside>

      {/* ── Header ── */}
      <header className={`fixed top-0 right-0 h-16 bg-surface-bg/80 backdrop-blur-md border-b border-outline-variant z-40 px-lg flex justify-between items-center shadow-sm transition-all duration-300 ${collapsed ? 'left-20' : 'left-64'}`}>
        <div>
          <div className="flex items-center gap-xs text-xs text-text-muted">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary-container font-body-semibold">Quản lý lịch làm việc</span>
          </div>
          <h2 className="font-h3">Quản lý lịch làm việc</h2>
        </div>
        <div className="flex items-center gap-lg">
          {/* Availability toggle */}
          <div className="flex items-center bg-surface-container-low rounded-full p-1 gap-1">
            <button className="px-md py-1.5 rounded-full bg-success text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Sẵn sàng nhận việc
            </button>
            <button className="px-md py-1.5 rounded-full text-text-secondary text-xs font-semibold hover:bg-surface-variant transition-all">
              Đang bận
            </button>
          </div>
          <div className="flex items-center gap-md">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-text-secondary relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-outline-variant" />
            <div className="flex items-center gap-sm">
              <div className="text-right">
                <p className="text-xs font-semibold leading-none">Nguyễn Văn Thợ</p>
                <p className="text-[12px] text-text-muted">Kỹ thuật viên điện lạnh</p>
              </div>
              <img
                alt="Admin User"
                className="w-10 h-10 rounded-full border border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU-yt8hv3d_lQGiLHsM9H3I-S5LAJA1t73W2Zu2YsjBAxpyRdrXAiA2UUnqTaPxOEdg8sJTr4v70zmnuffAfEDlPRa4Wn4VFr6vPOztGW_xVk3RzC_83xYr6ESCacQp4PiVc9kL5tHqFutqxxyhrogAJZkG9RszYQ4ovgFPUIVM2zdppcJn30BHYFbS2y6bdKj1Q4JXg75nk9Cj0v4ZjjnKuwGjIccG4xFHaeSeoQVg4KtinggFTXnT1nQsQNfK1RdjPc1-FP2XnI"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className={`mt-16 p-lg grid grid-cols-12 gap-lg max-w-[1600px] mx-auto transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Left col: Calendar + Working Hours */}
        <div className="col-span-12 lg:col-span-9 space-y-lg">

          {/* Calendar */}
          <section className="bg-white rounded-xl shadow-sm border border-border-light p-md overflow-hidden">
            <div className="flex justify-between items-center mb-md flex-wrap gap-sm">
              <div className="flex items-center gap-md">
                <h3 className="font-h3">Lịch làm việc</h3>
                <div className="flex bg-surface-container-low rounded-lg p-1">
                  {['Tháng', 'Tuần', 'Ngày'].map((v, i) => (
                    <button key={v} className={`px-md py-1 rounded-md text-xs font-semibold ${i === 0 ? 'bg-white shadow-sm text-primary-container' : 'text-text-secondary hover:bg-surface-variant'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button className="w-8 h-8 flex items-center justify-center border border-border-light rounded-[4px] hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="font-body-bold">Tháng 10, 2024</span>
                <button className="w-8 h-8 flex items-center justify-center border border-border-light rounded-[4px] hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
                <button className="ml-sm bg-primary-container text-white px-md py-2 rounded-[8px] font-body-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Tạo sự kiện
                </button>
              </div>
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-outline-variant border border-outline-variant rounded-[8px] overflow-hidden">
              {['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'].map(d => (
                <div key={d} className="bg-surface-container-low py-2 text-center text-xs font-semibold text-text-secondary">{d}</div>
              ))}
              {/* Empty prior cells */}
              {['21','22','23'].map(n => <div key={n} className="bg-white min-h-[120px] p-2 text-xs text-text-disabled">{n}</div>)}
              {/* Active day */}
              <div className="bg-orange-50/60 min-h-[120px] p-2 border-2 border-primary-container/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-container text-white font-bold text-sm">24</span>
                  <span className="w-1.5 h-1.5 bg-primary-container rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="bg-primary-container text-white text-[11px] p-1 rounded-sm font-semibold truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">ac_unit</span>Sửa máy lạnh
                  </div>
                  <div className="bg-secondary-container text-on-secondary-container text-[11px] p-1 rounded-sm font-semibold truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lightbulb</span>Lắp đèn
                  </div>
                </div>
              </div>
              {['25','26'].map(n => <div key={n} className="bg-white min-h-[120px] p-2 text-xs">{n}</div>)}
              <div className="bg-white min-h-[120px] p-2 text-xs text-error">27</div>
              {['28','29','30','31'].map(n => <div key={n} className="bg-white min-h-[120px] p-2 text-xs">{n}</div>)}
              <div className="bg-surface-container-low min-h-[120px] p-2 text-xs opacity-60">
                <span className="text-text-disabled">1</span>
                <div className="mt-2 bg-text-disabled text-white text-[10px] p-1 rounded-sm text-center">Đã chặn</div>
              </div>
              {['2','3'].map(n => <div key={n} className="bg-white min-h-[120px] p-2 text-xs text-text-disabled">{n}</div>)}
            </div>
          </section>

          {/* Working Hours + Holiday */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <section className="bg-white rounded-xl shadow-sm border border-border-light p-md">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">schedule</span>
                  <h3 className="font-body-bold text-[18px]">Giờ làm việc</h3>
                </div>
                <button className="text-primary-container font-body-semibold text-sm hover:underline">Chỉnh sửa</button>
              </div>
              <div className="space-y-3">
                {WORKING_HOURS.map(item => (
                  <div key={item.day} className={`flex items-center justify-between p-sm bg-[#fbf9f8] rounded-[8px] border border-transparent hover:border-outline-variant transition-all ${!item.on ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-3">
                      <Toggle on={item.on} />
                      <span className={`font-body-semibold w-16 ${!item.on ? 'text-text-disabled' : ''}`}>{item.day}</span>
                    </div>
                    {item.on ? (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="px-2 py-1 bg-white border border-border-light rounded">{item.start}</span>
                        <span>-</span>
                        <span className="px-2 py-1 bg-white border border-border-light rounded">{item.end}</span>
                      </div>
                    ) : <span className="text-xs text-text-disabled italic">Nghỉ</span>}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-border-light p-md">
              <div className="flex items-center gap-2 mb-md">
                <span className="material-symbols-outlined text-primary-container">event_busy</span>
                <h3 className="font-body-bold text-[18px]">Chặn lịch ngày lễ</h3>
              </div>
              <div className="space-y-3">
                {HOLIDAYS.map(h => (
                  <div key={h.name} className="flex items-center justify-between p-sm bg-[#fbf9f8] rounded-[8px] border border-transparent hover:border-outline-variant transition-all">
                    <div>
                      <div className="font-body-semibold text-sm">{h.name}</div>
                      <div className="text-xs text-text-muted">{h.sub}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary">Chặn</span>
                      <Toggle on={h.blocked} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right col: Stats + Jobs + Availability */}
        <div className="col-span-12 lg:col-span-3 space-y-lg">
          {/* Quick Stats */}
          <section className="bg-white rounded-xl shadow-sm border border-border-light p-md">
            <h3 className="font-body-bold text-[18px] mb-md">Thống kê nhanh</h3>
            <div className="space-y-4">
              <div className="bg-primary-fixed/30 p-md rounded-xl border border-primary-container/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-primary-container material-symbols-filled">timer</span>
                  <span className="text-success text-xs font-body-bold">+12% vs tuần trước</span>
                </div>
                <p className="text-xs text-text-secondary">Tổng số giờ làm tuần này</p>
                <h4 className="font-h2 text-on-primary-fixed leading-tight">38.5h</h4>
              </div>
              <div className="bg-secondary-fixed/30 p-md rounded-xl border border-secondary/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-secondary material-symbols-filled">beach_access</span>
                </div>
                <p className="text-xs text-text-secondary">Số ngày nghỉ còn lại</p>
                <h4 className="font-h2 text-on-secondary-fixed leading-tight">08 ngày</h4>
              </div>
            </div>
          </section>

          {/* Upcoming Jobs */}
          <section className="bg-white rounded-xl shadow-sm border border-border-light p-md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-body-bold text-[18px]">Việc sắp tới</h3>
              <a href="#" className="text-xs text-primary-container font-body-bold">Xem tất cả</a>
            </div>
            <div className="space-y-sm">
              <div className="p-sm border-l-4 border-primary-container bg-[#fbf9f8] rounded-r-[8px]">
                <div className="flex justify-between mb-1">
                  <span className="font-small-bold">Sửa máy lạnh</span>
                  <span className="text-xs text-primary-container font-body-bold">Hôm nay</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  Vinhomes Central Park, Q. Bình Thạnh
                </div>
                <span className="text-xs px-2 py-0.5 bg-white border border-border-light rounded-full">14:00 - 15:30</span>
              </div>
              <div className="p-sm border-l-4 border-secondary bg-[#fbf9f8] rounded-r-[8px]">
                <div className="flex justify-between mb-1">
                  <span className="font-small-bold">Lắp đèn chùm</span>
                  <span className="text-xs text-text-muted">Ngày mai</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  Thảo Điền, Quận 2
                </div>
                <span className="text-xs px-2 py-0.5 bg-white border border-border-light rounded-full">09:00 - 11:00</span>
              </div>
            </div>
          </section>

          {/* Availability Card */}
          <section className="relative h-48 rounded-xl overflow-hidden shadow-md group">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt="Toolbox"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAmY4FDyRLNIaAtsDawxPJhn_Xic-xn0o6otH8YOxnYu5-JkQyY_yTWp2C6900SgGghO8n1_oB8AVlDYFYEddDsOLFL2z-7cIWcsa4MgwMhg2qGFBztf3Z8BUsH3pI6ixgyMrWbcJWSfTNcN3SkXaKRBfGy9c1h66DXuhBx-hbh7b2OAwQESGGrBEXKELDS5ZjUWYHIFWrbqeFtnmSFe-xdUnrFTSWVvi3qyHqf8xthLpQwWXyiC9c_EjKXs_M6W24_WcfsKyzahs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-md text-white">
              <p className="text-xs opacity-90">Cần thêm thu nhập?</p>
              <h4 className="font-h3 leading-tight mb-2">Mở thêm khung giờ làm việc buổi tối</h4>
              <button className="bg-white text-primary px-md py-2 rounded-[8px] text-xs font-semibold w-max hover:shadow-lg transition-all">Nâng cấp lịch</button>
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-lg right-lg w-14 h-14 bg-primary-container text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-[28px]">add_task</span>
      </button>
    </div>
  );
}
