'use client';

export function NotificationsTab({
  notifFilters,
  activeNotifFilter,
  setActiveNotifFilter,
  filteredNotifs,
}) {
  return (
    <>
      <div className="animate-fade-in">
                      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
      
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
                            className="ml-auto text-xs text-primary font-bold whitespace-nowrap px-2 hover:underline"
                            onClick={() => {}}
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
                              className={`relative flex gap-4 p-4 md:p-5 cursor-pointer transition-colors hover:bg-[#fbf9f8] ${
                                notif.unread ? 'bg-primary/[0.03]' : ''
                              } ${!notif.unread ? 'opacity-80' : ''}`}
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
                        <div className="p-4 text-center border-t border-[#F5F5F5]">
                          <button className="text-primary font-bold text-sm hover:underline">
                            Xem các thông báo cũ hơn
                          </button>
                        </div>
                      </div>
                    </div>
    </>
  );
}
