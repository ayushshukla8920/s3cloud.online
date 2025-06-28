import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "S3Cloud Domains - Free Subdomains",
  icons: {
    icon: "/S3.png",
  },
  description:
    "Get your free subdomain on s3cloud.online instantly. Perfect for developers, startups, and personal projects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
