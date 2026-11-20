import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Eye,
  X,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  UserRound,
  ClipboardList,
} from "lucide-react";

import api from "../../services/api";

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

const LabReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const [resultSummary, setResultSummary] = useState("");
  const [findings, setFindings] = useState("");
  const [reportFileUrl, setReportFileUrl] = useState("");

  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    const response = await api.get("/lab-orders/staff");
    return Array.isArray(response.data) ? response.data : [];
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await loadOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load laboratory orders:", err);

      setError(
        err.response?.data?.message || "Unable to load laboratory orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    let active = true;

    loadOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        console.error("Failed to load laboratory orders:", err);

        if (active) {
          setError(
            err.response?.data?.message || "Unable to load laboratory orders.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      order.testName?.toLowerCase().includes(searchText) ||
      order.patientName?.toLowerCase().includes(searchText) ||
      order.doctorName?.toLowerCase().includes(searchText) ||
      String(order.id).includes(searchText);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "PENDING" && order.status === "IN_PROGRESS") ||
      (filter === "COMPLETED" && order.status === "COMPLETED");

    return matchesSearch && matchesFilter;
  });

  const openOrder = (order) => {
    setSelectedOrder(order);
    setSelectedReport(null);

    setResultSummary("");
    setFindings("");
    setReportFileUrl("");

    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setSelectedReport(null);
    setError("");
    setSuccess("");
  };

  const uploadReport = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/lab-orders/${selectedOrder.id}/report`,
        {
          resultSummary,
          findings,
          reportFileUrl,
        },
      );

      setSelectedReport(response.data);
      setSuccess("Laboratory report uploaded successfully.");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: "COMPLETED" }
            : order,
        ),
      );

      setSelectedOrder((prev) => ({
        ...prev,
        status: "COMPLETED",
      }));

      setResultSummary("");
      setFindings("");
      setReportFileUrl("");
    } catch (err) {
      console.error("Failed to upload report:", err);

      setError(
        err.response?.data?.message || "Unable to upload laboratory report.",
      );
    } finally {
      setUploading(false);
    }
  };

  const viewReport = async (order) => {
    try {
      setViewing(true);
      setError("");
      setSuccess("");

      const response = await api.get(`/lab-orders/staff/${order.id}/report`);

      setSelectedOrder(order);
      setSelectedReport(response.data);
    } catch (err) {
      console.error("Failed to load report:", err);

      setError(
        err.response?.data?.message || "Unable to load laboratory report.",
      );
    } finally {
      setViewing(false);
    }
  };

  const statCards = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Reports Pending",
      value: orders.filter((o) => o.status === "IN_PROGRESS").length,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Reports Completed",
      value: orders.filter((o) => o.status === "COMPLETED").length,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-teal-600">
            Laboratory Staff Portal
          </p>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Lab Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Upload test results and manage completed laboratory reports.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && !selectedOrder && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-800">
            Laboratory Reports
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage pending and completed test reports.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 p-5 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, test, doctor or order ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="ALL">All Reports</option>
            <option value="PENDING">Pending Reports</option>
            <option value="COMPLETED">Completed Reports</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Test</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Order Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <FileText
                      size={35}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700">
                      No laboratory reports found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Assigned laboratory orders will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {order.testName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.category || "General"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">
                        {order.patientName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.patientEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(order.orderedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          order.status === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : order.status === "IN_PROGRESS"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.status?.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {order.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() => openOrder(order)}
                          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
                        >
                          <Upload size={15} />
                          Upload Report
                        </button>
                      ) : order.status === "COMPLETED" ? (
                        <button
                          onClick={() => viewReport(order)}
                          disabled={viewing}
                          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
                        >
                          <Eye size={15} />
                          View Report
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Awaiting processing
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </section>

      {/* Report Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedReport
                    ? "Laboratory Report"
                    : "Upload Laboratory Report"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Order #{selectedOrder.id} · {selectedOrder.testName}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              {/* Patient Information */}
              <div className="rounded-xl bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-teal-700">
                  <UserRound size={18} />
                  <h3 className="font-semibold">Patient Information</h3>
                </div>

                <p className="mt-2 font-semibold text-slate-800">
                  {selectedOrder.patientName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.patientEmail}
                </p>
              </div>

              {selectedReport ? (
                /* View Report */
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 font-bold text-slate-800">
                      Result Summary
                    </h3>

                    <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedReport.resultSummary}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-bold text-slate-800">Findings</h3>

                    <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedReport.findings || "No additional findings."}
                    </p>
                  </div>

                  {selectedReport.reportFileUrl && (
                    <a
                      href={selectedReport.reportFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                      <ExternalLink size={17} />
                      Open Report File
                    </a>
                  )}

                  <div className="rounded-xl border border-slate-100 p-4 text-sm">
                    <p className="text-slate-500">Uploaded By</p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedReport.uploadedBy}
                    </p>

                    <p className="mt-3 text-slate-500">Uploaded At</p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDateTime(selectedReport.uploadedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                /* Upload Report Form */
                <form onSubmit={uploadReport} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Result Summary <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={resultSummary}
                      onChange={(e) => setResultSummary(e.target.value)}
                      required
                      maxLength={2000}
                      rows={4}
                      placeholder="Enter laboratory test result summary..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {resultSummary.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Findings
                    </label>

                    <textarea
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      maxLength={3000}
                      rows={4}
                      placeholder="Enter detailed findings (optional)..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {findings.length}/3000 characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Report File URL
                    </label>

                    <input
                      type="url"
                      value={reportFileUrl}
                      onChange={(e) => setReportFileUrl(e.target.value)}
                      maxLength={1000}
                      placeholder="https://example.com/report.pdf"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Optional: Enter the URL of the uploaded report file.
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  {success && (
                    <p className="text-sm text-green-600">{success}</p>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !resultSummary.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}

                    {uploading ? "Uploading..." : "Upload Report"}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    Uploading the report automatically marks this order as
                    completed.
                  </p>
                </form>
              )}

              {error && selectedReport && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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

export default LabReports;
