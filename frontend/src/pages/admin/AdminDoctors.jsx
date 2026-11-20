import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Stethoscope,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  Mail,
  Phone,
  CalendarDays,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  GraduationCap,
  BriefcaseMedical,
  IndianRupee,
  Clock3,
  Check,
  Ban,
} from "lucide-react";

import api from "../../services/api";

const specializations = [
  "GENERAL_PHYSICIAN",
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIC",
  "PEDIATRICIAN",
  "GYNECOLOGIST",
  "DENTIST",
  "OPHTHALMOLOGIST",
  "PSYCHIATRIST",
  "ENT_SPECIALIST",
  "UROLOGIST",
  "ONCOLOGIST",
  "OTHER",
];

const formatLabel = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

const approvalStyles = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  REJECTED: "bg-rose-50 text-rose-700",
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

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("ALL");
  const [selectedApproval, setSelectedApproval] = useState("ALL");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("ALL");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionDoctor, setActionDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctors = useCallback(
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

        if (selectedSpecialization !== "ALL") {
          params.specialization = selectedSpecialization;
        }

        if (selectedApproval !== "ALL") {
          params.approvalStatus = selectedApproval;
        }

        const response = await api.get("/admin/doctors", { params });

        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load doctors. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [keyword, selectedSpecialization, selectedApproval],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const filteredDoctors = useMemo(() => {
    if (selectedAccountStatus === "ALL") return doctors;

    return doctors.filter((doctor) =>
      selectedAccountStatus === "ACTIVE" ? doctor.enabled : !doctor.enabled,
    );
  }, [doctors, selectedAccountStatus]);

  const statistics = useMemo(() => {
    return {
      total: doctors.length,
      approved: doctors.filter((doctor) => doctor.approvalStatus === "APPROVED")
        .length,
      pending: doctors.filter((doctor) => doctor.approvalStatus === "PENDING")
        .length,
      rejected: doctors.filter((doctor) => doctor.approvalStatus === "REJECTED")
        .length,
    };
  }, [doctors]);

  const handleViewDetails = async (doctorId) => {
    try {
      setDetailsLoading(true);
      setSelectedDoctor(null);
      setError("");

      const response = await api.get(`/admin/doctors/${doctorId}`);

      setSelectedDoctor(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load doctor details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprovalChange = async () => {
    if (!actionDoctor) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/doctors/${actionDoctor.id}/approval`,
        {
          approvalStatus: actionDoctor.nextApproval,
        },
      );

      setDoctors((previous) =>
        previous.map((doctor) =>
          doctor.id === actionDoctor.id ? response.data : doctor,
        ),
      );

      if (selectedDoctor?.id === actionDoctor.id) {
        setSelectedDoctor(response.data);
      }

      setSuccess(
        `${response.data.fullName}'s approval status updated to ${formatLabel(
          response.data.approvalStatus,
        )}.`,
      );

      setActionDoctor(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update doctor approval.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccountStatusChange = async () => {
    if (!actionDoctor) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/doctors/${actionDoctor.id}/status`,
        {
          enabled: !actionDoctor.enabled,
        },
      );

      setDoctors((previous) =>
        previous.map((doctor) =>
          doctor.id === actionDoctor.id ? response.data : doctor,
        ),
      );

      if (selectedDoctor?.id === actionDoctor.id) {
        setSelectedDoctor(response.data);
      }

      setSuccess(
        `${response.data.fullName}'s account has been ${
          response.data.enabled ? "activated" : "deactivated"
        } successfully.`,
      );

      setActionDoctor(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update doctor account status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeActionDialog = () => {
    if (!actionLoading) {
      setActionDoctor(null);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-600">
            <ShieldCheck size={16} />
            Administration
            <span className="text-slate-300">/</span>
            Doctor Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Doctor Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review doctor profiles, manage approvals and control account access.
          </p>
        </div>

        <button
          onClick={() => fetchDoctors(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Success Message */}
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

      {/* Error Message */}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Doctors"
          value={statistics.total}
          icon={Stethoscope}
          color="bg-teal-50 text-teal-600"
          description="Doctors matching current filters"
        />

        <StatCard
          title="Approved"
          value={statistics.approved}
          icon={UserCheck}
          color="bg-emerald-50 text-emerald-600"
          description="Approved doctor profiles"
        />

        <StatCard
          title="Pending Approval"
          value={statistics.pending}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          description="Awaiting admin review"
        />

        <StatCard
          title="Rejected"
          value={statistics.rejected}
          icon={UserX}
          color="bg-rose-50 text-rose-600"
          description="Rejected doctor profiles"
        />
      </div>

      {/* Doctor Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Registered Doctors
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage CareBridge medical professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            <div className="relative sm:col-span-2 xl:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search doctor name, email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedSpecialization}
                onChange={(event) =>
                  setSelectedSpecialization(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-48"
              >
                <option value="ALL">All Specializations</option>

                {specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {formatLabel(specialization)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <select
              value={selectedApproval}
              onChange={(event) => setSelectedApproval(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-40"
            >
              <option value="ALL">All Approvals</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={selectedAccountStatus}
              onChange={(event) => setSelectedAccountStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 xl:w-36"
            >
              <option value="ALL">All Accounts</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Doctor
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Specialization
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Experience
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Consultation Fee
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Approval
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Account
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
                      Loading doctors...
                    </p>
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Stethoscope size={35} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-600">
                      No doctors found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white">
                          {getInitials(doctor.fullName)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {doctor.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: #{doctor.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {formatLabel(doctor.specialization)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {doctor.experienceYears ?? 0} years
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      ₹
                      {Number(doctor.consultationFee ?? 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          approvalStyles[doctor.approvalStatus] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(doctor.approvalStatus)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          doctor.enabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            doctor.enabled ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {doctor.enabled ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(doctor.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                        >
                          <Eye size={17} />
                        </button>

                        {doctor.approvalStatus !== "APPROVED" && (
                          <button
                            title="Approve Doctor"
                            onClick={() =>
                              setActionDoctor({
                                ...doctor,
                                action: "approval",
                                nextApproval: "APPROVED",
                              })
                            }
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <Check size={17} />
                          </button>
                        )}

                        {doctor.approvalStatus !== "REJECTED" && (
                          <button
                            title="Reject Doctor"
                            onClick={() =>
                              setActionDoctor({
                                ...doctor,
                                action: "approval",
                                nextApproval: "REJECTED",
                              })
                            }
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Ban size={17} />
                          </button>
                        )}

                        <button
                          title={
                            doctor.enabled
                              ? "Deactivate Account"
                              : "Activate Account"
                          }
                          onClick={() =>
                            setActionDoctor({
                              ...doctor,
                              action: "status",
                            })
                          }
                          className={`rounded-lg p-2 transition ${
                            doctor.enabled
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {doctor.enabled ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {filteredDoctors.length}
              </span>{" "}
              doctors
            </p>

            <p className="text-xs text-slate-400">
              CareBridge Doctor Administration
            </p>
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      {(selectedDoctor || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Doctor Profile
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Professional information and account details
                </p>
              </div>

              <button
                onClick={() => setSelectedDoctor(null)}
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
                  Loading doctor details...
                </p>
              </div>
            ) : (
              selectedDoctor && (
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 text-xl font-bold text-white">
                      {getInitials(selectedDoctor.fullName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-bold text-slate-800">
                        {selectedDoctor.fullName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatLabel(selectedDoctor.specialization)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            approvalStyles[selectedDoctor.approvalStatus]
                          }`}
                        >
                          {formatLabel(selectedDoctor.approvalStatus)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            selectedDoctor.enabled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {selectedDoctor.enabled
                            ? "Active Account"
                            : "Inactive Account"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Mail}
                      label="Email Address"
                      value={selectedDoctor.email}
                    />

                    <InfoItem
                      icon={Phone}
                      label="Phone Number"
                      value={selectedDoctor.phoneNumber}
                    />

                    <InfoItem
                      icon={GraduationCap}
                      label="Qualification"
                      value={selectedDoctor.qualification}
                    />

                    <InfoItem
                      icon={BriefcaseMedical}
                      label="Experience"
                      value={`${selectedDoctor.experienceYears ?? 0} years`}
                    />

                    <InfoItem
                      icon={IndianRupee}
                      label="Consultation Fee"
                      value={`₹${Number(
                        selectedDoctor.consultationFee ?? 0,
                      ).toLocaleString("en-IN")}`}
                    />

                    <InfoItem
                      icon={MapPin}
                      label="Clinic Address"
                      value={selectedDoctor.clinicAddress}
                    />

                    <InfoItem
                      icon={Clock3}
                      label="Available Time"
                      value={`${selectedDoctor.startTime || "N/A"} - ${
                        selectedDoctor.endTime || "N/A"
                      }`}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Available Days"
                      value={
                        Array.isArray(selectedDoctor.availableDays)
                          ? selectedDoctor.availableDays
                              .map(formatLabel)
                              .join(", ")
                          : selectedDoctor.availableDays
                      }
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Profile Created"
                      value={formatDate(selectedDoctor.createdAt)}
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Last Updated"
                      value={formatDate(selectedDoctor.updatedAt)}
                    />
                  </div>

                  <div>
                    <h5 className="mb-2 text-sm font-bold text-slate-700">
                      About Doctor
                    </h5>

                    <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
                      {selectedDoctor.about || "No description available."}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      {actionDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                actionDoctor.action === "approval"
                  ? actionDoctor.nextApproval === "APPROVED"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {actionDoctor.action === "approval" ? (
                actionDoctor.nextApproval === "APPROVED" ? (
                  <Check size={23} />
                ) : (
                  <Ban size={23} />
                )
              ) : actionDoctor.enabled ? (
                <UserX size={23} />
              ) : (
                <UserCheck size={23} />
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              {actionDoctor.action === "approval"
                ? actionDoctor.nextApproval === "APPROVED"
                  ? "Approve Doctor?"
                  : "Reject Doctor?"
                : actionDoctor.enabled
                  ? "Deactivate Doctor?"
                  : "Activate Doctor?"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {actionDoctor.action === "approval"
                ? `Are you sure you want to ${
                    actionDoctor.nextApproval === "APPROVED"
                      ? "approve"
                      : "reject"
                  } ${actionDoctor.fullName}'s doctor profile?`
                : `Are you sure you want to ${
                    actionDoctor.enabled ? "deactivate" : "activate"
                  } ${actionDoctor.fullName}'s account?`}
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={closeActionDialog}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  actionDoctor.action === "approval"
                    ? handleApprovalChange
                    : handleAccountStatusChange
                }
                disabled={actionLoading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  actionDoctor.action === "approval"
                    ? actionDoctor.nextApproval === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {actionLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {actionDoctor.action === "approval"
                  ? actionDoctor.nextApproval === "APPROVED"
                    ? "Confirm Approval"
                    : "Confirm Rejection"
                  : actionDoctor.enabled
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
