import { JobTrackingView } from '@/components/feature/technician/JobTrackingView';

export default async function TechnicianBookingDetailPage({ params }) {
  const { id } = await params;
  return <JobTrackingView bookingId={id} />;
}
