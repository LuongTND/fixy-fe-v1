'use client';

export function PersonalTab({
  isEditing,
  handleStartEdit,
  handleCancelEdit,
  handleSaveProfile,
  savingProfile,
  user,
  formData,
  setFormData,
  genderLabels,
  getGenderLabel,
  addresses,
  handleOpenAddressModal,
}) {
  return (
    <>
      <div className="space-y-5 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
            <h2 className="text-base font-black text-[#1b1c1c]">Thông tin cá nhân</h2>
            {!isEditing ? (
              <button onClick={handleStartEdit} className="text-primary font-bold flex items-center gap-1.5 text-sm group">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span className="group-hover:underline">Chỉnh sửa</span>
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
                <select value={formData.gender === '' ? '' : String(formData.gender)}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#E8E8E8] bg-[#F5F5F5]/50 hover:border-[#FF8228]/50 focus:!border-[#FF8228] focus:bg-white focus:!ring-0 focus:!outline-none focus-visible:!outline-none focus:!shadow-none transition-all text-sm">
                  <option value="">Chọn giới tính</option>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 text-[#1b1c1c] text-sm font-semibold px-3 py-2 bg-[#F5F5F5] rounded-lg">
                  <span className="material-symbols-outlined text-[18px] text-[#818A91]">wc</span>
                  {getGenderLabel(user?.gender)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-[#1b1c1c]">Địa chỉ của tôi</h2>
            <button
              onClick={() => handleOpenAddressModal()}
              className="flex items-center gap-2 text-primary font-bold bg-white border border-[#E8E8E8] px-5 py-2.5 rounded-2xl hover:bg-[#F5F5F5] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">add</span>
              Thêm địa chỉ mới
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.length === 0 ? (
              <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-[#E8E8E8] flex flex-col items-center justify-center text-[#818A91]">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[32px] opacity-30">location_off</span>
                </div>
                <p className="font-bold text-sm">Chưa có địa chỉ nào được lưu</p>
                <p className="text-xs opacity-60 mt-1">Vui lòng thêm địa chỉ để thuận tiện hơn khi đặt dịch vụ</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleOpenAddressModal(addr)}
                  className={`bg-white p-5 rounded-2xl border transition-all relative group h-full flex flex-col justify-between cursor-pointer ${addr.isDefault
                    ? 'border-primary shadow-[0_4px_20px_-4px_rgba(255,130,40,0.1)] bg-primary/[0.01]'
                    : 'border-[#E8E8E8] hover:border-primary/30 hover:shadow-md'
                    }`}
                >
                  {addr.isDefault && (
                    <div className="absolute top-4 right-4 text-primary z-10">
                      <span className="material-symbols-outlined text-[20px] material-symbols-filled">star</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${addr.label?.toLowerCase() === 'văn phòng'
                      ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                      : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}>
                      <span className="material-symbols-outlined text-[20px] material-symbols-filled">
                        {addr.label?.toLowerCase() === 'văn phòng' ? 'work' : 'home'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <h3 className="font-bold text-[#1b1c1c] text-sm truncate mb-0.5">{addr.label}</h3>
                      <p className="text-[11px] text-[#818A91] leading-relaxed line-clamp-3">
                        {addr.detail}{addr.ward ? `, ${addr.ward}` : ''}{addr.district ? `, ${addr.district}` : ''}{addr.city ? `, ${addr.city}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
