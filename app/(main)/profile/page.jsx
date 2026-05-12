'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/apis/auth.api';
import { userApi } from '@/apis/user.api';
import { message } from 'antd';

/**
 * Profile Page - Vua Thợ
 * Integrated with Personal Info, Wallet, and Security tabs
 */
export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout, user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['personal', 'wallet', 'security', 'notifications'].includes(tab)) {
        return tab;
      }
    }
    return 'personal';
  });
  const [activeNotifFilter, setActiveNotifFilter] = useState('all'); // 'all', 'order', 'promo', 'system'
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Mock transactions for wallet tab
  const transactions = [
    { id: 1, type: 'payment', title: 'Sửa máy lạnh dân dụng', time: '14:30 - 24/05/2024', amount: -450000, status: 'Thanh toán', icon: 'home_repair_service' },
    { id: 2, type: 'topup', title: 'Nạp tiền qua VNPay', time: '09:15 - 22/05/2024', amount: 2000000, status: 'Nạp tiền', icon: 'account_balance' },
    { id: 3, type: 'refund', title: 'Hoàn tiền: Hủy yêu cầu #1293', time: '18:05 - 20/05/2024', amount: 350000, status: 'Hoàn tiền', icon: 'restart_alt' },
  ];

  useEffect(() => {
    if (!user) return;
    const updated = {
      fullName: user.fullName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user.gender || '',
    };
    // eslint-disable-next-line react-compiler/react-compiler
    setFormData(updated);
  }, [user]);

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await userApi.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      messageApi.success('Hồ sơ đã được cập nhật thành công!');
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return messageApi.error('Mật khẩu xác nhận không khớp');
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        target: user?.email || user?.phone,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      messageApi.success('Mật khẩu đã được thay đổi thành công!');
      setIsChangePasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fbf9f8]">
        <div className="text-[#818A91] font-semibold">Đang tải...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Cá nhân', icon: 'person' },
    { id: 'wallet', label: 'Ví tiền', icon: 'account_balance_wallet' },
    { id: 'security', label: 'Bảo mật', icon: 'shield' },
    { id: 'notifications', label: 'Thông báo', icon: 'notifications' },
  ];

  const notifFilters = [
    { id: 'all',    label: 'Tất cả' },
    { id: 'order',  label: 'Đơn hàng' },
    { id: 'promo',  label: 'Khuyến mãi' },
    { id: 'system', label: 'Hệ thống' },
  ];

  const notifications = [
    {
      id: 1, filter: 'order', unread: true,
      icon: 'local_shipping', iconBg: 'bg-[#7CDFFE]/20', iconColor: 'text-primary',
      title: 'Thợ đang trên đường đến', time: 'Vừa xong',
      body: 'Kỹ thuật viên Nguyễn Văn A đang di chuyển đến nhà bạn cho đơn hàng #VT12345. Dự kiến đến sau 15 phút.',
      actions: [
        { label: 'Theo dõi vị trí', variant: 'primary' },
        { label: 'Liên hệ thợ',    variant: 'outline'  },
      ],
    },
    {
      id: 2, filter: 'order', unread: true,
      icon: 'schedule', iconBg: 'bg-[#DEC0B1]/20', iconColor: 'text-[#818A91]',
      title: 'Nhắc nhở lịch hẹn', time: '1 giờ trước',
      body: 'Lịch sửa chữa Máy lạnh của bạn sẽ bắt đầu sau 1 giờ (14:00 hôm nay). Vui lòng chuẩn bị khu vực làm việc thông thoáng.',
      actions: [],
    },
    {
      id: 3, filter: 'promo', unread: false,
      icon: 'confirmation_number', iconBg: 'bg-primary/10', iconColor: 'text-primary',
      title: 'Voucher giảm 20% cho bạn!', time: '3 giờ trước',
      body: 'Chúc mừng! Bạn nhận được mã ưu đãi GIAM20 cho dịch vụ Điện nước. Hạn dùng đến 31/12/2023.',
      voucher: 'GIAM20',
      actions: [],
    },
    {
      id: 4, filter: 'order', unread: false,
      icon: 'check_circle', iconBg: 'bg-[#39B54A]/10', iconColor: 'text-[#39B54A]',
      title: 'Dịch vụ hoàn tất', time: 'Hôm qua',
      body: 'Đơn hàng #VT12300 Sửa bồn cầu đã hoàn thành. Hãy dành chút thời gian đánh giá thợ bạn nhé!',
      actions: [{ label: 'Đánh giá ngay', variant: 'outline-primary' }],
    },
    {
      id: 5, filter: 'system', unread: false,
      icon: 'assignment_turned_in', iconBg: 'bg-[#7CDFFE]/10', iconColor: 'text-[#818A91]',
      title: 'Xác nhận đơn hàng', time: '2 ngày trước',
      body: 'Yêu cầu Thông tắc cống của bạn đã được hệ thống xác nhận thành công.',
      actions: [],
    },
  ];

  const filteredNotifs = activeNotifFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.filter === activeNotifFilter);

  return (
    <div className="min-h-screen bg-[#fbf9f8] py-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {contextHolder}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Profile Header */}
        <section className="mb-5">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 flex flex-col md:flex-row items-center gap-5 border border-[#E8E8E8]">
            <div className="relative group">
              <img
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
              />
              <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-black text-[#1b1c1c]">
                  {user?.fullName || 'Người dùng Vua Thợ'}
                </h1>
                <span className="bg-[#39B54A]/10 text-[#39B54A] px-2.5 py-0.5 rounded-full flex items-center gap-1 text-xs font-bold">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Đã xác minh
                </span>
              </div>
              <p className="text-[#818A91] font-medium text-sm">Thành viên từ tháng 08, 2023</p>
            </div>

            <div className="flex gap-3">
               <div className="bg-[#F5F5F5] px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <span className="text-[9px] text-[#818A91] block uppercase tracking-widest font-bold mb-0.5">Điểm tin cậy</span>
                  <span className="text-base font-black text-primary">98</span>
               </div>
               <div className="bg-[#F5F5F5] px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <span className="text-[9px] text-[#818A91] block uppercase tracking-widest font-bold mb-0.5">Đơn hàng</span>
                  <span className="text-base font-black text-[#1b1c1c]">24</span>
               </div>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="flex gap-1.5 mb-5 bg-white p-1.5 rounded-2xl border border-[#E8E8E8] shadow-sm w-fit mx-auto md:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-[#818A91] hover:bg-[#F5F5F5] hover:text-[#1b1c1c]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
                    <h2 className="text-base font-black text-[#1b1c1c]">Thông tin cá nhân</h2>
                    {!isEditing ? (
                      <button onClick={handleStartEdit} className="text-primary font-bold hover:underline flex items-center gap-1.5 text-sm">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={handleCancelEdit} className="text-[#818A91] font-bold hover:underline text-xs">Hủy</button>
                        <button 
                          onClick={handleSaveProfile} 
                          disabled={savingProfile}
                          className="bg-primary text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:brightness-105 transition-all disabled:opacity-70 flex items-center gap-1.5"
                        >
                          {savingProfile && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                          Lưu thay đổi
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shared field classes */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#818A91] uppercase tracking-[0.2em] font-black">Email</label>
                      <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold bg-[#F5F5F5] px-3 py-2 rounded-lg border border-transparent">
                        <span className="material-symbols-outlined text-[18px] text-[#818A91]">mail</span>
                        {user?.email || 'Chưa cập nhật'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#818A91] uppercase tracking-[0.2em] font-black">Họ và tên</label>
                      {isEditing ? (
                        <input type="text" value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#E8E8E8] bg-[#F5F5F5]/50 hover:border-[#FF8228]/50 focus:!border-[#FF8228] focus:bg-white focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all text-sm"
                          placeholder="Nhập họ và tên" />
                      ) : (
                        <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold px-3 py-2 bg-[#F5F5F5] rounded-lg">
                          <span className="material-symbols-outlined text-[18px] text-[#818A91]">person</span>
                          {user?.fullName || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#818A91] uppercase tracking-[0.2em] font-black">Số điện thoại</label>
                      {isEditing ? (
                        <input type="tel" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#E8E8E8] bg-[#F5F5F5]/50 hover:border-[#FF8228]/50 focus:!border-[#FF8228] focus:bg-white focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all text-sm"
                          placeholder="Nhập số điện thoại" />
                      ) : (
                        <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold px-3 py-2 bg-[#F5F5F5] rounded-lg">
                          <span className="material-symbols-outlined text-[18px] text-[#818A91]">phone_iphone</span>
                          {user?.phone || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#818A91] uppercase tracking-[0.2em] font-black">Ngày sinh</label>
                      {isEditing ? (
                        <input type="date" value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#E8E8E8] bg-[#F5F5F5]/50 hover:border-[#FF8228]/50 focus:!border-[#FF8228] focus:bg-white focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all text-sm" />
                      ) : (
                        <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold px-3 py-2 bg-[#F5F5F5] rounded-lg">
                          <span className="material-symbols-outlined text-[18px] text-[#818A91]">calendar_today</span>
                          {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#818A91] uppercase tracking-[0.2em] font-black">Giới tính</label>
                      {isEditing ? (
                        <select value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#E8E8E8] bg-[#F5F5F5]/50 hover:border-[#FF8228]/50 focus:!border-[#FF8228] focus:bg-white focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all text-sm">
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold px-3 py-2 bg-[#F5F5F5] rounded-lg">
                          <span className="material-symbols-outlined text-[18px] text-[#818A91]">wc</span>
                          {user?.gender || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Saved Addresses Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#1b1c1c]">Địa chỉ của tôi</h2>
                    <button className="flex items-center gap-2 text-primary font-bold bg-white border border-[#E8E8E8] px-5 py-2.5 rounded-2xl hover:bg-[#F5F5F5] transition-all shadow-sm">
                      <span className="material-symbols-outlined">add</span>
                      Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[24px] border border-[#E8E8E8] group hover:border-primary transition-all cursor-pointer relative shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1b1c1c]">Nhà riêng</h3>
                          <p className="text-xs text-[#818A91] mt-1 leading-relaxed">123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-[#E8E8E8] group hover:border-primary transition-all cursor-pointer relative shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1b1c1c]">Văn phòng</h3>
                          <p className="text-xs text-[#818A91] mt-1 leading-relaxed">Tòa nhà Bitexco, 2 Hải Triều, Quận 1, TP. Hồ Chí Minh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WALLET TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-5 animate-fade-in">
                {/* Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-[#E67E20] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white opacity-10 rounded-full"></div>
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-1 opacity-90 font-black">Số dư ví Vua Thợ</p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">2.450.000đ</h1>
                  </div>
                  <button className="relative z-10 bg-white text-primary font-black px-6 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 text-xs">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    Nạp tiền
                  </button>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8E8E8]">
                  <h2 className="text-base font-black text-[#1b1c1c] mb-4">Giao dịch gần đây</h2>
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-[#F5F5F5] hover:border-primary/30 hover:bg-primary/5 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center text-[#818A91] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-[20px]">{tx.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1b1c1c] text-xs md:text-sm">{tx.title}</h4>
                            <p className="text-[10px] text-[#818A91] mt-0.5">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-xs md:text-sm ${tx.amount < 0 ? 'text-[#EA4335]' : 'text-[#39B54A]'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}đ
                          </p>
                          <p className="text-[9px] uppercase font-bold text-[#818A91] tracking-wider">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/wallet" className="block text-center text-primary font-bold text-xs py-1 hover:underline">
                      Xem tất cả giao dịch
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
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
                              <p className="font-bold text-[#1b1c1c] text-xs">MacBook Pro 14&quot; • Chrome</p>
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
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
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
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-[#1b1c1c] to-[#4A4A4A] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Thành viên ưu tiên</span>
                <h2 className="text-xl font-black mt-1 mb-5">Hạng Vàng</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Lên Kim cương</span>
                    <span>75%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%]" />
                  </div>
                </div>
                <button className="w-full bg-white text-[#1b1c1c] font-black py-3 rounded-xl mt-6 hover:brightness-95 transition-all text-xs">
                  Chi tiết đặc quyền
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-4">
              <h3 className="font-black text-[#1b1c1c] mb-4 px-1 text-sm">Hỗ trợ khách hàng</h3>
              <div className="space-y-1">
                {[
                  { icon: 'help', label: 'Trung tâm trợ giúp' },
                  { icon: 'description', label: 'Điều khoản & Dịch vụ' },
                  { icon: 'shield', label: 'Chính sách bảo mật' }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#818A91] group-hover:text-primary transition-colors text-[18px]">{item.icon}</span>
                      <span className="text-[#4A4A4A] font-bold text-xs group-hover:text-[#1b1c1c] transition-colors">{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#818A91] group-hover:translate-x-1 transition-transform text-[18px]">chevron_right</span>
                  </button>
                ))}
                
                <div className="pt-3 mt-3 border-t border-[#F5F5F5]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 text-[#EA4335] hover:bg-[#EA4335]/5 rounded-xl transition-all group font-black text-xs"
                  >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[18px]">logout</span>
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsChangePasswordModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
              <h2 className="text-base font-black text-[#1b1c1c]">Đổi mật khẩu</h2>
              <button className="p-1.5 hover:bg-[#F5F5F5] rounded-full transition-all" onClick={() => setIsChangePasswordModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      className="w-full px-3 py-3 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all font-semibold outline-none text-sm"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => togglePassword('old')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818A91] material-symbols-outlined text-[20px]">
                      {showPasswords.old ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      className="w-full px-3 py-3 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all font-semibold outline-none text-sm"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => togglePassword('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818A91] material-symbols-outlined text-[20px]">
                      {showPasswords.new ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="w-full px-3 py-3 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all font-semibold outline-none text-sm"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => togglePassword('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818A91] material-symbols-outlined text-[20px]">
                      {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button type="button" onClick={() => setIsChangePasswordModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-[#818A91] hover:bg-[#F5F5F5] transition-all text-sm">Hủy</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:brightness-105 transition-all text-sm">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}
