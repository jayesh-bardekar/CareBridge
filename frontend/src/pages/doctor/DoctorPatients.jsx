import { useEffect, useMemo, useState } from "react";
import { Users, Search, RefreshCw, Mail } from "lucide-react";
import api from "../../services/api";

const DoctorPatients = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/appointments/doctor");
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/appointments/doctor")
      .then((response) => {
        if (active) setAppointments(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load patients:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const patients = useMemo(() => {
    const uniquePatients = new Map();

    appointments.forEach((appointment) => {
      if (appointment.patientId) {
        const existing = uniquePatients.get(appointment.patientId);

        uniquePatients.set(appointment.patientId, {
          id: appointment.patientId,
          name: appointment.patientName,
          email: appointment.patientEmail,
          appointments: (existing?.appointments || 0) + 1,
          lastAppointment: appointment.appointmentDate,
        });
      }
    });

    return Array.from(uniquePatients.values());
  }, [appointments]);

  const filteredPatients = patients.filter((patient) =>
    `${patient.name || ""} ${patient.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Patients</h1>
          <p className="mt-1 text-sm text-slate-500">
            View patients who have appointments with you.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchPatients();
          }}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Users className="text-teal-600" size={24} />
          <p className="mt-3 text-sm text-slate-500">Total Patients</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {loading ? "..." : patients.length}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <Search size={19} className="text-slate-400" />
        <input
          id="patient-search"
          name="patientSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient name or email..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={38} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Appointments</th>
                  <th className="px-5 py-4">Last Appointment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {patient.name || "Patient"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="flex items-center gap-2">
                        <Mail size={15} className="text-slate-400" />
                        {patient.email || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {patient.appointments}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {patient.lastAppointment || "-"}
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

export default DoctorPatients;
