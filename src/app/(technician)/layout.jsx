import { TechnicianShell } from "@/components/feature/technician/TechnicianShell";

export const metadata = {
  title: "Fixy - Bảng điều khiển thợ",
  description: "Bảng điều khiển dành cho thợ nghề Fixy",
};

export default function TechnicianLayout({ children }) {
  return <TechnicianShell>{children}</TechnicianShell>;
}
