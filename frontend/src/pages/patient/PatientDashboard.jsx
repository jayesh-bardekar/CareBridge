import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarDays,
  FileText,
  Pill,
  Bell,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  UserRound,
  Activity,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "N/A";

  const [hours, minutes] = time.split(":");

  return new Date(
    2000,
    0,
    1,
    Number(hours),
    Number(minutes),
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusStyle = (status) => {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
    case "ACTIVE":
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";

    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";

    case "CANCELLED":
    case "REJECTED":
    case "EXPIRED":
      return "bg-red-50 text-red-700 ring-1 ring-red-600/20";

    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20";
  }
};

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          {title}
        </p>

        <h3 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </h3>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${color}`}
      >
        <Icon size={23} />
      </div>
    </div>

    <p className="mt-4 text-xs font-medium text-slate-400">{description}</p>
  </div>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.get("/patients/profile"),
        api.get("/appointments/patient"),
        api.get("/medical-records/patient"),
        api.get("/prescriptions/patient"),
        api.get("/notifications/unread-count"),
      ]);

      setError("");

      if (results[0].status === "fulfilled") {
        setProfile(results[0].value.data);
      } else {
        setProfile(null);
        setError(
          results[0].reason?.response?.data?.message ||
            "Unable to load your patient profile.",
        );
      }

      setAppointments(
        results[1].status === "fulfilled" ? results[1].value.data || [] : [],
      );

      setRecords(
        results[2].status === "fulfilled" ? results[2].value.data || [] : [],
      );

      setPrescriptions(
        results[3].status === "fulfilled" ? results[3].value.data || [] : [],
      );

      setUnreadCount(
        results[4].status === "fulfilled"
          ? Number(results[4].value.data?.unreadCount ?? 0)
          : 0,
      );
    } catch {
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchDashboard);
  }, [fetchDashboard]);

  const today = new Date().toLocaleDateString("en-CA");

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate >= today &&
      !["CANCELLED", "COMPLETED", "REJECTED"].includes(appointment.status),
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  );

  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const dateA = `${a.appointmentDate}T${a.startTime || "00:00"}`;
      const dateB = `${b.appointmentDate}T${b.startTime || "00:00"}`;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-teal-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading your healthcare dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-teal-600 uppercase">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Patient Portal</span>
          </div>

          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back,{" "}
            {profile?.fullName?.split(" ")[0] ||
              user?.fullName?.split(" ")[0] ||
              "Patient"}
            !
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Manage your healthcare, appointments and medical information.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setError("");
            fetchDashboard();
          }}
          className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xs transition-all hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700"
        >
          <RefreshCw
            size={16}
            className="transition-transform duration-500 group-hover:rotate-180"
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm font-medium text-amber-800 shadow-xs">
          <AlertCircle size={19} className="shrink-0 text-amber-600" />
          {error}
        </div>
      )}

      {/* Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-7 text-white shadow-2xl shadow-teal-950/20 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-md backdrop-blur-md sm:h-20 sm:w-20">
              <UserRound size={36} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {profile?.fullName || "Patient"}
              </h2>

              <p className="mt-1 text-sm font-medium text-teal-100">
                {profile?.email || user?.email}
              </p>

              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide text-teal-50 backdrop-blur-md">
                Patient ID: #{profile?.id || "N/A"}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/patient/settings")}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0"
          >
            <span>View Profile</span>
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Quick Actions
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Access your healthcare services quickly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Find Doctors",
              description: "Explore available doctors",
              icon: UserRound,
              path: "/patient/doctors",
              color: "bg-teal-50 text-teal-600 shadow-teal-500/10",
            },
            {
              title: "Book Appointment",
              description: "Schedule a consultation",
              icon: CalendarDays,
              path: "/patient/appointments",
              color: "bg-blue-50 text-blue-600 shadow-blue-500/10",
            },
            {
              title: "Medical Records",
              description: "View your health history",
              icon: FileText,
              path: "/patient/medical-records",
              color: "bg-purple-50 text-purple-600 shadow-purple-500/10",
            },
            {
              title: "Prescriptions",
              description: "Access prescribed medicines",
              icon: Pill,
              path: "/patient/prescriptions",
              color: "bg-emerald-50 text-emerald-600 shadow-emerald-500/10",
            },
          ].map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-left shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-950/5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${action.color}`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {action.description}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-teal-600"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Healthcare Overview
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Summary of your medical activities and records.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon={CalendarDays}
            color="bg-blue-50 text-blue-600 shadow-blue-500/10"
            description="All your appointments"
          />

          <StatCard
            title="Upcoming"
            value={upcomingAppointments.length}
            icon={Clock}
            color="bg-amber-50 text-amber-600 shadow-amber-500/10"
            description="Appointments scheduled"
          />

          <StatCard
            title="Medical Records"
            value={records.length}
            icon={FileText}
            color="bg-purple-50 text-purple-600 shadow-purple-500/10"
            description="Available health records"
          />

          <StatCard
            title="Prescriptions"
            value={prescriptions.length}
            icon={Pill}
            color="bg-emerald-50 text-emerald-600 shadow-emerald-500/10"
            description="Your issued prescriptions"
          />
        </div>
      </div>

      {/* Upcoming and completed summary */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Completed Appointments
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {completedAppointments.length}
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate("/patient/notifications")}
          className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-teal-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs transition-transform group-hover:scale-105">
              <Bell size={23} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Unread Notifications
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {unreadCount}
              </p>
            </div>
          </div>

          <ArrowRight
            size={18}
            className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-600"
          />
        </div>
      </div>

      {/* Recent Appointments */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Appointments
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Your latest consultation activity
            </p>
          </div>

          <button
            onClick={() => navigate("/patient/appointments")}
            className="group inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100"
          >
            <span>View All</span>
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Activity size={28} />
            </div>
            <p className="font-bold text-slate-800">No appointments yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Book an appointment with a doctor to get started.
            </p>

            <button
              onClick={() => navigate("/patient/doctors")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
            >
              Find Doctors
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 text-xs font-bold text-white shadow-xs">
                          {(appointment.doctorName || "D")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {appointment.doctorName || "Doctor"}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            {appointment.specialization || "Consultation"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatDate(appointment.appointmentDate)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatTime(appointment.startTime)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(appointment.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientDashboard;
