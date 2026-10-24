import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Languages,
  Bell,
  ChevronDown,
  Sparkles,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  CheckCircle,
  X
} from "lucide-react";
import { getMyNotifications, markNotificationAsRead } from "../lib/supabase";

export default function Topbar({
  currentRole,
  setCurrentRole,
  currentUser,
  onLogout,
  onOpenAuth,
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  lang,
  setLang,
  searchQuery,
  setSearchQuery,
}) {
  const isEn = lang === "en";

  // Notifications dropdown state
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fetch real notifications from Supabase
  const fetchNotifications = async () => {
    if (currentUser?.id) {
      const data = await getMyNotifications();
      setNotifications(data || []);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("ws_booking_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ws_booking_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [currentUser?.id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview": return isEn ? "Executive Overview" : "ముఖ్య కార్యనిర్వాహక సమాచారం";
      case "workers": return isEn ? "Worker Management & Verifications" : "కార్మికుల నిర్వహణ & ధృవీకరణ";
      case "bookings": return isEn ? "Booking Lifecycle & Jobs" : "బుకింగ్ నిర్వహణ";
      case "services": return isEn ? "Marketplace Service Catalog" : "సేవల కేటలాగ్";
      case "users": return isEn ? "Registered Users" : "యూజర్ల జాబితా";
      case "analytics": return isEn ? "Local Demand Analytics" : "స్థానిక డిమాండ్ విశ్లేషణ";
      case "complaints": return isEn ? "Dispute Resolution" : "వివాద పరిష్కారం";
      case "ai-assistant": return isEn ? "AI Work Diagnosis Assistant" : "AI సమస్య విశ్లేషణ అసిస్టెంట్";
      case "customer-home": return isEn ? "Verified Local Service Professionals" : "ధృవీకరించబడిన స్థానిక కార్మికులు";
      case "book-service": return isEn ? "Find Approved Local Workers" : "ధృవీకరించబడిన కార్మికులు";
      case "customer-bookings": return isEn ? "My Booking Requests & Tracking" : "నా బుకింగ్‌లు & ట్రాకింగ్";
      case "customer-notifications": return isEn ? "Booking Notifications" : "బుకింగ్ నోటిఫికేషన్లు";
      case "customer-profile": return isEn ? "Customer Profile & Addresses" : "నా ప్రొఫైల్ మరియు చిరునామాలు";
      case "worker-overview": return isEn ? "Worker Dashboard & Requests" : "కార్మికుల డాష్‌బోర్డ్";
      default: return isEn ? "WorkSphere Dashboard" : "వర్క్‌స్పియర్ డాష్‌బోర్డ్";
    }
  };

  return (
    <header
      className={`topbar ${currentRole === "customer" ? "cust-topbar-forest" : ""}`}
      style={
        currentRole === "customer"
          ? {
              background: "#0B221B",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#FFFFFF",
              padding: "0 1.5rem",
              gap: "1.5rem",
            }
          : {}
      }
    >
      <div className="topbar-left" style={{ flex: currentRole === "admin" || currentRole === "customer" ? "0 0 auto" : undefined }}>
        <button
          className="mobile-toggle-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation"
          style={currentRole === "customer" ? { background: "rgba(255,255,255,0.08)", color: "#FFFFFF" } : {}}
        >
          <Menu size={20} />
        </button>

        {currentRole !== "admin" && currentRole !== "customer" && (
          <div className="breadcrumbs">
            <span>WorkSphere AI</span>
            <span>/</span>
            <b>{getPageTitle()}</b>
          </div>
        )}
      </div>

      {/* Global Search */}
      <div
        className="topbar-search"
        style={
          currentRole === "customer"
            ? {
                flex: "1",
                maxWidth: "600px",
                background: "#FFFFFF",
                borderRadius: "9999px",
                padding: "8px 18px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }
            : currentRole === "admin"
            ? {
                flex: "1",
                maxWidth: "520px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }
            : {}
        }
      >
        <Search size={16} color={currentRole === "customer" ? "#6F7C72" : "#94a3b8"} />
        <input
          type="text"
          placeholder={
            currentRole === "customer"
              ? "Search for services, e.g. plumbing, electrical..."
              : currentRole === "admin"
              ? "Search users, workers, bookings..."
              : "Search requests, customers, or services..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: "0.88rem",
            color: "#1e293b",
            background: "transparent",
          }}
        />
      </div>

      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Customer & Worker Location Selector */}
        {currentRole === "worker" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "0.82rem",
              color: "#334155",
              fontWeight: "600",
              cursor: "pointer",
            }}
            title="Operating Area: Guntur & Vijayawada"
          >
            <span style={{ color: "#0284c7" }}>📍</span>
            <span>Guntur & Vijayawada</span>
            <ChevronDown size={14} color="#64748b" />
          </div>
        )}

        {/* Language Switch for non-admin */}
        {currentRole !== "admin" && (
          <button
            className="lang-switch-btn"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            title="Switch Language"
          >
            <Languages size={15} color="#0891b2" />
            <span>{lang === "en" ? "తెలుగు" : "English"}</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="notification-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #ffffff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                right: 0,
                width: "320px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                border: "1px solid #e2e8f0",
                zIndex: 1000,
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <b style={{ fontSize: "0.9rem", color: "#0f172a" }}>Notifications ({notifications.length})</b>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: n.is_read ? "#f8fafc" : "#ecfeff",
                        borderLeft: n.is_read ? "3px solid transparent" : "3px solid #0891b2",
                        cursor: "pointer",
                      }}
                    >
                      <b style={{ fontSize: "0.8rem", color: "#0f172a", display: "block" }}>{n.title || "Notification"}</b>
                      <span style={{ fontSize: "0.75rem", color: "#475569" }}>{n.message || n.body}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill: Matching Admin Design in Screenshot */}
        {currentRole === "admin" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            onClick={() => {
              if (window.confirm("Do you want to log out from the Admin Portal?")) {
                onLogout();
              }
            }}
            title="Click to log out"
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.82rem",
                letterSpacing: "0.02em",
                flexShrink: 0,
              }}
            >
              AD
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2" }}>
              <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "#0f172a" }}>
                Admin
              </span>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                System Administrator
              </span>
            </div>
          </div>
        ) : currentRole === "customer" ? (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "9999px",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #047857)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  border: "2px solid #D6B779",
                }}
              >
                {(currentUser?.name || currentUser?.full_name || currentUser?.email || "User").charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2" }}>
                <span style={{ fontSize: "0.86rem", fontWeight: "700", color: "#FFFFFF" }}>
                  {currentUser?.name || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Account"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#A3B3AB" }}>
                  {currentUser ? "Customer" : "Guest"}
                </span>
              </div>
              <ChevronDown size={14} color="#A3B3AB" />
            </div>

            {isProfileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "210px",
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                  border: "1px solid #EAE5D9",
                  padding: "8px",
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: "8px 12px 6px 12px", borderBottom: "1px solid #F0ECE4", marginBottom: "4px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#142D27" }}>
                    {currentUser?.name || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Customer"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>
                    {currentUser?.email || "Signed in"}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("customer-profile");
                    setIsProfileOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "0.84rem",
                    color: "#142D27",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F5EF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <User size={15} color="#142D27" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("help-support");
                    setIsProfileOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "0.84rem",
                    color: "#142D27",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F5EF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <ShieldCheck size={15} color="#142D27" />
                  <span>Help & Support</span>
                </button>
                <div style={{ height: "1px", background: "#EAE5D9", margin: "6px 0" }} />
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "0.84rem",
                    color: "#DC2626",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={15} color="#DC2626" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="profile-pill" style={{ cursor: "default" }}>
              <div className="profile-avatar">
                {(currentUser.name || currentUser.full_name || currentUser.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="profile-info">
                <span className="profile-name">
                  {currentUser.name || currentUser.full_name || currentUser.email}
                </span>
                <span className="profile-role">
                  {currentRole.toUpperCase()} • {currentUser.city || "Guntur"}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: "6px 10px", fontSize: "0.78rem", color: "#dc2626" }}
              title="Sign Out of Supabase"
            >
              <LogOut size={14} />
              <span>{isEn ? "Logout" : "లాగౌట్"}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <LogIn size={15} />
            <span>{isEn ? "Sign In / Register" : "లాగిన్ / రిజిస్ట్రేషన్"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
