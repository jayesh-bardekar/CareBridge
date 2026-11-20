import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  Clock,
  Activity,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments/doctor");
      setAppointments(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    setLoading(true);
    setError("");
    fetchAppointments();
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAppointments);
  }, []);

  const today = new Date();
  const todayDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todayAppointments = appointments.filter(
    (item) => item.appointmentDate === todayDate,
  );

  const completedAppointments = appointments.filter(
    (item) => String(item.status).toUpperCase() === "COMPLETED",
  );

  const totalPatients = new Set(appointments.map((item) => item.patientId))
    .size;

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: CalendarDays,
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Clock,
    },
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
    },
    {
      title: "Completed",
      value: completedAppointments.length,
      icon: ClipboardCheck,
    },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      COMPLETED: "bg-emerald-50 text-emerald-700",
      CONFIRMED: "bg-blue-50 text-blue-700",
      PENDING: "bg-amber-50 text-amber-700",
      CANCELLED: "bg-red-50 text-red-700",
    };

    return (
      styles[String(status).toUpperCase()] || "bg-slate-100 text-slate-600"
    );
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Doctor Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your appointments and patient activities.
          </p>
        </div>

        <button
          onClick={refreshAppointments}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-800">
                {loading ? "..." : stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Appointments */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
            <Activity size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">Recent Appointments</h2>
            <p className="text-xs text-slate-500">
              Your latest patient appointments
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={refreshAppointments}
              className="mt-3 text-sm font-semibold text-teal-600"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays size={38} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No appointments yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Your appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Appointment ID</th>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      #{appointment.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {appointment.patientName || "Patient"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {appointment.patientEmail || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {appointment.appointmentDate || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {appointment.startTime || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(appointment.status)}`}
                      >
                        {appointment.status || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
