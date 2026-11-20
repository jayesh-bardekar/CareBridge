import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  Pill,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Mail,
  User,
  Phone,
  MapPin,
  Filter,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Building2,
  Clock,
  Ban,
  CalendarDays,
  BadgeCheck,
  CreditCard,
  UserCheck,
  Power,
} from "lucide-react";

import api from "../../services/api";

const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  SUSPENDED: "bg-slate-100 text-slate-700",
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

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [statusDialog, setStatusDialog] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // FETCH PHARMACIES

  const fetchPharmacies = useCallback(
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

        const response = await api.get("/admin/pharmacies", { params });

        setPharmacies(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load pharmacies. Please try again.",
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
      fetchPharmacies();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchPharmacies]);

  // STATISTICS

  const statistics = useMemo(
    () => ({
      total: pharmacies.length,

      pending: pharmacies.filter((pharmacy) => pharmacy.status === "PENDING")
        .length,

      approved: pharmacies.filter((pharmacy) => pharmacy.status === "APPROVED")
        .length,

      suspended: pharmacies.filter(
        (pharmacy) => pharmacy.status === "SUSPENDED",
      ).length,
    }),
    [pharmacies],
  );

  // VIEW PHARMACY DETAILS

  const handleViewDetails = async (pharmacyId) => {
    try {
      setDetailsLoading(true);
      setSelectedPharmacy(null);
      setError("");

      const response = await api.get(`/admin/pharmacies/${pharmacyId}`);

      setSelectedPharmacy(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load pharmacy details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // OPEN STATUS DIALOG

  const handleOpenStatusDialog = (pharmacy, status) => {
    setStatusDialog(pharmacy);
    setNewStatus(status);
    setError("");
  };

  // UPDATE PHARMACY STATUS

  const handleUpdateStatus = async () => {
    if (!statusDialog || !newStatus) return;

    try {
      setStatusLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/pharmacies/${statusDialog.id}/status`,
        {
          status: newStatus,
        },
      );

      setPharmacies((previous) =>
        previous.map((pharmacy) =>
          pharmacy.id === statusDialog.id ? response.data : pharmacy,
        ),
      );

      if (selectedPharmacy?.id === statusDialog.id) {
        setSelectedPharmacy(response.data);
      }

      setSuccess(
        `${response.data.pharmacyName} status updated to ${formatLabel(newStatus)} successfully.`,
      );

      setStatusDialog(null);
      setNewStatus("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to update pharmacy status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // AVAILABLE STATUS ACTIONS

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return ["APPROVED", "REJECTED", "SUSPENDED"];

      case "APPROVED":
        return ["REJECTED", "SUSPENDED"];

      case "REJECTED":
        return ["APPROVED", "SUSPENDED"];

      case "SUSPENDED":
        return ["APPROVED", "REJECTED"];

      default:
        return [];
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
            Pharmacy Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Pharmacy Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review pharmacy registrations and manage pharmacy approvals.
          </p>
        </div>

        <button
          onClick={() => fetchPharmacies(true)}
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
          title="Total Pharmacies"
          value={statistics.total}
          icon={Building2}
          color="bg-teal-50 text-teal-600"
          description="Pharmacies matching current filters"
        />

        <StatCard
          title="Pending Approval"
          value={statistics.pending}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          description="Awaiting administrator review"
        />

        <StatCard
          title="Approved"
          value={statistics.approved}
          icon={BadgeCheck}
          color="bg-emerald-50 text-emerald-600"
          description="Approved pharmacy registrations"
        />

        <StatCard
          title="Suspended"
          value={statistics.suspended}
          icon={Ban}
          color="bg-rose-50 text-rose-600"
          description="Currently suspended pharmacies"
        />
      </div>

      {/* PHARMACY TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* SEARCH AND FILTERS */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Registered Pharmacies
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search pharmacies and manage their registration status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            {/* SEARCH */}

            <div className="relative sm:col-span-2 xl:w-80">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search pharmacy, license, pharmacist..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            {/* STATUS FILTER */}

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-48"
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
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
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
                  Pharmacy
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pharmacist
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  License
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location
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
                      Loading pharmacies...
                    </p>
                  </td>
                </tr>
              ) : pharmacies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Building2 size={35} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-600">
                      No pharmacies found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                pharmacies.map((pharmacy) => (
                  <tr
                    key={pharmacy.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {/* PHARMACY */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 text-white">
                          <Pill size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {pharmacy.pharmacyName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Pharmacy #{pharmacy.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PHARMACIST */}

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {pharmacy.pharmacistName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {pharmacy.pharmacistEmail}
                      </p>
                    </td>

                    {/* LICENSE */}

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {pharmacy.licenseNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        License Number
                      </p>
                    </td>

                    {/* LOCATION */}

                    <td className="px-6 py-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <MapPin size={14} className="text-teal-600" />
                        {pharmacy.city}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {pharmacy.state}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[pharmacy.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(pharmacy.status)}
                      </span>

                      {!pharmacy.pharmacistEnabled && (
                        <p className="mt-1 text-xs font-medium text-rose-600">
                          Pharmacist inactive
                        </p>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(pharmacy.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Manage Status"
                          onClick={() =>
                            handleOpenStatusDialog(pharmacy, pharmacy.status)
                          }
                          className="rounded-lg p-2 text-teal-600 transition hover:bg-teal-50"
                        >
                          <Power size={17} />
                        </button>
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
                {pharmacies.length}
              </span>{" "}
              pharmacies
            </p>

            <p className="text-xs text-slate-400">
              CareBridge Pharmacy Administration
            </p>
          </div>
        )}
      </div>

      {/* PHARMACY DETAILS MODAL */}

      {(selectedPharmacy || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Pharmacy Details
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Complete pharmacy and pharmacist information
                </p>
              </div>

              <button
                onClick={() => setSelectedPharmacy(null)}
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
                  Loading pharmacy details...
                </p>
              </div>
            ) : (
              selectedPharmacy && (
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 text-white">
                      <Pill size={30} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-bold text-slate-800">
                        {selectedPharmacy.pharmacyName}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Pharmacy #{selectedPharmacy.id}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[selectedPharmacy.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(selectedPharmacy.status)}
                      </span>
                    </div>
                  </div>

                  {/* PHARMACY INFORMATION */}

                  <div>
                    <h5 className="mb-3 text-sm font-bold text-slate-700">
                      Pharmacy Information
                    </h5>

                    <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                      <InfoItem
                        icon={Building2}
                        label="Pharmacy Name"
                        value={selectedPharmacy.pharmacyName}
                      />

                      <InfoItem
                        icon={CreditCard}
                        label="License Number"
                        value={selectedPharmacy.licenseNumber}
                      />

                      <InfoItem
                        icon={Phone}
                        label="Phone Number"
                        value={selectedPharmacy.phoneNumber}
                      />

                      <InfoItem
                        icon={Mail}
                        label="Contact Email"
                        value={selectedPharmacy.contactEmail}
                      />

                      <InfoItem
                        icon={MapPin}
                        label="Address"
                        value={selectedPharmacy.address}
                      />

                      <InfoItem
                        icon={MapPin}
                        label="City"
                        value={selectedPharmacy.city}
                      />

                      <InfoItem
                        icon={MapPin}
                        label="State"
                        value={selectedPharmacy.state}
                      />

                      <InfoItem
                        icon={MapPin}
                        label="Pincode"
                        value={selectedPharmacy.pincode}
                      />
                    </div>
                  </div>

                  {/* PHARMACIST INFORMATION */}

                  <div>
                    <h5 className="mb-3 text-sm font-bold text-slate-700">
                      Pharmacist Information
                    </h5>

                    <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                      <InfoItem
                        icon={User}
                        label="Pharmacist Name"
                        value={selectedPharmacy.pharmacistName}
                      />

                      <InfoItem
                        icon={Mail}
                        label="Pharmacist Email"
                        value={selectedPharmacy.pharmacistEmail}
                      />

                      <InfoItem
                        icon={Phone}
                        label="Pharmacist Phone"
                        value={selectedPharmacy.pharmacistPhone}
                      />

                      <InfoItem
                        icon={UserCheck}
                        label="Account Status"
                        value={
                          selectedPharmacy.pharmacistEnabled
                            ? "Active"
                            : "Inactive"
                        }
                      />
                    </div>
                  </div>

                  {/* REGISTRATION INFORMATION */}

                  <div>
                    <h5 className="mb-3 text-sm font-bold text-slate-700">
                      Registration Information
                    </h5>

                    <div className="grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                      <InfoItem
                        icon={CalendarDays}
                        label="Registered At"
                        value={formatDateTime(selectedPharmacy.createdAt)}
                      />

                      <InfoItem
                        icon={CalendarDays}
                        label="Last Updated"
                        value={formatDateTime(selectedPharmacy.updatedAt)}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}

      {statusDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Update Pharmacy Status
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage pharmacy approval and availability
                </p>
              </div>

              <button
                onClick={() => {
                  if (!statusLoading) {
                    setStatusDialog(null);
                    setNewStatus("");
                  }
                }}
                disabled={statusLoading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Pharmacy</p>

                <p className="mt-1 font-semibold text-slate-800">
                  {statusDialog.pharmacyName}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  License: {statusDialog.licenseNumber}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  Current Status:
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${
                      statusStyles[statusDialog.status]
                    }`}
                  >
                    {formatLabel(statusDialog.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select New Status
                </label>

                <div className="relative">
                  <Filter
                    size={17}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={newStatus}
                    onChange={(event) => setNewStatus(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-10 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value={statusDialog.status}>
                      Keep Current Status
                    </option>

                    {getAvailableStatuses(statusDialog.status).map((status) => (
                      <option key={status} value={status}>
                        {formatLabel(status)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setStatusDialog(null);
                    setNewStatus("");
                  }}
                  disabled={statusLoading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateStatus}
                  disabled={
                    statusLoading ||
                    !newStatus ||
                    newStatus === statusDialog.status
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPharmacies;
