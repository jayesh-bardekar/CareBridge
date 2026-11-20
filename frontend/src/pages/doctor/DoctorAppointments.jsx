import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw, Search } from "lucide-react";
import api from "../../services/api";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAppointments = async () => {
    try {
      const response = await api.get("/appointments/doctor");
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = () => {
    setLoading(true);
    return loadAppointments();
  };

  useEffect(() => {
    let active = true;

    api
      .get("/appointments/doctor")
      .then((response) => {
        if (active) setAppointments(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load appointments:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    `${appointment.patientName} ${appointment.patientEmail} ${appointment.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your patient appointments.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <Search size={19} className="text-slate-400" />

        <input
          id="appointment-search"
          name="appointmentSearch"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient name, email or status..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading appointments...
          </p>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays size={38} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">
              No appointments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50">
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

                    <td className="px-5 py-4 text-slate-600">
                      {appointment.reason || "-"}
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

export default DoctorAppointments;
