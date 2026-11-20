import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  FileText,
  FlaskConical,
  Pill,
  Activity,
  UserRound,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

import api from "../../services/api";

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
    {/* Subtle Top Gradient Line */}
    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </p>
        <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          {value ?? 0}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {trend && (
            <span className="flex items-center text-emerald-600 font-semibold">
              <TrendingUp size={13} className="mr-0.5" />
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      </div>

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${color}`}
      >
        <Icon size={26} />
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, action }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md sm:p-7">
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-400">
            Real-time metric breakdown
          </p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>

    {children}
  </div>
);

const StatusItem = ({ label, value, icon: Icon, color }) => (
  <div className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-slate-100 p-2 transition-transform duration-200 group-hover:scale-110">
        <Icon size={16} className={color} />
      </div>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>

    <span className="rounded-lg bg-slate-100/80 px-2.5 py-1 text-sm font-bold text-slate-800 shadow-2xs">
      {value ?? 0}
    </span>
  </div>
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchDashboard, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-112.5 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-teal-600" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">
            Loading administrative data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50/90 p-8 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4 text-red-600">
          <div className="rounded-2xl bg-red-100 p-3">
            <AlertCircle size={26} />
          </div>
          <div>
            <h4 className="text-base font-bold">Failed to load dashboard</h4>
            <p className="mt-0.5 text-sm font-medium text-red-500">{error}</p>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 active:scale-98"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const users = dashboard?.users || {};
  const appointments = dashboard?.appointments || {};
  const prescriptions = dashboard?.prescriptions || {};
  const labOrders = dashboard?.labOrders || {};
  const pharmacies = dashboard?.pharmacies || {};

  const totalUsers = users.total || 0;
  const recentRegistrations = dashboard?.recentRegistrations || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner with Clean Medical Background Overlay */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-950/20 sm:p-10">
        {/* Subtle background hospital abstract pattern/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-widest text-teal-100 uppercase backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ADMINISTRATION OVERVIEW
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Welcome to CareBridge
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-teal-50 sm:text-base">
            Manage healthcare operations, monitor activities, and oversee
            patients, doctors, appointments, laboratories, and pharmacies from
            one centralized dashboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={fetchDashboard}
              className="group flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0"
            >
              <RefreshCw
                size={17}
                className="transition-transform duration-500 group-hover:rotate-180"
              />
              <span>Refresh Dashboard</span>
            </button>
          </div>
        </div>

        <Activity
          size={210}
          className="absolute -right-10 -bottom-16 text-white/10 pointer-events-none transition-transform duration-700 hover:scale-105"
        />
      </section>

      {/* Main Statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              System Overview
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Important statistics from your healthcare platform.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color="bg-blue-50 text-blue-600 shadow-blue-500/10"
            subtitle="Registered accounts"
            trend="+12%"
          />

          <StatCard
            title="Appointments"
            value={appointments.total}
            icon={CalendarDays}
            color="bg-purple-50 text-purple-600 shadow-purple-500/10"
            subtitle="Total appointments"
            trend="+8%"
          />

          <StatCard
            title="Prescriptions"
            value={prescriptions.total}
            icon={FileText}
            color="bg-amber-50 text-amber-600 shadow-amber-500/10"
            subtitle="Total prescriptions"
            trend="+5%"
          />

          <StatCard
            title="Laboratory Orders"
            value={labOrders.total}
            icon={FlaskConical}
            color="bg-cyan-50 text-cyan-600 shadow-cyan-500/10"
            subtitle="Total lab orders"
            trend="+15%"
          />
        </div>
      </section>

      {/* User Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            User Statistics
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Breakdown of active roles across the portal.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Patients"
            value={users.patients}
            icon={Users}
            color="bg-emerald-50 text-emerald-600 shadow-emerald-500/10"
            subtitle="Registered patients"
          />

          <StatCard
            title="Doctors"
            value={users.doctors}
            icon={Stethoscope}
            color="bg-indigo-50 text-indigo-600 shadow-indigo-500/10"
            subtitle="Registered doctors"
          />

          <StatCard
            title="Lab Staff"
            value={users.labStaff}
            icon={FlaskConical}
            color="bg-orange-50 text-orange-600 shadow-orange-500/10"
            subtitle="Laboratory employees"
          />

          <StatCard
            title="Pharmacists"
            value={users.pharmacists}
            icon={Pill}
            color="bg-pink-50 text-pink-600 shadow-pink-500/10"
            subtitle="Registered pharmacists"
          />
        </div>
      </section>

      {/* Operational Statistics */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Appointments */}
        <SectionCard title="Appointment Statistics" icon={CalendarDays}>
          <div className="space-y-1">
            <StatusItem
              label="Pending Approval"
              value={appointments.pending}
              icon={Clock}
              color="text-amber-500"
            />
            <StatusItem
              label="Confirmed Appointments"
              value={appointments.confirmed}
              icon={CheckCircle2}
              color="text-emerald-500"
            />
            <StatusItem
              label="Rejected Appointments"
              value={appointments.rejected}
              icon={XCircle}
              color="text-red-500"
            />
            <StatusItem
              label="Cancelled"
              value={appointments.cancelled}
              icon={XCircle}
              color="text-slate-400"
            />
            <StatusItem
              label="Completed"
              value={appointments.completed}
              icon={CheckCircle2}
              color="text-teal-500"
            />
          </div>
        </SectionCard>

        {/* Prescriptions */}
        <SectionCard title="Prescription Statistics" icon={FileText}>
          <div className="space-y-1">
            <StatusItem
              label="Issued Prescriptions"
              value={prescriptions.issued}
              icon={FileText}
              color="text-blue-500"
            />
            <StatusItem
              label="Verified by Pharmacy"
              value={prescriptions.verified}
              icon={CheckCircle2}
              color="text-emerald-500"
            />
            <StatusItem
              label="Partially Dispensed"
              value={prescriptions.partiallyDispensed}
              icon={Clock}
              color="text-amber-500"
            />
            <StatusItem
              label="Fully Dispensed"
              value={prescriptions.dispensed}
              icon={CheckCircle2}
              color="text-teal-500"
            />
            <StatusItem
              label="Expired"
              value={prescriptions.expired}
              icon={XCircle}
              color="text-red-500"
            />
          </div>
        </SectionCard>

        {/* Laboratory */}
        <SectionCard title="Laboratory Statistics" icon={FlaskConical}>
          <div className="space-y-1">
            <StatusItem
              label="Ordered Tests"
              value={labOrders.ordered}
              icon={Clock}
              color="text-amber-500"
            />
            <StatusItem
              label="Assigned to Staff"
              value={labOrders.assigned}
              icon={UserRound}
              color="text-blue-500"
            />
            <StatusItem
              label="Sample Collected"
              value={labOrders.sampleCollected}
              icon={Activity}
              color="text-indigo-500"
            />
            <StatusItem
              label="In Progress"
              value={labOrders.inProgress}
              icon={Clock}
              color="text-orange-500"
            />
            <StatusItem
              label="Completed Reports"
              value={labOrders.completed}
              icon={CheckCircle2}
              color="text-emerald-500"
            />
          </div>
        </SectionCard>

        {/* Pharmacy */}
        <SectionCard title="Pharmacy Statistics" icon={Pill}>
          <div className="space-y-1">
            <StatusItem
              label="Total Pharmacies"
              value={pharmacies.total}
              icon={Pill}
              color="text-blue-500"
            />
            <StatusItem
              label="Pending Review"
              value={pharmacies.pending}
              icon={Clock}
              color="text-amber-500"
            />
            <StatusItem
              label="Approved Partners"
              value={pharmacies.approved}
              icon={CheckCircle2}
              color="text-emerald-500"
            />
            <StatusItem
              label="Rejected"
              value={pharmacies.rejected}
              icon={XCircle}
              color="text-red-500"
            />
            <StatusItem
              label="Suspended Accounts"
              value={pharmacies.suspended}
              icon={ShieldAlert}
              color="text-slate-500"
            />
          </div>
        </SectionCard>
      </section>

      {/* Additional System Information */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Healthcare Resources
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Global inventory and record repositories.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Medical Records"
            value={dashboard?.totalMedicalRecords}
            icon={FileText}
            color="bg-violet-50 text-violet-600 shadow-violet-500/10"
            subtitle="Stored medical records"
          />

          <StatCard
            title="Medicines"
            value={dashboard?.totalMedicines}
            icon={Pill}
            color="bg-rose-50 text-rose-600 shadow-rose-500/10"
            subtitle="Available inventory medicines"
          />

          <StatCard
            title="Lab Tests"
            value={dashboard?.totalLabTests}
            icon={FlaskConical}
            color="bg-sky-50 text-sky-600 shadow-sky-500/10"
            subtitle="Available laboratory tests"
          />
        </div>
      </section>

      {/* Recent Registrations Table */}
      <SectionCard title="Recent Registrations" icon={Users}>
        {recentRegistrations.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users size={22} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              No recent registrations found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <th className="pb-4">User</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {recentRegistrations.map((registration, index) => (
                  <tr
                    key={registration.id ?? index}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 font-bold text-white shadow-md shadow-teal-600/20 transition-transform duration-200 group-hover:scale-105">
                          {registration.fullName?.charAt(0)?.toUpperCase() ||
                            registration.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>

                        <div>
                          <span className="text-sm font-bold text-slate-800">
                            {registration.fullName || "User"}
                          </span>
                          <p className="text-xs text-slate-400">
                            ID: {String(registration.id ?? '').slice(0, 8) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-sm font-medium text-slate-600">
                      {registration.email}
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                        {registration.role?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminDashboard;
