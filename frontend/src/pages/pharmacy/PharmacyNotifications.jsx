import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Bell,
  Search,
  RefreshCw,
  CheckCheck,
  Check,
  Trash2,
  ExternalLink,
  X,
  Clock,
} from "lucide-react";

const PharmacyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(response.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchNotifications);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        notification.title,
        notification.message,
        notification.type,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchText));

      const matchesFilter =
        filter === "ALL" ||
        (filter === "READ" && notification.read) ||
        (filter === "UNREAD" && !notification.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const handleMarkRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );

      setMessage("Notification marked as read.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setMessage("All notifications marked as read.");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read.",
      );
    }
  };

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== notificationId),
      );

      setMessage("Notification deleted successfully.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete notification.");
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      await handleMarkRead(notification.id);
    }

    if (notification.targetUrl) {
      window.location.assign(notification.targetUrl);
    }
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

  const getTypeStyle = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return "bg-amber-50 text-amber-700";

      case "MEDICINE_EXPIRY":
        return "bg-red-50 text-red-700";

      case "PRESCRIPTION_ISSUED":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with medicine stock and pharmacy activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
          <button onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          icon={<Bell size={23} />}
          color="blue"
        />

        <StatCard
          title="Unread"
          value={unreadCount}
          icon={<Clock size={23} />}
          color="amber"
        />

        <StatCard
          title="Read"
          value={readCount}
          icon={<CheckCheck size={23} />}
          color="emerald"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Notifications</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Recent Notifications ({filteredNotifications.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Bell size={40} className="mx-auto text-gray-300" />

            <h3 className="mt-3 font-semibold text-gray-800">
              No notifications found
            </h3>

            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-start ${
                  !notification.read ? "bg-blue-50/40" : ""
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    notification.read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Bell size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {notification.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeStyle(
                        notification.type,
                      )}`}
                    >
                      {notification.type?.replaceAll("_", " ") || "GENERAL"}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={13} />
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {notification.targetUrl && (
                    <button
                      onClick={() => handleOpenNotification(notification)}
                      title="Open Notification"
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <ExternalLink size={17} />
                    </button>
                  )}

                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      title="Mark as Read"
                      className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    title="Delete Notification"
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
        </div>

        <div className={`rounded-xl p-3 ${styles[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default PharmacyNotifications;
