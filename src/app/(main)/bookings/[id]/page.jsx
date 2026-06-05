import { BookingDetailsView } from "@/components/feature/booking/BookingDetailsView";

export const metadata = {
  title: "Chi tiết đặt lịch - Fixy",
};

export default async function BookingDetailsPage({ params }) {
  const { id } = await params;
  return <BookingDetailsView bookingId={id} />;
}
