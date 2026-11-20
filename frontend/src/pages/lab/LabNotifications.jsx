import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  BellRing,
} from "lucide-react";
import api from "../../services/api";

const LabNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);

      const data = notificationResponse.data;

      setNotifications(
        Array.isArray(data) ? data : data?.content || data?.notifications || [],
      );

      setUnreadCount(countResponse.data?.unreadCount ?? 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchNotifications(), 0);
    return () => clearTimeout(timeoutId);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notification as read.",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true })),
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark all as read.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      const notification = notifications.find((item) => item.id === id);

      await api.delete(`/notifications/${id}`);

      setNotifications((previous) => previous.filter((item) => item.id !== id));

      if (notification && !notification.read) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase()) ||
        item.type?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNREAD" && !item.read) ||
        (filter === "READ" && item.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto mb-3 animate-spin text-teal-600"
            size={30}
          />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-teal-600">
            LAB STAFF PANEL
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your laboratory activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {notifications.length}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Bell size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread Notifications</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {unreadCount}
              </h2>
            </div>
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <BellRing size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Read Notifications</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {notifications.length - unreadCount}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCheck size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "UNREAD", "READ"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Recent Notifications</h2>
          <p className="mt-1 text-xs text-gray-500">
            {filteredNotifications.length} notification(s) found
          </p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Bell size={26} />
            </div>
            <h3 className="font-semibold text-gray-800">
              No notifications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-start ${
                  !item.read ? "bg-teal-50/40" : "bg-white"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    item.read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  <Bell size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>

                    {!item.read && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {item.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {formatDate(item.createdAt)}
                    </span>

                    {item.type && (
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600">
                        {item.type.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as read"
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="Delete notification"
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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

export default LabNotifications;
