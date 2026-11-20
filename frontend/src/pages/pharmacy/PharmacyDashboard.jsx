import { useCallback, useEffect, useState } from "react";
import {
  Pill,
  Package,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Store,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const PharmacyDashboard = () => {
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        api.get("/pharmacy/profile"),
        api.get("/inventory/medicines"),
        api.get("/inventory/medicines/low-stock"),
        api.get("/prescriptions/pharmacist"),
      ]);

      const [
        pharmacyResult,
        medicinesResult,
        lowStockResult,
        prescriptionsResult,
      ] = results;

      if (pharmacyResult.status === "fulfilled") {
        setPharmacy(pharmacyResult.value.data);
      }

      if (medicinesResult.status === "fulfilled") {
        setMedicines(
          Array.isArray(medicinesResult.value.data)
            ? medicinesResult.value.data
            : [],
        );
      }

      if (lowStockResult.status === "fulfilled") {
        setLowStockMedicines(
          Array.isArray(lowStockResult.value.data)
            ? lowStockResult.value.data
            : [],
        );
      }

      if (prescriptionsResult.status === "fulfilled") {
        setPendingPrescriptions(
          Array.isArray(prescriptionsResult.value.data)
            ? prescriptionsResult.value.data
            : [],
        );
      }

      if (results.every((result) => result.status === "rejected")) {
        setError("Unable to load dashboard data. Please try again.");
      }
    } catch {
      setError("Something went wrong while loading the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(fetchDashboard, 0);
    return () => clearTimeout(timerId);
  }, [fetchDashboard]);

  const activeMedicines = medicines.filter((medicine) => medicine.active);

  const stats = [
    {
      title: "Total Medicines",
      value: medicines.length,
      icon: Package,
      color: "blue",
    },
    {
      title: "Active Medicines",
      value: activeMedicines.length,
      icon: Pill,
      color: "teal",
    },
    {
      title: "Low Stock Medicines",
      value: lowStockMedicines.length,
      icon: AlertTriangle,
      color: "orange",
    },
    {
      title: "Pending Prescriptions",
      value: pendingPrescriptions.length,
      icon: ClipboardList,
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const recentMedicines = [...medicines]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto mb-3 animate-spin text-teal-600"
          />
          <p className="text-sm text-gray-500">Loading pharmacy dashboard...</p>
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
            PHARMACY MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Pharmacist Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage medicines, prescriptions and pharmacy stock.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
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

      {/* Welcome Banner */}
      <div className="overflow-hidden rounded-2xl bg-linear-to-r from-teal-600 to-emerald-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-teal-100">
              Pharmacy Overview
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              {pharmacy?.pharmacyName || "Welcome to Your Pharmacy"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50">
              Monitor medicine inventory, manage prescriptions and keep your
              pharmacy operations organized.
            </p>

            <button
              onClick={() => navigate("/pharmacy/inventory")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              Manage Inventory
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="hidden rounded-2xl bg-white/15 p-6 sm:block">
            <Store size={65} strokeWidth={1.3} />
          </div>
        </div>
      </div>

      {/* Pharmacy Profile Summary */}
      {pharmacy && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <Store size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Pharmacy Information</h2>
              <p className="text-xs text-gray-500">
                Your registered pharmacy profile
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Pharmacy Name</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {pharmacy.pharmacyName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {pharmacy.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Approval Status</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {pharmacy.status || pharmacy.approvalStatus || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Pharmacy Overview</h2>

          <p className="mt-1 text-sm text-gray-500">
            Current inventory and prescription summary.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-teal-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                  <Activity size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Active Medicines</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeMedicines.length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-orange-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-700">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Low Stock Medicines</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {lowStockMedicines.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>

          <p className="mt-1 text-sm text-gray-500">
            Access pharmacy modules quickly.
          </p>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => navigate("/pharmacy/prescriptions")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
            >
              <span className="text-sm font-semibold text-gray-800">
                Verify Prescriptions
              </span>
              <ArrowRight size={17} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/pharmacy/inventory")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
            >
              <span className="text-sm font-semibold text-gray-800">
                Manage Inventory
              </span>
              <ArrowRight size={17} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/pharmacy/notifications")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
            >
              <span className="text-sm font-semibold text-gray-800">
                View Notifications
              </span>
              <ArrowRight size={17} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Medicines */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Low Stock Medicines</h2>
            <p className="mt-1 text-xs text-gray-500">
              Medicines requiring stock attention.
            </p>
          </div>

          <button
            onClick={() => navigate("/pharmacy/inventory")}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View Inventory
          </button>
        </div>

        {lowStockMedicines.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CheckCircle size={30} className="mx-auto mb-3 text-green-500" />
            <p className="font-semibold text-gray-800">
              No Low Stock Medicines
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Your medicine stock is looking good.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Medicine</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Available Stock</th>
                  <th className="px-5 py-4 font-semibold">Minimum Stock</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {medicine.medicineName}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {medicine.category?.replaceAll("_", " ")}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-orange-600">
                      {medicine.quantity}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {medicine.minimumStockLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Medicines */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Recent Medicines</h2>
            <p className="mt-1 text-xs text-gray-500">
              Recently added inventory items.
            </p>
          </div>

          <button
            onClick={() => navigate("/pharmacy/inventory")}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View All
          </button>
        </div>

        {recentMedicines.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Package size={30} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-800">
              No Medicines Available
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Added medicines will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Medicine</th>
                  <th className="px-5 py-4 font-semibold">Batch Number</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Expiry Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {medicine.medicineName}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {medicine.batchNumber}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      ₹{medicine.price}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {medicine.quantity}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(medicine.expiryDate)}
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

export default PharmacyDashboard;
