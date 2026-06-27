import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Content OS — Studio",
  description: "اصنع كاروسيلز وستوريز وثامبنيلز بالذكاء الاصطناعي، وشوفها ونزّلها من مكان واحد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
