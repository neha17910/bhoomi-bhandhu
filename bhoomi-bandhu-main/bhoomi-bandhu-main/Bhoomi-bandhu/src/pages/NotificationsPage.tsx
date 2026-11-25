import React from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpen, Check, Info, Warehouse } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function NotificationsPage() {
  const { user, isAdmin, notifications, markNotificationRead } = useAuth();

  const iconFor = (category: string) => {
    if (category === "scheme") return BookOpen;
    if (category === "warehouse") return Warehouse;
    return Info;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
            Notifications
          </h1>
          <p className="text-sm text-[#4A5A4F]">
            {isAdmin
              ? "Platform notifications, operational alerts, and system updates."
              : "Updates on your saved schemes and warehouse storage requests."}
          </p>
        </div>
      </div>

      {!user ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
          <p className="text-sm text-[#4A5A4F]">
            Sign in to receive personal alerts for saved schemes and storage
            approvals.
          </p>
          <Link
            to="/auth"
            className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-2">
          <p className="font-semibold text-[#1B2A20]">You are all caught up</p>
          <p className="text-sm text-[#4A5A4F]">
            When you save a scheme or submit a storage booking, updates appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconFor(n.category);
            return (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span
                          aria-label="Unread"
                          className="w-2 h-2 rounded-full bg-[#2D6A4F] shrink-0"
                        />
                      )}
                      <h2 className="font-semibold text-sm md:text-base text-[#1B2A20]">
                        {n.title}
                      </h2>
                    </div>
                    <p className="text-sm text-[#4A5A4F] mt-0.5">
                      {n.description}
                    </p>
                  </div>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="min-h-[38px] px-3 rounded-xl border border-[#2D6A4F]/25 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] inline-flex items-center gap-1 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark read</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
