import { Suspense } from 'react';
import ProfileView from '@/components/feature/profile/ProfileView';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#fbf9f8]"><div className="text-[#818A91] font-semibold">Đang tải...</div></div>}>
      <ProfileView />
    </Suspense>
  );
}
