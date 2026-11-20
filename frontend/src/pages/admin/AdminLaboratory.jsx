import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  FlaskConical,
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
  ClipboardList,
  UserCheck,
  FileText,
  CalendarDays,
  UserRoundPlus,
  Activity,
  Microscope,
} from "lucide-react";

import api from "../../services/api";

const statuses = [
  "ORDERED",
  "ASSIGNED",
  "SAMPLE_COLLECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const statusStyles = {
  ORDERED: "bg-amber-50 text-amber-700",
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  SAMPLE_COLLECTED: "bg-cyan-50 text-cyan-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const formatLabel = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

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

const AdminLaboratory = () => {
  const [orders, setOrders] = useState([]);
  const [labStaff, setLabStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [assignOrder, setAssignOrder] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // FETCH LABORATORY ORDERS

  const fetchOrders = useCallback(
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

        const response = await api.get("/admin/lab-orders", { params });

        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load laboratory orders. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [keyword, selectedStatus],
  );

  // FETCH ACTIVE LAB STAFF

  const fetchLabStaff = useCallback(async () => {
    try {
      const response = await api.get("/admin/users", {
        params: {
          role: "LAB_STAFF",
        },
      });

      const users = Array.isArray(response.data) ? response.data : [];

      setLabStaff(
        users.filter(
          (user) => user.role === "LAB_STAFF" && user.enabled === true,
        ),
      );
    } catch (err) {
      console.error("Unable to load laboratory staff:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLabStaff();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchLabStaff]);

  // STATISTICS

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      ordered: orders.filter((order) => order.status === "ORDERED").length,

      inProgress: orders.filter(
        (order) =>
          order.status === "SAMPLE_COLLECTED" || order.status === "IN_PROGRESS",
      ).length,

      completed: orders.filter((order) => order.status === "COMPLETED").length,
    };
  }, [orders]);

  // VIEW ORDER DETAILS

  const handleViewDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setSelectedOrder(null);
      setError("");

      const response = await api.get(`/admin/lab-orders/${orderId}`);

      setSelectedOrder(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load laboratory order details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // VIEW LABORATORY REPORT (ADMIN VIEW ONLY)

  const handleViewReport = async (orderId) => {
    try {
      setReportLoading(true);
      setSelectedReport(null);
      setError("");

      const response = await api.get(`/admin/lab-orders/${orderId}/report`);

      setSelectedReport(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load laboratory report.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  // OPEN ASSIGNMENT MODAL

  const handleOpenAssign = (order) => {
    setAssignOrder(order);
    setSelectedStaffId(
      order.assignedLabStaffId ? String(order.assignedLabStaffId) : "",
    );
  };

  // ASSIGN LAB STAFF

  const handleAssignStaff = async () => {
    if (!assignOrder || !selectedStaffId) {
      setError("Please select laboratory staff.");
      return;
    }

    try {
      setAssignLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/lab-orders/${assignOrder.id}/assign`,
        {
          labStaffId: Number(selectedStaffId),
        },
      );

      setOrders((previous) =>
        previous.map((order) =>
          order.id === assignOrder.id ? response.data : order,
        ),
      );

      if (selectedOrder?.id === assignOrder.id) {
        setSelectedOrder(response.data);
      }

      setSuccess(
        `Laboratory staff assigned successfully to order #${response.data.id}.`,
      );

      setAssignOrder(null);
      setSelectedStaffId("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to assign laboratory staff.",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const closeAssignDialog = () => {
    if (!assignLoading) {
      setAssignOrder(null);
      setSelectedStaffId("");
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
            Laboratory Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Laboratory Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor laboratory orders, assign staff and track test progress.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOrders(true);
            fetchLabStaff();
          }}
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
          title="Total Lab Orders"
          value={statistics.total}
          icon={ClipboardList}
          color="bg-teal-50 text-teal-600"
          description="Orders matching current filters"
        />

        <StatCard
          title="New Orders"
          value={statistics.ordered}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          description="Awaiting staff assignment"
        />

        <StatCard
          title="In Progress"
          value={statistics.inProgress}
          icon={Activity}
          color="bg-blue-50 text-blue-600"
          description="Tests currently being processed"
        />

        <StatCard
          title="Completed"
          value={statistics.completed}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
          description="Completed laboratory tests"
        />
      </div>

      {/* LABORATORY ORDERS TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* SEARCH AND FILTERS */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Laboratory Orders
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View laboratory requests and manage staff assignments.
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
                placeholder="Search patient, doctor, test..."
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
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-52"
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
          <table className="w-full min-w-275 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Test Information
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assigned Staff
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Report
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-teal-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading laboratory orders...
                    </p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <FlaskConical
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No laboratory orders found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {/* ORDER ID */}

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">#{order.id}</p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(order.orderedAt)}
                      </p>
                    </td>

                    {/* PATIENT */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                          {getInitials(order.patientName)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {order.patientName}
                          </p>

                          <p className="text-xs text-slate-400">
                            {order.patientEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TEST INFORMATION */}

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {order.testName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatLabel(order.category)}
                      </p>
                    </td>

                    {/* ASSIGNED STAFF */}

                    <td className="px-6 py-4">
                      {order.assignedLabStaffName ? (
                        <>
                          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <UserCheck size={15} className="text-emerald-600" />
                            {order.assignedLabStaffName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Staff #{order.assignedLabStaffId}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-amber-600">
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(order.status)}
                      </span>
                    </td>

                    {/* REPORT */}

                    <td className="px-6 py-4">
                      {order.reportAvailable ? (
                        <button
                          onClick={() => handleViewReport(order.id)}
                          title="View Laboratory Report"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <FileText size={15} />
                          View Report
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Clock size={15} />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(order.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                        >
                          <Eye size={17} />
                        </button>

                        {order.status === "ORDERED" && (
                          <button
                            title="Assign Lab Staff"
                            onClick={() => handleOpenAssign(order)}
                            className="rounded-lg p-2 text-teal-600 transition hover:bg-teal-50"
                          >
                            <UserRoundPlus size={17} />
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
              <span className="font-bold text-slate-700">{orders.length}</span>{" "}
              laboratory orders
            </p>

            <p className="text-xs text-slate-400">
              CareBridge Laboratory Administration
            </p>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}

      {(selectedOrder || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Laboratory Order Details
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Complete laboratory order and assignment information
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
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
                  Loading laboratory order details...
                </p>
              </div>
            ) : (
              selectedOrder && (
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 text-white">
                      <FlaskConical size={30} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-bold text-slate-800">
                        Laboratory Order #{selectedOrder.id}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedOrder.testName}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[selectedOrder.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(selectedOrder.status)}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                    <InfoItem
                      icon={User}
                      label="Patient Name"
                      value={selectedOrder.patientName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Patient Email"
                      value={selectedOrder.patientEmail}
                    />

                    <InfoItem
                      icon={Stethoscope}
                      label="Doctor Name"
                      value={selectedOrder.doctorName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Doctor Email"
                      value={selectedOrder.doctorEmail}
                    />

                    <InfoItem
                      icon={Microscope}
                      label="Laboratory Test"
                      value={selectedOrder.testName}
                    />

                    <InfoItem
                      icon={FlaskConical}
                      label="Test Category"
                      value={formatLabel(selectedOrder.category)}
                    />

                    <InfoItem
                      icon={UserCheck}
                      label="Assigned Staff"
                      value={selectedOrder.assignedLabStaffName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Staff Email"
                      value={selectedOrder.assignedLabStaffEmail}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Ordered At"
                      value={formatDateTime(selectedOrder.orderedAt)}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Assigned At"
                      value={formatDateTime(selectedOrder.assignedAt)}
                    />

                    <InfoItem
                      icon={Clock}
                      label="Sample Collected At"
                      value={formatDateTime(selectedOrder.sampleCollectedAt)}
                    />

                    <InfoItem
                      icon={CheckCircle2}
                      label="Completed At"
                      value={formatDateTime(selectedOrder.completedAt)}
                    />
                  </div>

                  {/* NOTES */}

                  <div>
                    <h5 className="mb-2 text-sm font-bold text-slate-700">
                      Laboratory Notes
                    </h5>

                    <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
                      {selectedOrder.notes || "No notes provided."}
                    </p>
                  </div>

                  {/* REPORT STATUS */}

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                        <FileText size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Laboratory Report
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {selectedOrder.reportAvailable
                            ? "Report has been generated."
                            : "Report has not been generated yet."}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedOrder.reportAvailable
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedOrder.reportAvailable ? "Available" : "Pending"}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* LABORATORY REPORT MODAL - ADMIN VIEW ONLY */}

      {(selectedReport || reportLoading) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600">
                  <ShieldCheck size={14} />
                  Admin · View Only
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Laboratory Report
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Review the submitted test results. Download is not available
                  to administrators.
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                disabled={reportLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close report"
              >
                <X size={20} />
              </button>
            </div>

            {reportLoading ? (
              <div className="p-12 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-teal-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading laboratory report...
                </p>
              </div>
            ) : (
              selectedReport && (
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                  <div className="flex items-start gap-4 rounded-xl bg-linear-to-br from-teal-50 to-cyan-50 p-5">
                    <div className="rounded-xl bg-white p-3 text-teal-600 shadow-sm">
                      <FileText size={25} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold text-slate-800">
                        {selectedReport.testName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Laboratory Order #{selectedReport.labOrderId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                    <InfoItem
                      icon={User}
                      label="Patient"
                      value={selectedReport.patientName}
                    />
                    <InfoItem
                      icon={Stethoscope}
                      label="Doctor"
                      value={selectedReport.doctorName}
                    />
                    <InfoItem
                      icon={UserCheck}
                      label="Report Uploaded By"
                      value={selectedReport.uploadedBy}
                    />
                    <InfoItem
                      icon={CalendarDays}
                      label="Uploaded At"
                      value={formatDateTime(selectedReport.uploadedAt)}
                    />
                  </div>

                  <div>
                    <h5 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <CheckCircle2 size={17} className="text-emerald-600" />
                      Result Summary
                    </h5>
                    <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-7 text-slate-700">
                      {selectedReport.resultSummary ||
                        "No result summary provided."}
                    </p>
                  </div>

                  <div>
                    <h5 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <ClipboardList size={17} className="text-teal-600" />
                      Findings
                    </h5>
                    <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                      {selectedReport.findings || "No findings provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                    <ShieldCheck size={16} className="shrink-0" />
                    This is an administrator view. Report download is disabled.
                  </div>
                </div>
              )
            )}

            {!reportLoading && (
              <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASSIGN STAFF MODAL */}

      {assignOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Assign Laboratory Staff
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Assign a staff member to order #{assignOrder.id}
                </p>
              </div>

              <button
                onClick={closeAssignDialog}
                disabled={assignLoading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Patient</p>

                <p className="mt-1 font-semibold text-slate-800">
                  {assignOrder.patientName}
                </p>

                <p className="mt-3 text-xs text-slate-400">Laboratory Test</p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {assignOrder.testName}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Laboratory Staff
                </label>

                <div className="relative">
                  <UserCheck
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={selectedStaffId}
                    onChange={(event) => setSelectedStaffId(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value="">Choose laboratory staff</option>

                    {labStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName} ({staff.email})
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {labStaff.length === 0 && (
                  <p className="mt-2 text-xs text-rose-600">
                    No active laboratory staff found.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeAssignDialog}
                  disabled={assignLoading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssignStaff}
                  disabled={
                    assignLoading || !selectedStaffId || labStaff.length === 0
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assignLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Assign Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLaboratory;
