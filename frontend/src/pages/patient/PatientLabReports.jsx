import { useEffect, useMemo, useState } from "react";
import {
  FlaskConical,
  Search,
  CalendarDays,
  UserRound,
  FileText,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const PatientLabReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    void fetchLabOrders();
  }, []);

  async function fetchLabOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/lab-orders/patient");
      setOrders(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load laboratory orders.",
      );
    } finally {
      setLoading(false);
    }
  }

  const completedCount = useMemo(
    () => orders.filter((order) => order.status === "COMPLETED").length,
    [orders],
  );

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED",
      ).length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = [
        order.testName,
        order.category,
        order.doctorName,
        order.status,
        order.assignedLabStaffName,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value));

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "SAMPLE_COLLECTED":
        return "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
      default:
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    }
  };

  const viewReport = async (order) => {
    setSelectedOrder(order);
    setSelectedReport(null);
    setReportError("");

    try {
      setReportLoading(true);

      const response = await api.get(`/lab-orders/patient/${order.id}/report`);

      setSelectedReport(response.data);
    } catch (err) {
      setReportError(
        err.response?.data?.message ||
          "The laboratory report is not available yet.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  const closeReport = () => {
    setSelectedOrder(null);
    setSelectedReport(null);
    setReportError("");
  };

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
              <span>Diagnostics & Pathology</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Lab Reports
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              Track your laboratory tests and access your medical test reports.
            </p>
          </div>

          <button
            onClick={() => void fetchLabOrders()}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Lab Orders"
          value={orders.length}
          icon={<ClipboardList size={24} />}
          color="blue"
          description="Requested diagnostic tests"
        />

        <StatCard
          title="Completed Tests"
          value={completedCount}
          icon={<CheckCircle2 size={24} />}
          color="green"
          description="Reports ready to view"
        />

        <StatCard
          title="Pending Tests"
          value={pendingCount}
          icon={<Clock size={24} />}
          color="orange"
          description="In sample or lab processing"
        />
      </div>

      {/* Search and Filter */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3.5 sm:flex-row">
          <div className="group relative flex flex-1 items-center">
            <Search
              size={19}
              className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-teal-600"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search test, category or doctor..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 py-3.5 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15 sm:min-w-48"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/95 py-20 shadow-sm backdrop-blur-xl">
          <Loader2 size={34} className="animate-spin text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500 animate-pulse">
            Loading laboratory orders...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/95 p-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-xl">
          <AlertCircle size={20} className="shrink-0 text-red-600" />
          <span>{error}</span>

          <button
            onClick={() => void fetchLabOrders()}
            className="ml-auto rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Lab Orders */}
      {!loading && !error && (
        <>
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/95 px-6 py-16 text-center shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FlaskConical size={32} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-800">
                {search || statusFilter !== "ALL"
                  ? "No matching lab orders found"
                  : "No laboratory orders available"}
              </h3>

              <p className="mt-1.5 text-sm text-slate-400">
                Your doctor-requested laboratory tests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-2xs transition-transform duration-300 group-hover:scale-105">
                          <FlaskConical size={22} />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {order.testName || "Laboratory Test"}
                          </h3>

                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            Order #{order.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {order.status?.replaceAll("_", " ") || "PENDING"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
                      <InfoRow
                        icon={<ClipboardList size={17} />}
                        label="Category"
                        value={order.category}
                      />

                      <InfoRow
                        icon={<UserRound size={17} />}
                        label="Ordered By"
                        value={order.doctorName}
                      />

                      <InfoRow
                        icon={<CalendarDays size={17} />}
                        label="Order Date"
                        value={formatDate(order.orderedAt)}
                      />

                      {order.completedAt && (
                        <InfoRow
                          icon={<CheckCircle2 size={17} />}
                          label="Completed On"
                          value={formatDate(order.completedAt)}
                        />
                      )}
                    </div>

                    {order.notes && (
                      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          Notes
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => void viewReport(order)}
                    disabled={order.status !== "COMPLETED"}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${
                      order.status === "COMPLETED"
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:shadow-lg"
                        : "cursor-not-allowed border border-slate-200 bg-slate-100/80 text-slate-400"
                    }`}
                  >
                    <Eye size={17} />
                    <span>
                      {order.status === "COMPLETED"
                        ? "View Lab Report"
                        : "Report Not Available"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Report Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeReport}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-linear-to-r from-teal-800 to-emerald-700 px-6 py-6 text-white sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold">Laboratory Report</h2>

                  <p className="mt-1 text-xs font-semibold tracking-wider text-teal-100 uppercase">
                    Order #{selectedOrder.id}
                  </p>
                </div>

                <button
                  onClick={closeReport}
                  className="rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              {reportLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-teal-600">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="mt-2.5 text-sm font-medium text-slate-500">
                    Fetching lab report...
                  </p>
                </div>
              )}

              {!reportLoading && reportError && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm font-medium text-amber-800">
                  <AlertCircle size={20} className="shrink-0 text-amber-600" />
                  <span>{reportError}</span>
                </div>
              )}

              {!reportLoading && selectedReport && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-teal-200/80 bg-teal-50/70 p-4">
                    <p className="text-xs font-bold tracking-wider text-teal-700 uppercase">
                      TEST NAME
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                      {selectedReport.testName || selectedOrder.testName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <InfoRow
                      icon={<UserRound size={17} />}
                      label="Patient"
                      value={selectedReport.patientName}
                    />

                    <InfoRow
                      icon={<UserRound size={17} />}
                      label="Doctor"
                      value={selectedReport.doctorName}
                    />

                    <InfoRow
                      icon={<CalendarDays size={17} />}
                      label="Report Uploaded"
                      value={formatDateTime(selectedReport.uploadedAt)}
                    />

                    <InfoRow
                      icon={<UserRound size={17} />}
                      label="Uploaded By"
                      value={selectedReport.uploadedBy}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Result Summary
                    </h3>

                    <p className="mt-1.5 text-sm font-medium whitespace-pre-wrap text-slate-700">
                      {selectedReport.resultSummary || "No summary provided."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Findings
                    </h3>

                    <p className="mt-1.5 text-sm font-medium whitespace-pre-wrap text-slate-700">
                      {selectedReport.findings || "No findings provided."}
                    </p>
                  </div>

                  {selectedReport.reportFileUrl && (
                    <a
                      href={selectedReport.reportFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
                    >
                      <FileText size={18} />
                      <span>Open Report File</span>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={closeReport}
                className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, description }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-500/10",
    green: "bg-emerald-50 text-emerald-600 shadow-emerald-500/10",
    orange: "bg-amber-50 text-amber-600 shadow-amber-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {title}
          </p>

          <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </h2>

          {description && (
            <p className="mt-1 text-xs font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 rounded-lg bg-slate-100/80 p-1.5 text-teal-600">
      {icon}
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-slate-800">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export default PatientLabReports;
