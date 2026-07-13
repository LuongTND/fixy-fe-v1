import { redirect } from 'next/navigation';

export default async function TechnicianOrderDetailRedirectPage({ params }) {
  const { id } = await params;
  redirect(`/technician/bookings/${id}`);
}
