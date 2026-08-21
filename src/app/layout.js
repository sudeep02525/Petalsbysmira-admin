import "./globals.css";
import Providers from "./Providers";
import AdminLayout from "../components/layout/AdminLayout";

export const metadata = {
  title: "Admin Panel | Petals by Smira",
  description: "Manage Petals by Smira e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-gray-900 bg-gray-50">
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
