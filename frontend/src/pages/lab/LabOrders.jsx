import { useCallback, useEffect, useState } from "react";
import {
  FlaskConical,
  Search,
  RefreshCw,
  Loader2,
  UserRound,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Save,
  ClipboardList,
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
  ORDERED: "bg-blue-50 text-blue-700",
  ASSIGNED: "bg-purple-50 text-purple-700",
  SAMPLE_COLLECTED: "bg-cyan-50 text-cyan-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

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

const formatStatus = (status) => status?.replaceAll("_", " ") || "Unknown";

const LabOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
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

      setOrders(await loadOrders());
    } catch (err) {
      console.error("Failed to load lab orders:", err);

      setError(
        err.response?.data?.message || "Unable to load laboratory orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    let ignore = false;

    loadOrders()
      .then((data) => {
        if (!ignore) setOrders(data);
      })
      .catch((err) => {
        console.error("Failed to load lab orders:", err);
        if (!ignore) {
          setError(
            err.response?.data?.message || "Unable to load laboratory orders.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      order.testName?.toLowerCase().includes(searchText) ||
      order.patientName?.toLowerCase().includes(searchText) ||
      order.doctorName?.toLowerCase().includes(searchText) ||
      order.category?.toLowerCase().includes(searchText) ||
      String(order.id).includes(searchText);

    const matchesFilter = filter === "ALL" || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    if (newStatus === selectedOrder.status) {
      setError("Please select a different status.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/lab-orders/${selectedOrder.id}/status`,
        { status: newStatus },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? response.data : order,
        ),
      );

      setSelectedOrder(response.data);
      setNewStatus(response.data.status);

      setSuccess("Laboratory order status updated successfully.");
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update order status. Please check the allowed status transition.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setError("");
    setSuccess("");
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setError("");
    setSuccess("");
  };

  const statCards = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Assigned",
      value: orders.filter((o) => o.status === "ASSIGNED").length,
      icon: FlaskConical,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "In Progress",
      value: orders.filter((o) => o.status === "IN_PROGRESS").length,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Completed",
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
            Lab Orders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage assigned laboratory tests and update their progress.
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

      {/* Error and Success Messages */}
      {error && !selectedOrder && (
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Orders Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-800">
            Assigned Laboratory Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your assigned patient tests.
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
            <option value="ALL">All Statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Test Details</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Order Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <FlaskConical
                      size={35}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700">
                      No laboratory orders found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Assigned orders will appear here.
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
                      {order.doctorName || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(order.orderedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                          statusStyles[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetails(order)}
                        className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                      >
                        <Eye size={15} />
                        View
                      </button>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Laboratory Order Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Order #{selectedOrder.id}
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Test Information */}
              <div className="rounded-xl bg-teal-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-3 text-teal-600">
                    <FlaskConical size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-teal-700">
                      Laboratory Test
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-800">
                      {selectedOrder.testName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOrder.category || "General"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient and Doctor */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-3 flex items-center gap-2 text-blue-600">
                    <UserRound size={18} />
                    <h3 className="font-semibold">Patient Information</h3>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedOrder.patientName}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedOrder.patientEmail}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-3 flex items-center gap-2 text-purple-600">
                    <UserRound size={18} />
                    <h3 className="font-semibold">Doctor Information</h3>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedOrder.doctorName || "N/A"}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedOrder.doctorEmail || "N/A"}
                  </p>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="mb-3 font-bold text-slate-800">
                  Order Information
                </h3>

                <div className="space-y-3 rounded-xl border border-slate-100 p-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Ordered At</span>
                    <span className="text-right font-medium text-slate-700">
                      {formatDateTime(selectedOrder.orderedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Assigned At</span>
                    <span className="text-right font-medium text-slate-700">
                      {formatDateTime(selectedOrder.assignedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Sample Collected</span>
                    <span className="text-right font-medium text-slate-700">
                      {formatDateTime(selectedOrder.sampleCollectedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Completed At</span>
                    <span className="text-right font-medium text-slate-700">
                      {formatDateTime(selectedOrder.completedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-500">Current Status</span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[selectedOrder.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="mb-2 font-bold text-slate-800">
                    Doctor's Notes
                  </h3>

                  <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Update Status */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                <h3 className="mb-3 font-bold text-slate-800">
                  Update Order Status
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    disabled={
                      selectedOrder.status === "COMPLETED" ||
                      selectedOrder.status === "CANCELLED"
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 disabled:bg-slate-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={updateStatus}
                    disabled={
                      updating ||
                      newStatus === selectedOrder.status ||
                      selectedOrder.status === "COMPLETED" ||
                      selectedOrder.status === "CANCELLED"
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    Update Status
                  </button>
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                {success && (
                  <p className="mt-3 text-sm text-green-600">{success}</p>
                )}

                {(selectedOrder.status === "COMPLETED" ||
                  selectedOrder.status === "CANCELLED") && (
                  <p className="mt-3 text-xs text-slate-500">
                    This order has reached a final status and cannot be updated
                    here.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                onClick={closeDetails}
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

export default LabOrders;
