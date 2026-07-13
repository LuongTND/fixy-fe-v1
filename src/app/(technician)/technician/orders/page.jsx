import { redirect } from 'next/navigation';

export default function TechnicianOrdersRedirectPage() {
  redirect('/technician/bookings');
}
