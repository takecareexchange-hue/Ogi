import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <Sidebar />
      <main className="pl-64">{children}</main>
    </div>
  );
}