import { AdminSidebar } from "@/components/navigations/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getDashboardAuth } from "@/utils/dashboardAuth";
// import DashboardAuthGuard from "@/components/auth/DashboardAuthGuard";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getDashboardAuth();

  if (!auth) {
    redirect("/private/dashboard-login");
  }

  if (auth.role === "user") {
    redirect("/private/dashboard-access-denied");
  }

  return (
    <SidebarProvider>
      {/* <DashboardAuthGuard> */}
        <div className="flex h-screen w-full bg-slate-50">
          <AdminSidebar userRole={auth.role} userName={auth.name || auth.email || "User"} userEmail={auth.email} />
          <main className="flex-1 overflow-y-auto w-full">{children}</main>
        </div>
      {/* </DashboardAuthGuard> */}
    </SidebarProvider>
  );
}
