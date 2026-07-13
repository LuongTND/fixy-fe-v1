'use client';

export function SecurityTab({
  setIsChangePasswordModalOpen,
  is2FAEnabled,
  setIs2FAEnabled,
}) {
  return (
    <>
      <div className="space-y-5 animate-fade-in">
                      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#F5F5F5]">
                          <h2 className="text-base font-black text-[#1b1c1c]">Bảo mật tài khoản</h2>
                        </div>
                        <div className="divide-y divide-[#F5F5F5]">
                          {/* Password */}
                          <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[#818A91]">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-[#1b1c1c] text-sm">Mật khẩu đăng nhập</h3>
                                <p className="text-[11px] text-[#818A91] mt-0.5">Thay đổi: 3 tháng trước</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setIsChangePasswordModalOpen(true)}
                              className="bg-white border-2 border-[#E8E8E8] px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#F5F5F5] transition-all"
                            >
                              Thay đổi
                            </button>
                          </div>
      
                          {/* 2FA */}
                          <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[#818A91]">
                                <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-[#1b1c1c] text-sm">Xác thực 2 lớp (2FA)</h3>
                                <p className="text-[11px] text-[#818A91] mt-0.5">Tăng cường bảo mật</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold ${is2FAEnabled ? 'text-[#39B54A]' : 'text-[#818A91]'}`}>
                                {is2FAEnabled ? 'Đang bật' : 'Đang tắt'}
                              </span>
                              <div 
                                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${is2FAEnabled ? 'bg-[#39B54A]' : 'bg-[#E8E8E8]'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${is2FAEnabled ? 'right-1' : 'left-1'}`}></div>
                              </div>
                            </div>
                          </div>
      
                          {/* Devices */}
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-primary font-bold text-[20px]">devices</span>
                              <h3 className="font-bold text-[#1b1c1c] text-sm">Thiết bị đăng nhập</h3>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-[#4A4A4A] text-[20px]">laptop_mac</span>
                                  <div>
                                    <p className="font-bold text-[#1b1c1c] text-xs">MacBook Pro 14&quot; Chrome</p>
                                    <p className="text-[9px] font-bold text-[#818A91] uppercase tracking-wider">TP. Hồ Chí Minh • Hoạt động</p>
                                  </div>
                                </div>
                                <span className="bg-[#39B54A]/10 text-[#39B54A] px-2 py-0.5 rounded text-[9px] font-black">HIỆN TẠI</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
    </>
  );
}
