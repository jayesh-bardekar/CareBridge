import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatText = (value) =>
  value
    ? value
        .toString()
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Not specified";

const formatTime = (time) => {
  if (!time) return "--:--";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15";

const labelClass =
  "mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase";

const PatientAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const fetchData = async () => {
    try {
      const [doctorResponse, appointmentResponse] = await Promise.all([
        api.get("/doctors"),
        api.get("/appointments/patient"),
      ]);

      setError("");
      setDoctors(doctorResponse.data);
      setAppointments(appointmentResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load appointment information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      const request = {
        doctorId: Number(form.doctorId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason.trim(),
      };

      await api.post("/appointments", request);

      setSuccess(
        "Appointment booked successfully! Waiting for doctor confirmation.",
      );

      setForm({
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to book appointment. Please try again.",
      );
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(`/appointments/${appointmentId}/cancel`);

      setSuccess("Appointment cancelled successfully.");

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    }
  };

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(form.doctorId),
  );

  const filteredAppointments = appointments.filter((appointment) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      appointment.doctorName?.toLowerCase().includes(searchText) ||
      appointment.specialization?.toLowerCase().includes(searchText) ||
      appointment.reason?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      ["PENDING", "CONFIRMED"].includes(appointment.status) &&
      appointment.appointmentDate >= getToday(),
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  ).length;

  const cancelledAppointments = appointments.filter((appointment) =>
    ["CANCELLED", "REJECTED"].includes(appointment.status),
  ).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-950/20 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-widest text-teal-100 uppercase backdrop-blur-md">
              <Sparkles size={13} className="animate-pulse text-emerald-400" />
              <span>Healthcare Services</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              Book consultations and manage your appointments.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              void fetchData();
            }}
            disabled={loading}
            className="group inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={`transition-transform duration-500 ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 p-4 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-xl">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="flex-1">{success}</p>

          <button
            onClick={() => setSuccess("")}
            className="rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/95 p-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-xl">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <p className="flex-1">{error}</p>

          <button
            onClick={() => setError("")}
            className="rounded-lg p-1 text-red-700 transition hover:bg-red-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={appointments.length}
          icon={CalendarDays}
          color="blue"
        />

        <StatCard
          title="Upcoming"
          value={upcomingAppointments}
          icon={Clock}
          color="teal"
        />

        <StatCard
          title="Completed"
          value={completedAppointments}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Cancelled / Rejected"
          value={cancelledAppointments}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Booking Form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-2xs">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Book New Appointment
            </h2>

            <p className="text-xs font-medium text-slate-400">
              Select a doctor and choose your preferred consultation time.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-sm font-medium text-slate-500">
            <Loader2 size={20} className="animate-spin text-teal-600" />
            Loading doctors...
          </div>
        ) : doctors.length === 0 ? (
          <p className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm font-medium text-slate-500">
            No approved doctors are currently available.
          </p>
        ) : (
          <form onSubmit={handleBooking} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Doctor */}
              <div>
                <label className={labelClass}>Select Doctor *</label>

                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Choose a doctor</option>

                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.fullName} -{" "}
                      {formatText(doctor.specialization)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className={labelClass}>Appointment Date *</label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  min={getToday()}
                  required
                  className={inputClass}
                />
              </div>

              {/* Time */}
              <div>
                <label className={labelClass}>Appointment Time *</label>

                <input
                  type="time"
                  name="appointmentTime"
                  value={form.appointmentTime}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Reason */}
              <div>
                <label className={labelClass}>Appointment Reason *</label>

                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for consultation"
                  maxLength={500}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Selected Doctor Information */}
            {selectedDoctor && (
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-5 transition-all">
                <div className="flex items-center gap-2.5 text-sm font-extrabold text-teal-900">
                  <div className="rounded-lg bg-teal-100 p-1.5 text-teal-700">
                    <Stethoscope size={17} />
                  </div>
                  Dr. {selectedDoctor.fullName}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <p>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Specialization:{" "}
                    </span>
                    {formatText(selectedDoctor.specialization)}
                  </p>

                  <p>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Consultation Fee:{" "}
                    </span>
                    {selectedDoctor.consultationFee != null
                      ? `₹${selectedDoctor.consultationFee}`
                      : "Not specified"}
                  </p>

                  <p>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Available Days:{" "}
                    </span>
                    {selectedDoctor.availableDays || "Not specified"}
                  </p>

                  <p>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Working Hours:{" "}
                    </span>
                    {selectedDoctor.startTime || "--:--"} -{" "}
                    {selectedDoctor.endTime || "--:--"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={booking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays size={18} />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Appointment History */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Appointment History
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-400">
              View and manage your consultation bookings.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              void fetchData();
            }}
            disabled={loading}
            className="group inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={`transition-transform duration-500 ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-3.5 sm:flex-row">
            <div className="group relative flex-1">
              <Search
                size={18}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor or reason..."
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 py-3 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15 sm:min-w-48"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays size={28} />
              </div>

              <h3 className="font-bold text-slate-800">
                No Appointments Found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <th className="px-5 py-4">Doctor</th>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 text-xs font-bold text-white shadow-2xs">
                            {(appointment.doctorName || "D")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Dr. {appointment.doctorName}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                              {formatText(appointment.specialization)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(appointment.appointmentDate)}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          {formatTime(appointment.startTime)} -{" "}
                          {formatTime(appointment.endTime)}
                        </p>
                      </td>

                      <td className="max-w-52 px-5 py-4 text-sm font-medium text-slate-600">
                        {appointment.reason}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={appointment.status} />
                      </td>

                      <td className="px-5 py-4">
                        {["PENDING", "CONFIRMED"].includes(appointment.status) &&
                          (appointment.appointmentDate > getToday() ||
                            (appointment.appointmentDate === getToday() &&
                              appointment.startTime >
                                new Date().toTimeString().slice(0, 8))) && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}

                        {["CANCELLED", "REJECTED", "COMPLETED"].includes(
                          appointment.status,
                        ) && (
                          <span className="text-xs font-medium text-slate-400">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-500/10",
    teal: "bg-teal-50 text-teal-600 shadow-teal-500/10",
    green: "bg-emerald-50 text-emerald-600 shadow-emerald-500/10",
    red: "bg-red-50 text-red-600 shadow-red-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {title}
          </p>

          <h3 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${styles[color]}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    CANCELLED: "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.PENDING
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatText(status)}
    </span>
  );
};

export default PatientAppointments;