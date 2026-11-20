import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Bell,
  Search,
  RefreshCw,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Mail,
  MailOpen,
  Filter,
  X,
  Loader2,
  AlertCircle,
  BellRing,
} from "lucide-react";

import api from "../../services/api";

const formatLabel = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={23} />
      </div>
    </div>
  </div>
);

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH ALL NOTIFICATIONS

  const fetchNotifications = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/notifications");

      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");

        if (active) {
          setNotifications(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.detail ||
              "Unable to load notifications.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  // STATISTICS

  const statistics = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => !item.read).length;
    const read = total - unread;

    return { total, unread, read };
  }, [notifications]);

  // FILTER AND SEARCH

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        selectedFilter === "ALL" ||
        (selectedFilter === "UNREAD" && !notification.read) ||
        (selectedFilter === "READ" && notification.read);

      const searchText = [
        notification.title,
        notification.message,
        notification.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(keyword.trim().toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [notifications, selectedFilter, keyword]);

  // MARK INDIVIDUAL AS READ

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      setError("");
      setSuccess("");

      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
      );

      setSuccess("Notification marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notification as read.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // MARK ALL AS READ

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading("all");
      setError("");
      setSuccess("");

      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          read: true,
        })),
      );

      setSuccess("All notifications marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark all notifications as read.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // DELETE NOTIFICATION

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(notificationId);
      setError("");
      setSuccess("");

      await api.delete(`/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== notificationId),
      );

      setSuccess("Notification deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-600">
            <Bell size={16} />
            Administration
            <span className="text-slate-300">/</span>
            Notifications
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage your CareBridge notifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={
              loading || statistics.unread === 0 || actionLoading !== null
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>

          <button
            onClick={() => fetchNotifications(true)}
            disabled={loading || refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <Check size={18} />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Notifications"
          value={statistics.total}
          icon={Bell}
          color="bg-teal-50 text-teal-600"
        />

        <StatCard
          title="Unread Notifications"
          value={statistics.unread}
          icon={Mail}
          color="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Read Notifications"
          value={statistics.read}
          icon={MailOpen}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* NOTIFICATION LIST */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* SEARCH AND FILTER */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              All Notifications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review, read and delete notifications.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* SEARCH */}

            <div className="relative sm:w-72">
              <Search
                size={17}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            {/* FILTER */}

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedFilter}
                onChange={(event) => setSelectedFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-9 text-sm font-medium text-slate-600 outline-none focus:border-teal-500 sm:w-40"
              >
                <option value="ALL">All</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIST */}

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-teal-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <BellRing size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-bold text-slate-700">
                No notifications found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-start ${
                  !notification.read ? "bg-teal-50/30" : ""
                }`}
              >
                {/* ICON */}

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    notification.read
                      ? "bg-slate-100 text-slate-500"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  <Bell size={20} />
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800">
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold text-teal-700">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {formatDate(notification.createdAt)}
                    </span>

                    {notification.type && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                        {formatLabel(notification.type)}
                      </span>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={actionLoading === notification.id}
                      title="Mark as read"
                      className="rounded-lg border border-teal-200 p-2.5 text-teal-600 transition hover:bg-teal-50 disabled:opacity-50"
                    >
                      {actionLoading === notification.id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Check size={17} />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={actionLoading === notification.id}
                    title="Delete notification"
                    className="rounded-lg border border-rose-200 p-2.5 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}

        {!loading && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {filteredNotifications.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {notifications.length}
              </span>{" "}
              notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
