'use client';

import { useState } from 'react';
import { Steps } from 'antd';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { GENDER_LABELS } from '@/utils/helpers';

const fallbackCategories = [
  { id: 'electrician', name: 'Electrician', icon: 'bolt' },
  { id: 'plumber', name: 'Plumber', icon: 'plumbing' },
  { id: 'painter', name: 'Painter', icon: 'format_paint' },
  { id: 'carpenter', name: 'Carpenter', icon: 'construction' },
];

export function Step1BasicInfo({ onNext, onUpdate, data = {} }) {
  const { parentCategories } = useServiceCategories({ parentsOnly: true, fallback: fallbackCategories });
  const categories = parentCategories.length > 0 ? parentCategories : fallbackCategories;
  const [fullName, setFullName] = useState(data.fullName || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth?.slice(0, 10) || '');
  const [gender, setGender] = useState(data.gender ?? '');
  const [bio, setBio] = useState(data.bio || '');
  const [experienceYears, setExperienceYears] = useState(data.experienceYears || 1);
  const [selectedCategories, setSelectedCategories] = useState(data.selectedCategoryIds || []);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((current) => (
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    ));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate({
      fullName,
      phone,
      dateOfBirth,
      gender,
      bio,
      experienceYears: Number(experienceYears),
      selectedCategoryIds: selectedCategories,
      workerService: selectedCategories.map((categoryId, index) => ({
        categoryId,
        categoryName: categories.find((category) => category.id === categoryId)?.name || categoryId,
        basePrice: data.workerService?.find((service) => service.categoryId === categoryId)?.basePrice || 0,
        isPrimary: index === 0,
      })),
    });
    onNext();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-bg p-4 shadow-sm md:p-5">
        <Steps
          current={0}
          responsive
          items={[
            { title: 'Thông tin cơ bản', description: 'Dịch vụ và hồ sơ' },
            { title: 'Xác minh', description: 'Giấy tờ cần duyệt' },
            { title: 'Hoàn thiện', description: 'Ảnh và khu vực' },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="space-y-6 xl:col-span-8">
          <section className="rounded-xl border border-border-light bg-surface-bg p-5 shadow-sm md:p-6 xl:p-7">
            <div className="mb-6">
              <h1 className="mb-2 text-[28px] font-bold leading-tight text-text-secondary">Basic Info & Services</h1>
              <p className="text-sm leading-6 text-text-tertiary">Tell us about your expertise and let customers know who you are.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Full Name</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    placeholder="Nguyen Van A"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Phone Number</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    placeholder="0901234567"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    type="tel"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Date of Birth</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Gender</label>
                  <select
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    {Object.entries(GENDER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Target</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    placeholder="Email hoặc số điện thoại tài khoản"
                    value={data.target || ''}
                    onChange={(event) => onUpdate({ target: event.target.value })}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-small-bold text-text-secondary">Years of Experience</label>
                  <input
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                    min={0}
                    value={experienceYears}
                    onChange={(event) => setExperienceYears(event.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-small-bold text-text-secondary">Professional Bio</label>
                <textarea
                  className="w-full resize-none rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus-visible:!outline-none focus:!ring-0"
                  placeholder="Briefly describe your skills and specialties..."
                  rows="4"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="block font-small-bold text-text-secondary">Select Your Services</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`relative flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-xl border bg-white p-3 text-center transition-all hover:border-primary hover:bg-primary-light ${
                          isSelected
                            ? 'border-2 border-primary bg-primary-light text-primary shadow-sm'
                            : 'border-border-light text-text-tertiary'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="material-symbols-outlined text-[24px]">{category.icon}</span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-text-tertiary'}`}>{category.name}</span>
                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                            <span className="material-symbols-outlined !text-[18px] !leading-none">check</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button className="h-11 rounded-full border-2 border-primary bg-transparent px-8 font-semibold text-primary transition-all hover:bg-primary-light" type="button">Save Draft</button>
                <button className="h-11 rounded-full border-none bg-primary px-8 font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95" type="submit">Next: Documents</button>
              </div>
            </form>
          </section>
        </div>

        <aside className="xl:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-[#10B981] bg-[#E6F8F3] p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#10B981]">contact_support</span>
                <div>
                  <h4 className="mb-2 font-body-bold text-text-secondary">Need Help?</h4>
                  <p className="mb-4 font-small text-text-tertiary">Our specialist team is available to help you complete your profile.</p>
                  <button className="cursor-pointer border-none bg-transparent font-small-bold text-text-secondary underline underline-offset-4">Talk to an expert</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
