import "./globals.css";
import Providers from "./Providers";
import AdminLayout from "../components/layout/AdminLayout";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Admin Panel | Petals by Smira",
  description: "Manage Petals by Smira e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-200 selection:bg-gray-800 selection:text-white transition-colors duration-500`}>
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
