import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  FileText,
  FlaskConical,
  Pill,
  Package,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";
const menuItems = {
  ADMIN: [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Doctors", path: "/admin/doctors", icon: UserRound },
    { name: "Patients", path: "/admin/patients", icon: Users },
    { name: "Appointments", path: "/admin/appointments", icon: CalendarDays },
    { name: "Laboratory", path: "/admin/laboratory", icon: FlaskConical },
    { name: "Pharmacies", path: "/admin/pharmacies", icon: Pill },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ],

  DOCTOR: [
    { name: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
    {
      name: "My Appointments",
      path: "/doctor/appointments",
      icon: CalendarDays,
    },
    { name: "My Patients", path: "/doctor/patients", icon: Users },
    {
      name: "Medical Records",
      path: "/doctor/medical-records",
      icon: FileText,
    },
    { name: "Prescriptions", path: "/doctor/prescriptions", icon: Pill },
    { name: "Notifications", path: "/doctor/notifications", icon: Bell },
    { name: "Settings", path: "/doctor/settings", icon: Settings },
  ],

  PATIENT: [
    { name: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Find Doctors", path: "/patient/doctors", icon: UserRound },
    { name: "Appointments", path: "/patient/appointments", icon: CalendarDays },
    {
      name: "Medical Records",
      path: "/patient/medical-records",
      icon: FileText,
    },
    { name: "Prescriptions", path: "/patient/prescriptions", icon: Pill },
    { name: "Lab Reports", path: "/patient/lab-reports", icon: FlaskConical },
    { name: "Notifications", path: "/patient/notifications", icon: Bell },
  ],

  LAB_STAFF: [
    { name: "Dashboard", path: "/lab/dashboard", icon: LayoutDashboard },
    { name: "Lab Orders", path: "/lab/orders", icon: FlaskConical },
    { name: "Lab Reports", path: "/lab/reports", icon: FileText },
    { name: "Notifications", path: "/lab/notifications", icon: Bell },
  ],

  PHARMACIST: [
    { name: "Dashboard", path: "/pharmacy/dashboard", icon: LayoutDashboard },
    { name: "Prescriptions", path: "/pharmacy/prescriptions", icon: FileText },
    { name: "Medicine Inventory", path: "/pharmacy/inventory", icon: Package },
    { name: "Notifications", path: "/pharmacy/notifications", icon: Bell },
  ],
};

const Sidebar = ({ open, onClose, onLogout }) => {
  const { user } = useAuth();

  const role = user?.role || "PATIENT";
  const items = menuItems[role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-linear-to-b from-white via-slate-50/60 to-teal-50/30 shadow-[4px_0_30px_-10px_rgba(15,23,42,0.08)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100/80 px-6">
          <div className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <HeartPulse size={24} />
            </div>
            <div>
              <h1 className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-900 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                CareBridge
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-teal-600">
                Healthcare Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mx-4 mt-6 rounded-2xl border border-teal-200/50 bg-white/80 p-4 shadow-sm shadow-teal-950/5 backdrop-blur-sm transition-all duration-200 hover:border-teal-300/60 hover:shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-600 to-emerald-500 text-lg font-bold text-white shadow-md shadow-teal-600/25">
              {user?.fullName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                {user?.fullName || user?.email || "User"}
              </p>

              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-600/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
            Main Menu
          </p>

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.endsWith("/dashboard")}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25"
                      : "text-slate-600 hover:translate-x-1 hover:bg-white hover:text-teal-700 hover:shadow-sm"
                  }`
                }
              >
                <Icon
                  size={19}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200/60 bg-white/60 p-4 backdrop-blur-sm">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3.5 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:shadow-sm"
          >
            <LogOut
              size={19}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>Logout</span>
          </button>

          <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
            CareBridge © 2026
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
