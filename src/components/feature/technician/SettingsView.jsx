'use client';
import { useState, useEffect } from 'react';
import { notificationApi } from '@/apis/notification.api';

export function SettingsView() {
  const [settings, setSettings] = useState({
    newBooking: true,
    payment: true,
    statusUpdate: true,
    promotions: true,
    viaPush: true,
    viaInApp: true,
  });

  const [tfa, setTfa] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await notificationApi.getSettings();
        const data = response?.data || response;
        if (data && typeof data === 'object') {
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (err) {
        console.error('Failed to load settings in SettingsView:', err);
      }
    };
    loadSettings();
  }, []);

  const toggleNotification = async (key) => {
    try {
      const updatedValue = !settings[key];
      const nextSettings = { ...settings, [key]: updatedValue };
      setSettings(nextSettings);
      await notificationApi.updateSettings(nextSettings);
    } catch (err) {
      console.error('Failed to update settings in SettingsView:', err);
      // Revert
      try {
        const response = await notificationApi.getSettings();
        const data = response?.data || response;
        if (data) setSettings(data);
      } catch {}
    }
  };

  return (
    <main className="p-md md:p-xl max-w-[800px] mx-auto w-full space-y-lg">
      <div className="mb-lg">
        <h2 className="font-h2 text-h2 text-on-surface">Cài đặt</h2>
        <p className="font-body-base text-body-base text-text-secondary mt-base">Quản lý thông báo, bảo mật và tùy chọn tài khoản của bạn.</p>
      </div>

      {/* Notifications Card */}
      <section className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="px-lg py-md border-b border-border-light bg-surface-container-low">
          <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary-container">notifications_active</span>
            Quản lý thông báo
          </h3>
        </div>
        <div className="p-lg space-y-md">
          {/* Toggle Item */}
          <div className="flex items-center justify-between gap-md">
            <div className="flex-1 min-w-0">
              <h4 className="font-body-bold text-body-bold text-on-surface">Đơn hàng mới</h4>
              <p className="font-caption text-caption text-text-secondary">Nhận thông báo ngay khi có yêu cầu công việc mới phù hợp.</p>
            </div>
            <button 
              onClick={() => toggleNotification('newBooking')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${settings.newBooking ? 'bg-primary-container' : 'bg-surface-variant'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.newBooking ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <hr className="border-border-light" />
          {/* Toggle Item */}
          <div className="flex items-center justify-between gap-md">
            <div className="flex-1 min-w-0">
              <h4 className="font-body-bold text-body-bold text-on-surface">Thanh toán</h4>
              <p className="font-caption text-caption text-text-secondary">Cảnh báo về các khoản thanh toán thành công và chuyển ví.</p>
            </div>
            <button 
              onClick={() => toggleNotification('payment')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${settings.payment ? 'bg-primary-container' : 'bg-surface-variant'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.payment ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <hr className="border-border-light" />
          {/* Toggle Item */}
          <div className="flex items-center justify-between gap-md">
            <div className="flex-1 min-w-0">
              <h4 className="font-body-bold text-body-bold text-on-surface">Khuyến mãi</h4>
              <p className="font-caption text-caption text-text-secondary">Cập nhật về tiền thưởng, ưu đãi và chương trình của nền tảng.</p>
            </div>
            <button 
              onClick={() => toggleNotification('promotions')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${settings.promotions ? 'bg-primary-container' : 'bg-surface-variant'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Security Card */}
      <section className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="px-lg py-md border-b border-border-light bg-surface-container-low">
          <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary-container">security</span>
            Bảo mật & Quyền riêng tư
          </h3>
        </div>
        <div className="p-lg space-y-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="flex-1 min-w-0">
              <h4 className="font-body-bold text-body-bold text-on-surface">Đổi mật khẩu</h4>
              <p className="font-caption text-caption text-text-secondary mt-1">Đảm bảo tài khoản của bạn luôn an toàn bằng cách sử dụng mật khẩu mạnh.</p>
            </div>
            <button className="px-md py-2 border-2 border-primary-container text-primary-container font-small-bold rounded-[8px] hover:bg-surface-container-low transition-colors whitespace-nowrap shrink-0">
              Cập nhật mật khẩu
            </button>
          </div>
          <div className="bg-surface-container p-md rounded-lg flex items-start gap-md mt-sm">
            <div className="mt-1 shrink-0">
              <span className="material-symbols-outlined text-tertiary">phonelink_lock</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1 gap-sm">
                <h4 className="font-body-bold text-body-bold text-on-surface">Xác minh 2 bước (2FA)</h4>
                <button 
                  onClick={() => setTfa(!tfa)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${tfa ? 'bg-primary-container' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tfa ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="font-caption text-caption text-text-secondary">Thêm một lớp bảo mật bổ sung.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl shadow-sm border border-error/30 overflow-hidden">
        <div className="px-lg py-md border-b border-error/20 bg-error-container/30">
          <h3 className="font-h3 text-h3 text-error flex items-center gap-xs">
            <span className="material-symbols-outlined">warning</span>
            Quản lý tài khoản
          </h3>
        </div>
        <div className="p-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="flex-1 min-w-0">
              <h4 className="font-body-bold text-body-bold text-on-surface">Xóa tài khoản</h4>
              <p className="font-caption text-caption text-text-secondary mt-1">Hành động này sẽ hủy kích hoạt hồ sơ của bạn. Lịch sử giao dịch vẫn được lưu giữ.</p>
            </div>
            <button className="px-md py-2 bg-error text-white font-small-bold rounded-[8px] hover:bg-error-alt transition-colors whitespace-nowrap shadow-sm shrink-0">
              Hủy kích hoạt tài khoản
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
