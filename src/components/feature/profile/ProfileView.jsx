'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/apis/auth.api';
import { userApi } from '@/apis/user.api';
import { addressApi } from '@/apis/address.api';
import { walletApi } from '@/apis/wallet.api';
import { paymentApi } from '@/apis/payment.api';
import { mediaApi } from '@/apis/media.api';
import { MEDIA_CATEGORY, MEDIA_OWNER_TYPE } from '@/constants/enums';
import { message, Popconfirm } from 'antd';
import { ProfileTabs } from './_tabs/ProfileTabs';

import {
  GENDER_LABELS,
  normalizeGender,
  normalizeWalletTransactions,
  getUploadedMediaItems,
  getMediaUrl,
  getUserIdFromToken,
  WALLET_TRANSACTION_TYPE_LABELS,
  WALLET_TRANSACTION_STATUS_LABELS,
  formatTransactionTime,
  getTransactionAmount,
  getTransactionIcon,
  getTransactionTitle,
  getTransactionStatus,
} from '@/utils';

/**
 * Profile Page - Vua Thợ
 * Integrated with Personal Info, Wallet, and Security tabs
 */
export default function ProfileView() {
  const { isAuthenticated, loading: authLoading, user, refreshUser } = useAuth();
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
  const [wallet, setWallet] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const avatarInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    city: '',
    district: '',
    ward: '',
    detail: '',
    lat: 0,
    lng: 0,
    isDefault: false,
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

  const recentTransactions = walletTransactions.slice(0, 3);

  const fetchWallet = useCallback(async () => {
    try {
      setWalletLoading(true);
      const walletResponse = await walletApi.getWallet();

      setWallet(walletResponse || null);
      setWalletTransactions(normalizeWalletTransactions(walletResponse));
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
      setWallet(null);
      setWalletTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getMe();
      setAddresses(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const updated = {
      fullName: user.fullName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: normalizeGender(user.gender),
      avatar: user.avatarUrl || '',
    };
    queueMicrotask(() => setFormData(updated));
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => {
        fetchAddresses();
        fetchWallet();
      });
    }
  }, [fetchAddresses, fetchWallet, isAuthenticated]);

  const handleOpenAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        label: address.label || '',
        city: address.city || '',
        district: address.district || '',
        ward: address.ward || '',
        detail: address.detail || '',
        lat: address.lat || 0,
        lng: address.lng || 0,
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        label: '',
        city: '',
        district: '',
        ward: '',
        detail: '',
        lat: 0,
        lng: 0,
        isDefault: addresses.length === 0, // Default if first address
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAddress) {
        await addressApi.update(editingAddress.id, addressFormData);
        messageApi.success('Cập nhật địa chỉ thành công');
      } else {
        await addressApi.create(addressFormData);
        messageApi.success('Thêm địa chỉ mới thành công');
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.delete(id);
      messageApi.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể xóa địa chỉ');
    }
  };

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
        gender: normalizeGender(user.gender),
        avatar: user.avatarUrl || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (formData.gender === '') {
      messageApi.error('Vui lòng chọn giới tính');
      return;
    }

    try {
      setSavingProfile(true);
      await userApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: Number(formData.gender),
        avatar: formData.avatar || user?.avatarUrl || '',
      });
      await refreshUser();
      setIsEditing(false);
      messageApi.success('Hồ sơ đã được cập nhật thành công!');
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      messageApi.error('Vui lòng chọn tệp hình ảnh');
      return;
    }

    const ownerId = user?.userId || getUserIdFromToken(user?.token);
    if (!ownerId) {
      messageApi.error('Không thể xác định tài khoản để tải ảnh đại diện');
      return;
    }

    try {
      setAvatarUploading(true);
      const uploadResponse = await mediaApi.upload({
        category: MEDIA_CATEGORY.AVATAR,
        ownerType: MEDIA_OWNER_TYPE.USER,
        ownerId,
        files: [file],
      });
      const avatarUrl = getMediaUrl(getUploadedMediaItems(uploadResponse)[0]);

      if (!avatarUrl) {
        messageApi.error('Không nhận được đường dẫn ảnh sau khi tải lên');
        return;
      }

      await userApi.updateProfile({
        fullName: formData.fullName || user?.fullName || '',
        phone: formData.phone || user?.phone || '',
        dateOfBirth: formData.dateOfBirth || (user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''),
        gender: formData.gender === '' ? normalizeGender(user?.gender) : Number(formData.gender),
        avatar: avatarUrl,
      });

      setFormData((current) => ({ ...current, avatar: avatarUrl }));
      await refreshUser();
      messageApi.success('Đã cập nhật ảnh đại diện');
    } catch (err) {
      messageApi.error(err.response?.data?.message || err.message || 'Không thể cập nhật ảnh đại diện');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleOpenTopupModal = () => {
    setTopupAmount('');
    setIsTopupModalOpen(true);
  };

  const handleCreateVnpayTopup = async (event) => {
    event.preventDefault();
    const amount = Number(topupAmount);

    if (!Number.isFinite(amount) || amount < 10000) {
      messageApi.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    try {
      setTopupLoading(true);
      const { paymentUrl } = await paymentApi.createVnpayTopup(amount);

      if (!paymentUrl) {
        messageApi.error('Không nhận được URL thanh toán từ hệ thống');
        return;
      }

      window.location.href = paymentUrl;
    } catch (err) {
      messageApi.error(err.response?.data?.message || err.message || 'Không thể tạo giao dịch VNPAY');
    } finally {
      setTopupLoading(false);
    }
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
    { id: 'all', label: 'Tất cả' },
    { id: 'order', label: 'Đơn hàng' },
    { id: 'promo', label: 'Khuyến mãi' },
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
        { label: 'Liên hệ thợ', variant: 'outline' },
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
    <div className="min-h-screen bg-[#fbf9f8] py-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {contextHolder}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">

        {/* Profile Header */}
        <section className="mb-5">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 flex flex-col md:flex-row items-center gap-5 border border-[#E8E8E8]">
            <div className="relative group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <img
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Cập nhật ảnh đại diện"
              >
                <span className="material-symbols-outlined text-[16px]">{avatarUploading ? 'hourglass_top' : 'edit'}</span>
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === tab.id
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

          <ProfileTabs
            activeTab={activeTab}
            isEditing={isEditing}
            handleStartEdit={handleStartEdit}
            handleCancelEdit={handleCancelEdit}
            handleSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            user={user}
            formData={formData}
            setFormData={setFormData}
            genderLabels={GENDER_LABELS}
            getGenderLabel={(value) => GENDER_LABELS[normalizeGender(value)] || 'Chưa cập nhật'}
            addresses={addresses}
            handleOpenAddressModal={handleOpenAddressModal}
            walletLoading={walletLoading}
            wallet={wallet}
            formatCurrency={formatCurrency}
            onOpenTopupModal={handleOpenTopupModal}
            recentTransactions={recentTransactions}
            getTransactionAmount={getTransactionAmount}
            getTransactionIcon={getTransactionIcon}
            getTransactionTitle={getTransactionTitle}
            formatTransactionTime={formatTransactionTime}
            getTransactionStatus={getTransactionStatus}
            setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
            is2FAEnabled={is2FAEnabled}
            setIs2FAEnabled={setIs2FAEnabled}
            notifFilters={notifFilters}
            activeNotifFilter={activeNotifFilter}
            setActiveNotifFilter={setActiveNotifFilter}
            filteredNotifs={filteredNotifs}
          />

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
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* VNPAY Topup Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-scale-up overflow-hidden">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Cổng thanh toán VNPAY</p>
                </div>
                <h2 className="text-xl font-black text-[#1b1c1c]">Nạp tiền vào ví</h2>
                <p className="mt-2 text-xs font-medium text-[#818A91] leading-relaxed">
                  Số tiền nạp sẽ được cộng trực tiếp vào ví Vua Thợ của bạn sau khi thanh toán thành công.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTopupModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#4A4A4A] hover:bg-[#E8E8E8] transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateVnpayTopup} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#818A91]">Số tiền cần nạp</label>
                <div className="relative group">
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    value={topupAmount}
                    onChange={(event) => setTopupAmount(event.target.value)}
                    className="w-full rounded-2xl border-2 border-[#E8E8E8] bg-[#F5F5F5]/30 px-5 py-4 pr-12 text-xl font-black text-[#1b1c1c] outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,130,40,0.1)] placeholder:text-[#D4D4D4]"
                    placeholder="100.000"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-black text-[#818A91]">đ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[100000, 200000, 500000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTopupAmount(String(amount))}
                    className={`rounded-xl border-2 py-2.5 text-xs font-black transition-all ${Number(topupAmount) === amount
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-[#F5F5F5] bg-[#F5F5F5] text-[#818A91] hover:border-primary/30 hover:text-primary'
                      }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={topupLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-4 font-black text-white shadow-lg shadow-primary/25 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {topupLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">account_balance_wallet</span>
                  )}
                  Thanh toán qua VNPAY
                </button>
                <p className="mt-4 text-center text-[10px] text-[#818A91] font-medium">
                  Bằng việc tiếp tục, bạn đồng ý với <span className="text-primary cursor-pointer hover:underline">Điều khoản nạp tiền</span> của chúng tôi.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsChangePasswordModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
              <h2 className="text-base font-black text-[#1b1c1c]">Đổi mật khẩu</h2>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-all" onClick={() => setIsChangePasswordModalOpen(false)}>
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

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddressModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
              <h2 className="text-base font-black text-[#1b1c1c]">{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-all" onClick={() => setIsAddressModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Tên gợi nhớ (Ví dụ: Nhà riêng, Công ty...)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none transition-all font-semibold text-sm"
                      value={addressFormData.label}
                      onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                      placeholder="Ví dụ: Nhà riêng"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none transition-all font-semibold text-sm"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      placeholder="TP. Hồ Chí Minh"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Quận/Huyện</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none transition-all font-semibold text-sm"
                      value={addressFormData.district}
                      onChange={(e) => setAddressFormData({ ...addressFormData, district: e.target.value })}
                      placeholder="Quận 1"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Phường/Xã</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none transition-all font-semibold text-sm"
                      value={addressFormData.ward}
                      onChange={(e) => setAddressFormData({ ...addressFormData, ward: e.target.value })}
                      placeholder="Phường Bến Thành"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[10px] text-[#818A91] uppercase tracking-widest">Số nhà, tên đường</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] focus:!border-primary focus:!ring-0 focus:!outline-none transition-all font-semibold text-sm"
                      value={addressFormData.detail}
                      onChange={(e) => setAddressFormData({ ...addressFormData, detail: e.target.value })}
                      placeholder="123 Lê Lợi"
                      required
                    />
                  </div>

                  <div className="col-span-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setAddressFormData({ ...addressFormData, isDefault: !addressFormData.isDefault })}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${addressFormData.isDefault ? 'bg-primary' : 'bg-[#E8E8E8]'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${addressFormData.isDefault ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                      <span className="text-xs font-bold text-[#4A4A4A] group-hover:text-[#1b1c1c] transition-colors">Đặt làm địa chỉ mặc định</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex items-center gap-3">
                {editingAddress && (
                  <Popconfirm
                    title="Xóa địa chỉ"
                    description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
                    onConfirm={() => {
                      handleDeleteAddress(editingAddress.id);
                      setIsAddressModalOpen(false);
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <button type="button" className="h-11 px-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Xóa
                    </button>
                  </Popconfirm>
                )}
                <div className="flex-1" />
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="h-11 px-6 rounded-xl font-bold text-[#818A91] hover:bg-[#F5F5F5] transition-all text-sm">Hủy</button>
                <button type="submit" disabled={loading} className="h-11 px-8 rounded-xl font-bold bg-primary text-white shadow-md hover:brightness-105 transition-all text-sm flex items-center justify-center gap-2 min-w-[140px]">
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                </button>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d0d0d0; }
      `}</style>
    </div>
  );
}
