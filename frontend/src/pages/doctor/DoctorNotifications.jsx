import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Search,
  CalendarCheck,
  FlaskConical,
  Pill,
  AlertTriangle,
  Info,
  Clock,
  LoaderCircle,
} from "lucide-react";
import api from "../../services/api";

const notificationIcons = {
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_REJECTED: CalendarCheck,
  APPOINTMENT_CANCELLED: CalendarCheck,
  APPOINTMENT_UPCOMING: Clock,
  LAB_REPORT_AVAILABLE: FlaskConical,
  PRESCRIPTION_ISSUED: Pill,
  LOW_STOCK: AlertTriangle,
  MEDICINE_EXPIRY: AlertTriangle,
  GENERAL: Info,
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(
        typeof countResponse.data === "number"
          ? countResponse.data
          : (countResponse.data.unreadCount ?? 0),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchNotifications, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch = [
        notification.title,
        notification.message,
        notification.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNREAD" && !notification.read) ||
        (filter === "READ" && notification.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to mark notification as read.",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark all as read.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete notification.");
    }
  };

  const getIcon = (type) => notificationIcons[type] || Bell;

  const getTypeLabel = (type) =>
    type?.replaceAll("_", " ").toLowerCase() || "General";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Bell size={16} />
            Doctor Workspace
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Stay updated with your appointments and important activities.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={loading || unreadCount === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Notifications
            </p>
            <Bell className="text-blue-600" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {notifications.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Unread</p>
            <Clock className="text-amber-500" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Read</p>
            <CheckCheck className="text-emerald-600" size={21} />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {notifications.filter((item) => item.read).length}
          </h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="notificationSearch"
            name="notificationSearch"
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <select
          id="notificationFilter"
          name="notificationFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">All Notifications</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
            <LoaderCircle className="animate-spin text-blue-600" size={28} />
            <span className="ml-3 text-sm text-slate-500">
              Loading notifications...
            </span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-800">
            <Bell className="mx-auto mb-3 text-slate-400" size={36} />
            <h3 className="font-semibold text-slate-800 dark:text-white">
              No notifications found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your notifications will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);

            return (
              <div
                key={notification.id}
                className={`rounded-2xl border p-5 transition ${
                  notification.read
                    ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                    : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize">
                        {getTypeLabel(notification.type)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          <CheckCheck size={14} />
                          Mark as read
                        </button>
                      )}

                      {notification.targetUrl && (
                        <a
                          href={notification.targetUrl}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          View Details
                        </a>
                      )}

                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorNotifications;
