import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  UserCheck,
  UserX,
  Eye,
  CheckCircle2,
  Trash2,
  X,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Droplets,
  Heart,
  AlertCircle,
  LoaderCircle,
  Filter,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const genders = ["Male", "Female", "Other"];

const formatDate = (date) => {
  if (!date) return "Not provided";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "P";

function StatCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            {value}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          <Icon size={25} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50">
      <div className="mt-0.5 rounded-lg bg-teal-50 p-2 text-teal-600 shadow-2xs">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [actionPatient, setActionPatient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/patients", {
        params: {
          keyword: search.trim() || undefined,
          gender: genderFilter || undefined,
          bloodGroup: bloodGroupFilter || undefined,
        },
      });

      setPatients(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load patients. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, genderFilter, bloodGroupFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchPatients]);

  // Statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.enabled).length;
    const inactive = patients.filter((p) => !p.enabled).length;

    return { total, active, inactive };
  }, [patients]);

  // View patient details
  const handleViewDetails = async (patient) => {
    try {
      const response = await api.get(`/admin/patients/${patient.id}`);
      setSelectedPatient(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load patient details.",
      );
    }
  };

  // Activate, deactivate or delete patient
  const handleConfirmAction = async () => {
    if (!actionPatient) return;

    try {
      setActionLoading(true);

      const { patient, type } = actionPatient;

      if (type === "DELETE") {
        await api.delete(`/admin/patients/${patient.id}`);

        setPatients((previous) =>
          previous.map((item) =>
            item.id === patient.id ? { ...item, enabled: false } : item,
          ),
        );

        setSelectedPatient((previous) =>
          previous?.id === patient.id
            ? { ...previous, enabled: false }
            : previous,
        );
      } else {
        const enabled = type === "ACTIVATE";

        const response = await api.patch(
          `/admin/patients/${patient.id}/status`,
          { enabled },
        );

        setPatients((previous) =>
          previous.map((item) =>
            item.id === patient.id ? response.data : item,
          ),
        );

        setSelectedPatient((previous) =>
          previous?.id === patient.id ? response.data : previous,
        );
      }

      setActionPatient(null);
    } catch (err) {
      setError(err.response?.data?.message || "The requested action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setGenderFilter("");
    setBloodGroupFilter("");
  };

  const getActionDetails = () => {
    if (!actionPatient) return {};

    const { type } = actionPatient;

    if (type === "DELETE") {
      return {
        title: "Delete Patient Account?",
        description:
          "This will deactivate the patient account. Patient information will remain stored in the system.",
        button: "Confirm Delete",
        color: "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25",
        icon: Trash2,
      };
    }

    if (type === "DEACTIVATE") {
      return {
        title: "Deactivate Patient?",
        description:
          "This patient will no longer be able to access their CareBridge account.",
        button: "Deactivate Account",
        color:
          "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/25",
        icon: UserX,
      };
    }

    return {
      title: "Activate Patient?",
      description:
        "This patient will regain access to their CareBridge account.",
      button: "Activate Account",
      color: "bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/25",
      icon: UserCheck,
    };
  };

  const actionDetails = getActionDetails();
  const ActionIcon = actionDetails.icon;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-950/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-widest text-teal-100 uppercase backdrop-blur-md">
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              <span>Administration / Patients</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Patient Management
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              Manage patient profiles, personal information and account access.
            </p>
          </div>

          <button
            onClick={fetchPatients}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={`transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
            />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Patients"
          value={stats.total}
          icon={Users}
          color="bg-blue-50 text-blue-600 shadow-blue-500/10"
          description="Registered patient profiles"
        />

        <StatCard
          title="Active Patients"
          value={stats.active}
          icon={UserCheck}
          color="bg-emerald-50 text-emerald-600 shadow-emerald-500/10"
          description="Accounts currently enabled"
        />

        <StatCard
          title="Inactive Patients"
          value={stats.inactive}
          icon={UserX}
          color="bg-orange-50 text-orange-600 shadow-orange-500/10"
          description="Disabled patient accounts"
        />
      </div>

      {/* Search and Filters */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Filter size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Search & Filters
            </h2>
            <p className="text-xs text-slate-400">
              Filter patients by status, blood group, or keyword
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="group relative">
            <Search
              size={18}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pr-4 pl-11 text-sm text-slate-800 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
          >
            <option value="">All Genders</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>

          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-98"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 shadow-sm backdrop-blur-xl">
          <AlertCircle size={19} className="shrink-0 text-red-500" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Patient Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Patients
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              {patients.length} patient profiles found
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-600/15">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Patient Directory
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle size={36} className="animate-spin text-teal-600" />
            <p className="text-sm font-medium text-slate-500 animate-pulse">
              Loading patients...
            </p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
              <Users size={30} />
            </div>

            <h3 className="font-bold text-slate-800">No Patients Found</h3>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-187.5 text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-transform duration-200 group-hover:scale-105">
                          {getInitials(patient.fullName)}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {patient.fullName}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            ID: #{patient.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {patient.email}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {patient.phoneNumber || "No phone number"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1 text-xs font-bold text-red-600 ring-1 ring-red-500/15">
                        <Droplets size={13} />
                        {patient.bloodGroup || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {patient.gender || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                          patient.enabled
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-red-50 text-red-600 ring-red-600/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            patient.enabled ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {patient.enabled ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(patient)}
                          className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-all hover:bg-blue-100 hover:shadow-sm"
                        >
                          <Eye size={17} />
                        </button>

                        {patient.enabled ? (
                          <button
                            title="Deactivate"
                            onClick={() =>
                              setActionPatient({
                                patient,
                                type: "DEACTIVATE",
                              })
                            }
                            className="rounded-xl bg-orange-50 p-2.5 text-orange-600 transition-all hover:bg-orange-100 hover:shadow-sm"
                          >
                            <UserX size={17} />
                          </button>
                        ) : (
                          <button
                            title="Activate"
                            onClick={() =>
                              setActionPatient({
                                patient,
                                type: "ACTIVATE",
                              })
                            }
                            className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition-all hover:bg-emerald-100 hover:shadow-sm"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}

                        <button
                          title="Soft Delete"
                          onClick={() =>
                            setActionPatient({
                              patient,
                              type: "DELETE",
                            })
                          }
                          disabled={!patient.enabled}
                          className="rounded-xl bg-red-50 p-2.5 text-red-600 transition-all hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p className="text-xs font-medium text-slate-400">
            Showing {patients.length} patient profiles
          </p>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-linear-to-r from-teal-800 to-emerald-700 px-6 py-7 text-white">
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-5 right-5 rounded-xl bg-white/15 p-2 transition hover:bg-white/25"
              >
                <X size={19} />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-xl font-extrabold shadow-md">
                  {getInitials(selectedPatient.fullName)}
                </div>

                <div>
                  <h2 className="text-xl font-extrabold">
                    {selectedPatient.fullName}
                  </h2>

                  <p className="mt-1 text-sm text-teal-50 font-medium">
                    Patient ID: #{selectedPatient.id}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${selectedPatient.enabled ? "bg-emerald-400" : "bg-red-400"}`}
                    />
                    {selectedPatient.enabled
                      ? "ACTIVE ACCOUNT"
                      : "INACTIVE ACCOUNT"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-7">
              <div>
                <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <UserRound size={17} className="text-teal-600" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <InfoItem
                    icon={Mail}
                    label="Email Address"
                    value={selectedPatient.email}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone Number"
                    value={selectedPatient.phoneNumber}
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Date of Birth"
                    value={formatDate(selectedPatient.dateOfBirth)}
                  />

                  <InfoItem
                    icon={UserRound}
                    label="Gender"
                    value={selectedPatient.gender}
                  />

                  <InfoItem
                    icon={Droplets}
                    label="Blood Group"
                    value={selectedPatient.bloodGroup}
                  />

                  <InfoItem
                    icon={MapPin}
                    label="Address"
                    value={selectedPatient.address}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Heart size={17} className="text-red-500" />
                  Emergency Contact
                </h3>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <InfoItem
                    icon={UserRound}
                    label="Contact Name"
                    value={selectedPatient.emergencyContactName}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Contact Phone"
                    value={selectedPatient.emergencyContactPhone}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ShieldCheck size={17} className="text-teal-600" />
                  Account Information
                </h3>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <InfoItem
                    icon={CalendarDays}
                    label="Registered On"
                    value={formatDate(selectedPatient.createdAt)}
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Last Updated"
                    value={formatDate(selectedPatient.updatedAt)}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionPatient && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !actionLoading && setActionPatient(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                disabled={actionLoading}
                onClick={() => setActionPatient(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-inner">
              {ActionIcon && <ActionIcon size={26} />}
            </div>

            <h2 className="mt-5 text-center text-xl font-extrabold text-slate-900">
              {actionDetails.title}
            </h2>

            <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
              {actionDetails.description}
            </p>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="font-bold text-slate-900">
                {actionPatient.patient.fullName}
              </p>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                {actionPatient.patient.email}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={actionLoading}
                onClick={() => setActionPatient(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-red-600 transition disabled:opacity-50 ${actionDetails.color}`}
              >
                {actionLoading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {actionLoading ? "Processing..." : actionDetails.button}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatients;
