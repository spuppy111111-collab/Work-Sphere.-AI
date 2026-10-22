import React from "react";
import {
  LayoutDashboard,
  Search,
  Calendar,
  Sparkles,
  User,
  Clock,
  CalendarCheck,
  Sliders,
  Users,
  Wrench,
  BarChart3
} from "lucide-react";

export default function MobileBottomNav({
  currentRole = "customer",
  activeTab = "customer-home",
  setActiveTab,
  lang = "en"
}) {
  const isEn = lang === "en";

  // Role-specific bottom navigation tabs (max 5 items)
  const getTabs = () => {
    switch (currentRole) {
      case "admin":
        return [
          { id: "overview", label: isEn ? "Overview" : "సారాంశం", icon: LayoutDashboard },
          { id: "workers", label: isEn ? "Workers" : "కార్మికులు", icon: Users },
          { id: "bookings", label: isEn ? "Bookings" : "బుకింగ్‌లు", icon: CalendarCheck },
          { id: "services", label: isEn ? "Catalog" : "కేటలాగ్", icon: Wrench },
          { id: "reports", label: isEn ? "Reports" : "నివేదికలు", icon: BarChart3 },
        ];
      case "worker":
        return [
          { id: "worker-overview", label: isEn ? "Overview" : "సారాంశం", icon: LayoutDashboard },
          { id: "worker-requests", label: isEn ? "Requests" : "అభ్యర్థనలు", icon: Clock },
          { id: "worker-active", label: isEn ? "Active" : "పనులు", icon: CalendarCheck },
          { id: "worker-skills", label: isEn ? "Skills" : "నైపుణ్యాలు", icon: Sliders },
          { id: "worker-profile", label: isEn ? "Profile" : "ప్రొఫైల్", icon: User },
        ];
      case "customer":
      default:
        return [
          { id: "customer-home", label: isEn ? "Services" : "సేవలు", icon: LayoutDashboard },
          { id: "book-service", label: isEn ? "Find Pro" : "వెతకండి", icon: Search },
          { id: "customer-bookings", label: isEn ? "Bookings" : "బుకింగ్‌లు", icon: Calendar },
          { id: "ai-assistant", label: isEn ? "AI Help" : "AI సహాయం", icon: Sparkles },
          { id: "customer-profile", label: isEn ? "Profile" : "ప్రొఫైల్", icon: User },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-nav-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab && setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {isActive && <span className="mobile-nav-indicator" />}
              </div>
              <span className="mobile-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
