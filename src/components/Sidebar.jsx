import React from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarCheck,
  UserCheck,
  Sparkles,
  BarChart3,
  AlertCircle,
  Settings,
  MapPin,
  Clock,
  Sliders,
  Calendar,
  User,
  CheckCircle,
  PlusCircle,
  Bell,
  Headphones,
  LogOut,
  ShieldCheck,
  Star,
  Grid,
  Wrench,
  Monitor,
  Search,
  Bookmark,
  HelpCircle,
  Home,
  ArrowRight
} from "lucide-react";

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  lang,
  currentUser,
  onLogout,
  stats = {}
}) {
  const isEn = lang === "en";

  // Role-based navigation items
  const getNavItems = () => {
    switch (currentRole) {
      case "admin":
        return [
          { id: "overview", label: isEn ? "Dashboard" : "డాష్‌బోర్డ్", icon: LayoutDashboard },
          { id: "workers", label: isEn ? "Worker Applications" : "కార్మికుల దరఖాస్తులు", icon: Users, badge: 5, badgeBg: "#ef4444" },
          { id: "approved-workers", label: isEn ? "Workers" : "కార్మికులు", icon: UserCheck },
          { id: "customers", label: isEn ? "Customers" : "కస్టమర్లు", icon: User },
          { id: "bookings", label: isEn ? "Bookings" : "బుకింగ్‌లు", icon: CalendarCheck },
          { id: "services", label: isEn ? "Services" : "సేవలు", icon: Wrench },
          { id: "categories", label: isEn ? "Categories" : "కేటగిరీలు", icon: Grid },
          { id: "reviews", label: isEn ? "Reviews" : "రివ్యూలు", icon: Star },
          { id: "reports", label: isEn ? "Reports" : "నివేదికలు", icon: BarChart3 },
          { id: "users", label: isEn ? "Users" : "యూజర్లు", icon: Users },
          { id: "notifications", label: isEn ? "Notifications" : "నోటిఫికేషన్లు", icon: Bell },
          { id: "settings", label: isEn ? "Settings" : "సెట్టింగులు", icon: Settings },
        ];
      case "customer":
        return [
          { id: "customer-home", label: isEn ? "Dashboard" : "డాష్‌బోర్డ్", icon: LayoutDashboard },
          { id: "browse-services", label: isEn ? "Browse Services" : "సేవలు బ్రౌజ్ చేయండి", icon: Grid },
          { id: "book-service", label: isEn ? "Find a Worker" : "కార్మికుడిని కనుగొనండి", icon: Users },
          { id: "customer-bookings", label: isEn ? "My Bookings" : "నా బుకింగ్‌లు", icon: CalendarCheck, badge: 2, badgeBg: "#ef4444" },
          { id: "customer-notifications", label: isEn ? "Notifications" : "నోటిఫికేషన్లు", icon: Bell, badge: 3, badgeBg: "#ef4444" },
          { id: "saved-workers", label: isEn ? "Saved Workers" : "సేవ్ చేసిన కార్మికులు", icon: Bookmark },
          { id: "customer-profile", label: isEn ? "My Profile" : "నా ప్రొఫైల్", icon: User },
          { id: "help-support", label: isEn ? "Help & Support" : "సహాయం & మద్దతు", icon: HelpCircle },
        ];
      case "worker":
        return [
          { id: "worker-overview", label: isEn ? "Dashboard" : "డాష్‌బోర్డ్", icon: LayoutDashboard },
          { id: "worker-requests", label: isEn ? "New Requests" : "కొత్త అభ్యర్థనలు", icon: Clock, badge: 5, badgeBg: "#ef4444" },
          { id: "worker-active", label: isEn ? "My Active Jobs" : "ప్రస్తుత పనులు", icon: CalendarCheck, badge: 2, badgeBg: "#0284c7" },
          { id: "worker-history", label: isEn ? "Booking History" : "చరిత్ర", icon: CheckCircle },
          { id: "worker-skills", label: isEn ? "My Skills" : "నైపుణ్యాలు", icon: Sliders },
          { id: "worker-areas", label: isEn ? "Service Areas" : "ప్రాంతాలు", icon: MapPin },
          { id: "worker-availability", label: isEn ? "Availability" : "లభ్యత", icon: Calendar },
          { id: "worker-profile", label: isEn ? "My Profile" : "ప్రొఫైల్", icon: User },
          { id: "worker-verification", label: isEn ? "Verification Status" : "ధృవీకరణ స్థితి", icon: ShieldCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.email?.split("@")[0] ||
    (currentRole === "worker"
      ? "Worker"
      : currentRole === "customer"
      ? "Customer"
      : "Admin");

  return (
    <aside className={`sidebar ${isMobileOpen ? "open" : ""}`} style={currentRole === "customer" ? { background: "#0B221B" } : {}}>
      {/* Brand Header */}
      <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {currentRole === "customer" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#D6B779", color: "#142D27", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", fontWeight: "900", fontSize: "1.2rem" }}>
              W
            </div>
            <div>
              <div className="brand-name" style={{ fontSize: "1.15rem", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                WorkSphere <span style={{ color: "#D6B779" }}>AI</span>
              </div>
              <div className="brand-sub" style={{ fontSize: "0.68rem", color: "#A3B3AB", letterSpacing: "0.02em" }}>
                Skilled People. Better Homes.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-badge" style={{ background: "linear-gradient(135deg, #0284c7, #06b6d4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className="brand-name" style={{ fontSize: "1.15rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
                WorkSphere <span style={{ color: "#38bdf8" }}>AI</span>
              </div>
              <div className="brand-sub" style={{ fontSize: "0.68rem", color: "#94a3b8", letterSpacing: "0.02em" }}>
                Skilled People | Better Tomorrow
              </div>
            </div>
          </div>
        )}

        {currentRole === "worker" && (
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: "800",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              background: "rgba(56, 189, 248, 0.1)",
              padding: "2px 8px",
              borderRadius: "999px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            WORKER
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map((item) => {
          const Icon = item.icon || LayoutDashboard;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "0.88rem",
                fontWeight: isActive ? "600" : "500",
                background: currentRole === "customer"
                  ? isActive ? "rgba(214, 183, 121, 0.16)" : "transparent"
                  : undefined,
                color: currentRole === "customer"
                  ? isActive ? "#D6B779" : "#A3B3AB"
                  : undefined,
                borderLeft: currentRole === "customer"
                  ? isActive ? "3px solid #D6B779" : "3px solid transparent"
                  : undefined,
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={18} color={currentRole === "customer" && isActive ? "#D6B779" : undefined} />
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: item.badgeBg || "#ef4444",
                    color: "#fff",
                    fontSize: "0.68rem",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "999px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Customer Urgent Help Card (Mockup Exact Match) */}
      {currentRole === "customer" ? (
        <div style={{ padding: "0 14px 18px 14px" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(214, 183, 121, 0.22)",
              borderRadius: "16px",
              padding: "16px 14px",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(214, 183, 121, 0.14)",
                color: "#D6B779",
                marginBottom: "10px",
              }}
            >
              <Home size={18} />
            </div>
            <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "#FFFFFF", marginBottom: "4px" }}>
              {isEn ? "Need urgent help?" : "అత్యవసర సహాయం కావాలా?"}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#A3B3AB", lineHeight: "1.35", marginBottom: "12px" }}>
              {isEn ? "Book a trusted worker in just a few clicks." : "కొన్ని క్లిక్‌లలో నమ్మకమైన కార్మికుడిని బుక్ చేయండి."}
            </div>
            <button
              onClick={() => {
                setActiveTab("book-service");
                setIsMobileOpen(false);
              }}
              style={{
                width: "100%",
                background: "#D6B779",
                color: "#142D27",
                border: "none",
                borderRadius: "10px",
                padding: "9px 12px",
                fontSize: "0.82rem",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(214, 183, 121, 0.2)",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a764")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#D6B779")}
            >
              <span>{isEn ? "Find a Worker" : "కార్మికుడిని కనుగొనండి"}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Botanical leaf watermark & slogan */}
          <div style={{ marginTop: "16px", textAlign: "center", opacity: 0.85 }}>
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ margin: "0 auto 4px auto", display: "block" }}>
              <path d="M12 26C14 18 22 12 32 8C24 14 22 22 20 26" stroke="#D6B779" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
              <path d="M22 12C18 6 10 2 4 4C8 10 12 16 16 20" stroke="#D6B779" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <div style={{ fontSize: "0.72rem", color: "#D6B779", fontStyle: "italic", lineHeight: "1.3" }}>
              Trusted Services<br />for a Better Tomorrow
            </div>
          </div>
        </div>
      ) : currentRole === "worker" ? (
        <div style={{ padding: "0 12px 14px 12px" }}>
          <div
            style={{
              background: "linear-gradient(180deg, #0f2744 0%, #0b192e 100%)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "14px",
              padding: "14px",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ background: "rgba(6, 182, 212, 0.2)", padding: "6px", borderRadius: "8px", color: "#38bdf8" }}>
                <Headphones size={18} />
              </div>
              <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "#f8fafc" }}>
                {isEn ? "Need help?" : "సహాయం కావాలా?"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0 0 10px 0", lineHeight: "1.3" }}>
              {isEn ? "Our support team is here 24/7" : "మా సహాయ బృందం 24/7 అందుబాటులో ఉంది"}
            </p>
            <button
              onClick={() => alert("WorkSphere AI Support: 1800-425-WORK or support@worksphere.ai (Active 24/7)")}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #06b6d4, #0284c7)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
              }}
            >
              {isEn ? "Contact Support" : "సహాయాన్ని సంప్రదించండి"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Bottom Section: Admin Portal Card for Admin OR Worker profile */}
      {currentRole === "admin" ? (
        <div style={{ padding: "16px 14px", marginTop: "auto" }}>
          <div
            style={{
              background: "rgba(30, 41, 59, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "14px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Monitor size={18} />
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#f8fafc" }}>
                Admin Portal
              </div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: "1.35", marginTop: "3px" }}>
                Manage the marketplace and keep it running smoothly.
              </div>
            </div>
          </div>
        </div>
      ) : currentRole === "worker" ? (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.9rem",
                border: "2px solid #38bdf8",
                overflow: "hidden",
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#f8fafc", lineHeight: "1.2" }}>
                {userName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "capitalize" }}>
                {currentRole}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title={isEn ? "Sign Out" : "లాగౌట్"}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            <Settings size={18} />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
