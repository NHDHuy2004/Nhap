import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Món quà đầu tiên ❤️ — dành cho Nguyễn Trương Băng Tâm",
  description:
    "Một món quà nhỏ, được mở ra từng lớp dưới bầu trời đêm. Dành riêng cho Nguyễn Trương Băng Tâm.",
};

export const viewport: Viewport = {
  themeColor: "#050014",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}