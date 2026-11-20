import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-teal-50/25 to-cyan-50/35 text-slate-800">
      {/* Subtle Ambient Background Glows */}
      <div className="pointer-events-none fixed -top-32 right-0 h-112 w-md rounded-full bg-teal-300/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-72 h-96 w-[24rem] rounded-full bg-cyan-300/15 blur-3xl" />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area - lg:pl-72 taaki sidebar ke niche content na jaye */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        {/* Topbar - sticky top-0 ki wajah se ye page scroll hone par bhi apni jagah fix rahega */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
