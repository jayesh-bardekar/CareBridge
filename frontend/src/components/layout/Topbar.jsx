import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  Check,
  CheckCheck,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  BellRing,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // PAGE TITLE

  const pageName = location.pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase());

  // ROLE-BASED NOTIFICATION ROUTES

  const notificationRoutes = {
    ADMIN: "/admin/notifications",
    DOCTOR: "/doctor/notifications",
    PATIENT: "/patient/notifications",
    LAB_STAFF: "/lab/notifications",
    PHARMACIST: "/pharmacy/notifications",
  };

  const notificationPath = notificationRoutes[user?.role] || "/";

  // FETCH UNREAD COUNT

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count");

      setUnreadCount(response.data?.unreadCount ?? 0);
    } catch (error) {
      console.error("Unable to fetch unread notification count:", error);
    }
  }, []);

  // FETCH RECENT NOTIFICATIONS

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications/recent");

      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Unable to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD AND AUTOMATIC REFRESH

  useEffect(() => {
    const initialFetch = setTimeout(fetchUnreadCount, 0);

    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // TOGGLE NOTIFICATION DROPDOWN

  const handleNotificationClick = async () => {
    const nextState = !dropdownOpen;

    setDropdownOpen(nextState);

    if (nextState) {
      await Promise.all([fetchRecentNotifications(), fetchUnreadCount()]);
    }
  };

  // MARK SINGLE NOTIFICATION AS READ

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);

      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );

      await fetchUnreadCount();

      return true;
    } catch (error) {
      console.error("Unable to mark notification as read:", error);

      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // DELETE NOTIFICATION

  const handleDeleteNotification = async (notificationId) => {
    try {
      setActionLoading(notificationId);

      await api.delete(`/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== notificationId),
      );

      await fetchUnreadCount();
    } catch (error) {
      console.error("Unable to delete notification:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // MARK ALL AS READ

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading("all");

      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Unable to mark all notifications as read:", error);

      await fetchUnreadCount();
    } finally {
      setActionLoading(null);
    }
  };

  // OPEN NOTIFICATION

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      const success = await handleMarkAsRead(notification.id);

      if (!success) return;
    }

    setDropdownOpen(false);

    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  };

  // FORMAT DATE

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all sm:px-6 lg:px-8">
      {/* LEFT SECTION */}

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/70 hover:text-teal-700 hover:shadow-sm active:translate-y-0 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <h2 className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-900 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
            {pageName || "Dashboard"}
          </h2>

          <p className="hidden text-xs font-medium text-slate-500 sm:block">
            Welcome to your CareBridge workspace
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* SEARCH */}

        <div className="group hidden items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2.5 shadow-inner transition-all duration-200 hover:border-teal-300 hover:bg-white focus-within:border-teal-500 focus-within:bg-white focus-within:shadow-sm focus-within:ring-4 focus-within:ring-teal-500/15 md:flex">
          <Search
            size={17}
            className="text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600"
          />

          <input
            id="globalSearch"
            name="globalSearch"
            type="text"
            placeholder="Search anything..."
            className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-52"
          />
        </div>

        {/* NOTIFICATIONS */}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleNotificationClick}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={dropdownOpen}
            className="group relative rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-700 hover:shadow-md hover:shadow-teal-950/5"
          >
            <Bell
              size={20}
              className="transition-transform duration-200 group-hover:rotate-12"
            />

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}

          {dropdownOpen && (
            <div className="absolute top-14 right-0 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* DROPDOWN HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-800">Notifications</h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {unreadCount} unread notifications
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={actionLoading === "all"}
                      title="Mark all as read"
                      className="rounded-lg p-2 text-teal-600 transition hover:bg-teal-50 disabled:opacity-50"
                    >
                      {actionLoading === "all" ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCheck size={18} />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setDropdownOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* NOTIFICATION LIST */}

              <div className="max-h-100 overflow-y-auto">
                {loading ? (
                  <div className="p-10 text-center">
                    <Loader2
                      size={25}
                      className="mx-auto animate-spin text-teal-600"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <BellRing size={35} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-600">
                      You're all caught up!
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No notifications available.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
                        !notification.read ? "bg-teal-50/40" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                          <Bell size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => handleOpenNotification(notification)}
                            className="block w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-slate-800">
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[10px] font-medium text-slate-400">
                              {formatTime(notification.createdAt)}
                            </p>
                          </button>

                          {/* NOTIFICATION ACTIONS */}

                          <div className="mt-2 flex items-center gap-3">
                            {!notification.read && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                disabled={actionLoading === notification.id}
                                className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800 disabled:opacity-50"
                              >
                                <Check size={13} />
                                Mark read
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              disabled={actionLoading === notification.id}
                              className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-50"
                            >
                              {actionLoading === notification.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DROPDOWN FOOTER */}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(notificationPath);
                }}
                className="flex w-full items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
              >
                View All Notifications
                <ExternalLink size={15} />
              </button>
            </div>
          )}
        </div>

        {/* PROFILE */}

        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent py-1.5 pl-3 pr-2 transition-all duration-200 hover:border-teal-200/60 hover:bg-teal-50/40 hover:shadow-xs sm:border-l sm:border-l-slate-200/80 sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-600/25 transition-transform duration-200 group-hover:scale-105">
            {user?.fullName ? (
              <span className="text-sm font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircle size={23} />
            )}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-36 truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-teal-900">
              {user?.fullName || "CareBridge User"}
            </p>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {user?.role?.replace("_", " ")}
            </span>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:text-teal-600 sm:block"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
