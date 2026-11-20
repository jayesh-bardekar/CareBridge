import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  BellRing,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  Info,
  ExternalLink,
} from "lucide-react";

import api from "../../services/api";

const getNotificationIcon = (type) => {
  if (type?.includes("APPOINTMENT")) return CalendarDays;
  if (type?.includes("LAB_REPORT")) return FlaskConical;
  if (type?.includes("PRESCRIPTION")) return Pill;
  if (type?.includes("MEDICAL")) return FileText;
  return Bell;
};

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);

      const data = notificationResponse.data;

      setError("");
      setNotifications(
        Array.isArray(data) ? data : data?.content || data?.notifications || [],
      );

      setUnreadCount(countResponse.data?.unreadCount ?? 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchNotifications, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      setProcessingId(id);

      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      alert(err.response?.data?.message || "Unable to update notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setProcessingId("all");

      await api.patch("/notifications/read-all");

      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      alert(err.response?.data?.message || "Unable to update notifications.");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      setProcessingId(id);

      const notification = notifications.find((item) => item.id === id);

      await api.delete(`/notifications/${id}`);

      setNotifications((prev) => prev.filter((item) => item.id !== id));

      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      alert(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-600">
            Patient Portal
          </p>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Stay updated with your appointments, prescriptions and lab reports.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchNotifications();
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Notifications</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {notifications.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Bell size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Unread</p>
              <h2 className="mt-2 text-3xl font-bold text-orange-600">
                {unreadCount}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <BellRing size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Read</p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {notifications.filter((item) => item.read).length}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCheck size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              All Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your notification activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={processingId === "all"}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {processingId === "all" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}
              Mark All as Read
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 p-5 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Info size={28} />
              </div>

              <h3 className="font-semibold text-slate-700">
                No notifications found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your notifications will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = getNotificationIcon(item.type);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-start ${
                    !item.read ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      item.read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      {!item.read && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Unread
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.message}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>

                    {item.targetUrl && (
                      <a
                        href={item.targetUrl}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Details
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        disabled={processingId === item.id}
                        title="Mark as read"
                        className="rounded-lg border border-green-200 p-2.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                      >
                        {processingId === item.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Check size={17} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      disabled={processingId === item.id}
                      title="Delete notification"
                      className="rounded-lg border border-red-200 p-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredNotifications.length} of {notifications.length}{" "}
          notifications
        </div>
      </div>
    </div>
  );
};

export default PatientNotifications;
