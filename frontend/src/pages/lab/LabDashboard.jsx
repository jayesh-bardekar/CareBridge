import { useCallback, useEffect, useState } from "react";
import {
  FlaskConical,
  ClipboardList,
  TestTube,
  Activity,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const LabDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    const response = await api.get("/lab-orders/staff");
    return Array.isArray(response.data) ? response.data : [];
  }, []);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        if (active) setOrders(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load laboratory dashboard.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load laboratory dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const stats = [
    {
      title: "Total Lab Orders",
      value: orders.length,
      icon: ClipboardList,
      color: "blue",
    },
    {
      title: "Assigned Orders",
      value: orders.filter((o) => o.status === "ASSIGNED").length,
      icon: TestTube,
      color: "indigo",
    },
    {
      title: "Samples Collected",
      value: orders.filter((o) => o.status === "SAMPLE_COLLECTED").length,
      icon: FlaskConical,
      color: "purple",
    },
    {
      title: "In Progress",
      value: orders.filter((o) => o.status === "IN_PROGRESS").length,
      icon: Activity,
      color: "orange",
    },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === "COMPLETED").length,
      icon: CheckCircle,
      color: "green",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0))
    .slice(0, 5);

  const todaysOrders = orders.filter(
    (order) => order.orderedAt?.split("T")[0] === today,
  ).length;

  const getStatusStyle = (status) => {
    const styles = {
      ORDERED: "bg-blue-50 text-blue-700",
      ASSIGNED: "bg-indigo-50 text-indigo-700",
      SAMPLE_COLLECTED: "bg-purple-50 text-purple-700",
      IN_PROGRESS: "bg-orange-50 text-orange-700",
      COMPLETED: "bg-green-50 text-green-700",
      CANCELLED: "bg-red-50 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto mb-3 animate-spin text-teal-600"
          />
          <p className="text-sm text-gray-500">
            Loading laboratory dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-semibold text-teal-600">
            LABORATORY MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Lab Staff Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor laboratory orders, samples and reports.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh Dashboard
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Welcome Card */}
      <div className="overflow-hidden rounded-2xl bg-linear-to-r from-teal-600 to-cyan-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-teal-100">
              Laboratory Overview
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Manage Your Lab Activities
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50">
              Track assigned tests, monitor sample processing and manage patient
              laboratory reports from one place.
            </p>

            <button
              onClick={() => navigate("/lab/orders")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              View Lab Orders
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="hidden rounded-2xl bg-white/15 p-6 sm:block">
            <FlaskConical size={65} strokeWidth={1.3} />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${colorClasses[stat.color]}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">{stat.title}</p>

              <h3 className="mt-1 text-3xl font-bold text-gray-900">
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Overview and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Overview */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Today's Overview</h2>

          <p className="mt-1 text-sm text-gray-500">
            Summary of your laboratory activities.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-teal-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                  <Clock size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Today's Orders</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {todaysOrders}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-700">
                  <CheckCircle size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Completed Reports</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "COMPLETED").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>

          <p className="mt-1 text-sm text-gray-500">
            Access laboratory modules quickly.
          </p>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => navigate("/lab/orders")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                  <ClipboardList size={19} />
                </div>

                <span className="text-sm font-semibold text-gray-800">
                  Manage Lab Orders
                </span>
              </div>

              <ArrowRight size={17} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/lab/reports")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <FileText size={19} />
                </div>

                <span className="text-sm font-semibold text-gray-800">
                  Manage Lab Reports
                </span>
              </div>

              <ArrowRight size={17} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-gray-900">Recent Lab Orders</h2>
            <p className="mt-1 text-xs text-gray-500">
              Latest laboratory orders assigned to you.
            </p>
          </div>

          <button
            onClick={() => navigate("/lab/orders")}
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <FlaskConical size={35} className="mx-auto mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-800">
              No Lab Orders Available
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Assigned laboratory orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-187.5 text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Order ID</th>
                  <th className="px-5 py-4 font-semibold">Patient</th>
                  <th className="px-5 py-4 font-semibold">Test Name</th>
                  <th className="px-5 py-4 font-semibold">Order Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {order.patientName || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {order.testName || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.orderedAt
                        ? new Date(order.orderedAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        {order.status?.replaceAll("_", " ")}
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

export default LabDashboard;
