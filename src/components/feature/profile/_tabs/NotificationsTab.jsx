'use client';

import { useState } from 'react';

export function NotificationsTab({
  notifFilters,
  activeNotifFilter,
  setActiveNotifFilter,
  filteredNotifs,
  notifLoading,
  notifHasMore,
  notifPage,
  notifSettings,
  fetchNotifications,
  markRead,
  markAllRead,
  updateSettings,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <div className="animate-fade-in">
                      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">

                        {/* Collapsible settings row */}
                        <div className="border-b border-[#F5F5F5] bg-[#fbf9f8]/60">
                          <button 
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-[#4A4A4A] hover:text-[#1b1c1c] transition-colors cursor-pointer bg-transparent border-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
                              <span>Cài đặt thông báo</span>
                            </div>
                            <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              expand_more
                            </span>
                          </button>

                          {settingsOpen && (
                            <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-[#F5F5F5] animate-fade-in bg-white">
                              {[
                                { key: 'newBooking', label: 'Đơn hàng mới', desc: 'Nhận thông báo khi có yêu cầu công việc mới.' },
                                { key: 'payment', label: 'Thanh toán', desc: 'Nhận thông báo về thanh toán và hoàn tiền.' },
                                { key: 'statusUpdate', label: 'Cập nhật trạng thái', desc: 'Nhận cập nhật về tiến độ thực hiện đơn hàng.' },
                                { key: 'promotions', label: 'Khuyến mãi', desc: 'Nhận cập nhật về ưu đãi, mã giảm giá.' },
                                { key: 'viaPush', label: 'Thông báo đẩy (Push Notification)', desc: 'Cho phép nhận thông báo qua ứng dụng.' },
                                { key: 'viaInApp', label: 'Thông báo trong ứng dụng', desc: 'Cho phép nhận thông báo trong bảng thông báo.' },
                              ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between gap-4 p-3 bg-[#fbf9f8]/40 rounded-xl border border-[#F5F5F5]">
                                  <div className="flex-1 min-w-0">
                                    <h6 className="font-bold text-xs text-[#1b1c1c]">{item.label}</h6>
                                    <p className="text-[10px] text-[#818A91] mt-0.5 leading-snug">{item.desc}</p>
                                  </div>
                                  <button 
                                    onClick={() => updateSettings({ [item.key]: !notifSettings[item.key] })}
                                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${notifSettings[item.key] ? 'bg-primary' : 'bg-[#E8E8E8]'}`}
                                  >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${notifSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
      
                        {/* Filter pills */}
                        <div className="flex items-center gap-1 border-b border-[#F5F5F5] px-4 overflow-x-auto scrollbar-hide">
                          {notifFilters.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setActiveNotifFilter(f.id)}
                              className={`px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                activeNotifFilter === f.id
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-[#818A91] hover:text-[#1b1c1c]'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                          <button
                            className="ml-auto text-xs text-primary font-bold whitespace-nowrap px-2 hover:underline bg-transparent border-none cursor-pointer"
                            onClick={() => markAllRead()}
                          >
                            Đánh dấu tất cả đã đọc
                          </button>
                        </div>
      
                        {/* Notification items */}
                        <div className="divide-y divide-[#F5F5F5]">
                          {filteredNotifs.length === 0 ? (
                            <div className="py-16 flex flex-col items-center text-[#818A91]">
                              <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">notifications_off</span>
                              <p className="font-bold text-sm">Không có thông báo</p>
                            </div>
                          ) : filteredNotifs.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (notif.unread) {
                                  markRead(notif.id);
                                }
                                const deepLink = notif.raw?.deepLink;
                                if (deepLink) {
                                  const target = deepLink.startsWith('/worker/') 
                                    ? deepLink.replace('/worker/', '/technician/') 
                                    : deepLink;
                                  window.location.href = target;
                                  return;
                                }
                                if (notif.bookingId) {
                                  window.location.href = notif.raw?.type?.toLowerCase().includes('worker') 
                                    ? `/technician/bookings` 
                                    : `/bookings`;
                                }
                              }}
                              className={`relative flex gap-4 p-4 md:p-5 cursor-pointer transition-colors hover:bg-[#fbf9f8] ${
                                notif.unread ? 'bg-primary/[0.03]' : ''
                              } ${!notif.unread ? 'opacity-75' : ''}`}
                            >
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notif.iconBg}`}>
                                <span className={`material-symbols-outlined text-[22px] ${notif.iconColor}`}>{notif.icon}</span>
                              </div>
      
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 gap-2">
                                  <h5 className={`font-bold text-sm leading-snug ${
                                    notif.unread ? 'text-primary' : 'text-[#1b1c1c]'
                                  }`}>{notif.title}</h5>
                                  <span className="flex items-center gap-1.5 flex-shrink-0">
                                     <span className="text-[11px] text-[#818A91] whitespace-nowrap">{notif.time}</span>
                                     {notif.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                                   </span>
                                </div>
                                <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">{notif.body}</p>
      
                                {/* Voucher code block */}
                                {notif.voucher && (
                                  <div className="bg-[#fbf9f8] border border-dashed border-primary rounded-xl p-3 flex justify-between items-center mb-3">
                                    <span className="font-black text-primary tracking-widest text-sm">{notif.voucher}</span>
                                    <button className="text-primary font-bold text-xs hover:underline">Sao chép mã</button>
                                  </div>
                                )}
      
                                {/* Action buttons */}
                                {notif.actions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {notif.actions.map((act) => (
                                      <button
                                        key={act.label}
                                        className={`px-4 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-transform ${
                                          act.variant === 'primary'
                                            ? 'bg-primary text-white shadow-sm hover:brightness-105'
                                            : act.variant === 'outline-primary'
                                              ? 'border border-primary text-primary hover:bg-primary/5'
                                              : 'border border-[#E8E8E8] text-[#4A4A4A] hover:bg-[#F5F5F5]'
                                        }`}
                                      >
                                        {act.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
      
                        {/* Footer */}
                        {notifHasMore && (
                          <div className="p-4 text-center border-t border-[#F5F5F5] bg-[#fbf9f8]/20">
                            <button 
                              disabled={notifLoading}
                              onClick={() => fetchNotifications(notifPage + 1, true)}
                              className="text-primary font-bold text-sm hover:underline bg-transparent border-none cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                            >
                              {notifLoading && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                              Xem các thông báo cũ hơn
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
    </>
  );
}
