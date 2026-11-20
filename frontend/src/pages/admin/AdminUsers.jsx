import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  CalendarDays,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

const roleOptions = [
  "ALL",
  "ADMIN",
  "DOCTOR",
  "PATIENT",
  "LAB_STAFF",
  "PHARMACIST",
];

const roleStyles = {
  ADMIN: "bg-purple-50 text-purple-700 ring-purple-200",
  DOCTOR: "bg-blue-50 text-blue-700 ring-blue-200",
  PATIENT: "bg-teal-50 text-teal-700 ring-teal-200",
  LAB_STAFF: "bg-amber-50 text-amber-700 ring-amber-200",
  PHARMACIST: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [actionUser, setActionUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(
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

        if (selectedRole !== "ALL") {
          params.role = selectedRole;
        }

        const response = await api.get("/admin/users", { params });

        setUsers(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load users. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [keyword, selectedRole],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (selectedStatus === "ALL") return users;

    return users.filter((user) =>
      selectedStatus === "ACTIVE" ? user.enabled : !user.enabled,
    );
  }, [users, selectedStatus]);

  const statistics = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.enabled).length;
    const inactive = total - active;
    const admins = users.filter((user) => user.role === "ADMIN").length;

    return { total, active, inactive, admins };
  }, [users]);

  const handleViewDetails = async (userId) => {
    try {
      setUserDetailsLoading(true);
      setSelectedUser(null);
      setError("");

      const response = await api.get(`/admin/users/${userId}`);

      setSelectedUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user details.");
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!actionUser) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.patch(`/admin/users/${actionUser.id}/status`, {
        enabled: !actionUser.enabled,
      });

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === actionUser.id ? response.data : user,
        ),
      );

      if (selectedUser?.id === actionUser.id) {
        setSelectedUser(response.data);
      }

      setSuccess(
        `${response.data.fullName} has been ${
          response.data.enabled ? "activated" : "deactivated"
        } successfully.`,
      );

      setActionUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actionUser) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.delete(`/admin/users/${actionUser.id}`);

      const updatedUser = {
        ...actionUser,
        enabled: false,
      };

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === actionUser.id ? updatedUser : user,
        ),
      );

      if (selectedUser?.id === actionUser.id) {
        setSelectedUser(updatedUser);
      }

      setSuccess(`${actionUser.fullName} has been deactivated successfully.`);

      setActionUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setActionLoading(false);
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
            User Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage user accounts, permissions and account status.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
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
          title="Total Users"
          value={statistics.total}
          icon={Users}
          color="bg-teal-50 text-teal-600"
          description="Users matching current filters"
        />

        <StatCard
          title="Active Users"
          value={statistics.active}
          icon={UserCheck}
          color="bg-emerald-50 text-emerald-600"
          description="Currently active accounts"
        />

        <StatCard
          title="Inactive Users"
          value={statistics.inactive}
          icon={UserX}
          color="bg-rose-50 text-rose-600"
          description="Deactivated accounts"
        />

        <StatCard
          title="Administrators"
          value={statistics.admins}
          icon={ShieldCheck}
          color="bg-purple-50 text-purple-600"
          description="Administrator accounts"
        />
      </div>

      {/* User Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">All Users</h2>
            <p className="mt-1 text-xs text-slate-500">
              View and manage registered CareBridge accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 sm:w-44"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role === "ALL" ? "All Roles" : role.replace("_", " ")}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 sm:w-36"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Joined
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
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Users size={35} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-600">
                      No users found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white">
                          {getInitials(user.fullName)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {user.phoneNumber || "No phone number"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                          roleStyles[user.role] ||
                          "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.enabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.enabled ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {user.enabled ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(user.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title={
                            user.enabled ? "Deactivate User" : "Activate User"
                          }
                          onClick={() =>
                            setActionUser({
                              ...user,
                              action: "status",
                            })
                          }
                          className={`rounded-lg p-2 transition ${
                            user.enabled
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {user.enabled ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}
                        </button>

                        <button
                          title="Soft Delete User"
                          onClick={() =>
                            setActionUser({
                              ...user,
                              action: "delete",
                            })
                          }
                          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                        >
                          <Trash2 size={17} />
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
                {filteredUsers.length}
              </span>{" "}
              users
            </p>

            <p className="text-xs text-slate-400">
              CareBridge User Administration
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {(selectedUser || userDetailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  User Details
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Account information and activity
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {userDetailsLoading ? (
              <div className="p-12 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-teal-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading user details...
                </p>
              </div>
            ) : (
              selectedUser && (
                <div className="space-y-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 text-xl font-bold text-white">
                      {getInitials(selectedUser.fullName)}
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        {selectedUser.fullName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        User ID: #{selectedUser.id}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          selectedUser.enabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {selectedUser.enabled
                          ? "Active Account"
                          : "Inactive Account"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-slate-50 p-5">
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="mt-0.5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-400">Email Address</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="mt-0.5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-400">Phone Number</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedUser.phoneNumber || "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-0.5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-400">User Role</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedUser.role?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 text-teal-600"
                      />
                      <div>
                        <p className="text-xs text-slate-400">Registered On</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 text-teal-600"
                      />
                      <div>
                        <p className="text-xs text-slate-400">Last Updated</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(selectedUser.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                actionUser.action === "delete"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {actionUser.action === "delete" ? (
                <Trash2 size={23} />
              ) : (
                <Pencil size={23} />
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              {actionUser.action === "delete"
                ? "Soft Delete User?"
                : actionUser.enabled
                  ? "Deactivate User?"
                  : "Activate User?"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {actionUser.action === "delete"
                ? `Are you sure you want to soft delete ${actionUser.fullName}? Their account will become inactive, but their records will be preserved.`
                : `Are you sure you want to ${
                    actionUser.enabled ? "deactivate" : "activate"
                  } ${actionUser.fullName}'s account?`}
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setActionUser(null)}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  actionUser.action === "delete"
                    ? handleDelete
                    : handleStatusChange
                }
                disabled={actionLoading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  actionUser.action === "delete"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {actionLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {actionUser.action === "delete"
                  ? "Confirm Delete"
                  : actionUser.enabled
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

export default AdminUsers;
