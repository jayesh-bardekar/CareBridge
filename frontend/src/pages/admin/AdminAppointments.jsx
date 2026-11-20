import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  Mail,
  User,
  Stethoscope,
  Filter,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Ban,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

import api from "../../services/api";

const statuses = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
};

const formatLabel = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (time) => {
  if (!time) return "Not available";

  const [hours, minutes] = time.split(":");

  return new Date(
    2000,
    0,
    1,
    Number(hours),
    Number(minutes),
  ).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={23} />
      </div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon size={18} className="mt-0.5 shrink-0 text-teal-600" />

    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  </div>
);

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionAppointment, setActionAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH APPOINTMENTS

  const fetchAppointments = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {};

        if (keyword.trim()) {
          params.keyword = keyword.trim();
        }

        if (selectedStatus !== "ALL") {
          params.status = selectedStatus;
        }

        const response = await api.get("/admin/appointments", { params });

        setAppointments(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load appointments. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [keyword, selectedStatus],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  // STATISTICS

  const statistics = useMemo(() => {
    return {
      total: appointments.length,

      pending: appointments.filter(
        (appointment) => appointment.status === "PENDING",
      ).length,

      confirmed: appointments.filter(
        (appointment) => appointment.status === "CONFIRMED",
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "COMPLETED",
      ).length,
    };
  }, [appointments]);

  // VIEW APPOINTMENT DETAILS

  const handleViewDetails = async (appointmentId) => {
    try {
      setDetailsLoading(true);
      setSelectedAppointment(null);
      setError("");

      const response = await api.get(`/admin/appointments/${appointmentId}`);

      setSelectedAppointment(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load appointment details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // CANCEL APPOINTMENT

  const handleCancelAppointment = async () => {
    if (!actionAppointment) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/appointments/${actionAppointment.id}/status`,
        {
          status: "CANCELLED",
        },
      );

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === actionAppointment.id ? response.data : appointment,
        ),
      );

      if (selectedAppointment?.id === actionAppointment.id) {
        setSelectedAppointment(response.data);
      }

      setSuccess(
        `Appointment #${response.data.id} has been cancelled successfully.`,
      );

      setActionAppointment(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeActionDialog = () => {
    if (!actionLoading) {
      setActionAppointment(null);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* PAGE HEADING */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-600">
            <ShieldCheck size={16} />
            Administration
            <span className="text-slate-300">/</span>
            Appointment Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Appointment Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor patient appointments and manage appointment cancellations.
          </p>
        </div>

        <button
          onClick={() => fetchAppointments(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            {success}
          </div>

          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={statistics.total}
          icon={ClipboardList}
          color="bg-teal-50 text-teal-600"
          description="Appointments matching current filters"
        />

        <StatCard
          title="Pending"
          value={statistics.pending}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          description="Awaiting doctor response"
        />

        <StatCard
          title="Confirmed"
          value={statistics.confirmed}
          icon={CalendarCheck}
          color="bg-emerald-50 text-emerald-600"
          description="Confirmed appointments"
        />

        <StatCard
          title="Completed"
          value={statistics.completed}
          icon={CheckCircle2}
          color="bg-blue-50 text-blue-600"
          description="Completed appointments"
        />
      </div>

      {/* APPOINTMENT TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* SEARCH AND FILTERS */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Registered Appointments
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage patient appointment records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            {/* SEARCH */}

            <div className="relative sm:col-span-2 xl:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search patient, doctor, email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            {/* STATUS FILTER */}

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-48"
              >
                <option value="ALL">All Statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Appointment
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Doctor
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Schedule
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-teal-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading appointments...
                    </p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <CalendarDays
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No appointments found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {/* APPOINTMENT ID */}

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        #{appointment.id}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(appointment.createdAt)}
                      </p>
                    </td>

                    {/* PATIENT */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                          {getInitials(appointment.patientName)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {appointment.patientName}
                          </p>

                          <p className="text-xs text-slate-400">
                            {appointment.patientEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DOCTOR */}

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {appointment.doctorName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatLabel(appointment.specialization)}
                      </p>
                    </td>

                    {/* SCHEDULE */}

                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays size={15} className="text-teal-600" />
                        {formatDate(appointment.appointmentDate)}
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} />
                        {formatTime(appointment.startTime)}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[appointment.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(appointment.status)}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(appointment.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                        >
                          <Eye size={17} />
                        </button>

                        {(appointment.status === "PENDING" ||
                          appointment.status === "CONFIRMED") && (
                          <button
                            title="Cancel Appointment"
                            onClick={() => setActionAppointment(appointment)}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Ban size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        {!loading && (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {appointments.length}
              </span>{" "}
              appointments
            </p>

            <p className="text-xs text-slate-400">
              CareBridge Appointment Administration
            </p>
          </div>
        )}
      </div>

      {/* APPOINTMENT DETAILS MODAL */}

      {(selectedAppointment || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Appointment Details
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Complete appointment and patient information
                </p>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-12 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-teal-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading appointment details...
                </p>
              </div>
            ) : (
              selectedAppointment && (
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 text-xl font-bold text-white">
                      #{selectedAppointment.id}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-bold text-slate-800">
                        Appointment #{selectedAppointment.id}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(selectedAppointment.appointmentDate)}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[selectedAppointment.status]
                        }`}
                      >
                        {formatLabel(selectedAppointment.status)}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                    <InfoItem
                      icon={User}
                      label="Patient Name"
                      value={selectedAppointment.patientName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Patient Email"
                      value={selectedAppointment.patientEmail}
                    />

                    <InfoItem
                      icon={Stethoscope}
                      label="Doctor Name"
                      value={selectedAppointment.doctorName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Doctor Email"
                      value={selectedAppointment.doctorEmail}
                    />

                    <InfoItem
                      icon={ClipboardList}
                      label="Specialization"
                      value={formatLabel(selectedAppointment.specialization)}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Appointment Date"
                      value={formatDate(selectedAppointment.appointmentDate)}
                    />

                    <InfoItem
                      icon={Clock}
                      label="Start Time"
                      value={formatTime(selectedAppointment.startTime)}
                    />

                    <InfoItem
                      icon={Clock}
                      label="End Time"
                      value={formatTime(selectedAppointment.endTime)}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Created At"
                      value={formatDateTime(selectedAppointment.createdAt)}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Last Updated"
                      value={formatDateTime(selectedAppointment.updatedAt)}
                    />
                  </div>

                  {/* REASON */}

                  <div>
                    <h5 className="mb-2 text-sm font-bold text-slate-700">
                      Appointment Reason
                    </h5>

                    <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
                      {selectedAppointment.reason || "No reason provided."}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION */}

      {actionAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Ban size={23} />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Cancel Appointment?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Are you sure you want to cancel appointment #
              {actionAppointment.id} for{" "}
              <span className="font-semibold text-slate-700">
                {actionAppointment.patientName}
              </span>
              ? This action will change its status to CANCELLED.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={closeActionDialog}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep Appointment
              </button>

              <button
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {actionLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
