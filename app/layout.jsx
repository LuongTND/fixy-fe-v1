import { Montserrat } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "./layout-client";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Vua Thợ - Nền tảng kết nối thợ nghề",
  description: "Nền tảng kết nối thợ nghề chuyên nghiệp với khách hàng. Đăng ký ngay để trải nghiệm dịch vụ chất lượng.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
