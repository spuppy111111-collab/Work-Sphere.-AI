import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AIWorkAssistantPage from "./pages/AIWorkAssistantPage";
import DemandAnalyticsPage from "./pages/DemandAnalyticsPage";
import HomePage from "./pages/HomePage";

// Auth & Role-Based Pages
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import CustomerLoginPage from "./pages/auth/CustomerLoginPage";
import WorkerLoginPage from "./pages/auth/WorkerLoginPage";
import WorkerRegisterPage from "./pages/auth/WorkerRegisterPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileBottomNav from "./components/MobileBottomNav";

import {
  isSupabaseConfigured,
  supabase,
  getCurrentUserAndRole,
  logoutUser
} from "./lib/supabase";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => {
    // Check localStorage for active session or demo session
    const cached = localStorage.getItem("worksphere_active_user");
    if (cached) {
      try { return JSON.parse(cached); } catch (_) {}
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("worksphere_active_role") || null;
  });

  const [lang, setLang] = useState("en"); // 'en' | 'te'
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("customer-home");
  const [initialLoading, setInitialLoading] = useState(true);

  // Restore current session from Supabase on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const authData = await getCurrentUserAndRole();
          if (authData?.user) {
            const role = authData.role || "customer";
            const userObj = {
              id: authData.user.id,
              email: authData.user.email,
              name:
                authData.profile?.full_name ||
                authData.user.user_metadata?.full_name ||
                authData.user.email?.split("@")[0],
              phone: authData.profile?.phone || "",
              city: authData.profile?.city || "Guntur",
              role: role,
              workerProfile: authData.workerProfile,
            };
            setCurrentUser(userObj);
            setCurrentRole(role);
            localStorage.setItem("worksphere_active_user", JSON.stringify(userObj));
            localStorage.setItem("worksphere_active_role", role);
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    restoreSession();

    // Listen to Supabase auth transitions
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const authData = await getCurrentUserAndRole();
          if (authData?.user) {
            const role = authData.role || "customer";
            const userObj = {
              id: authData.user.id,
              email: authData.user.email,
              name:
                authData.profile?.full_name ||
                authData.user.user_metadata?.full_name ||
                authData.user.email?.split("@")[0],
              phone: authData.profile?.phone || "",
              city: authData.profile?.city || "Guntur",
              role: role,
              workerProfile: authData.workerProfile,
            };
            setCurrentUser(userObj);
            setCurrentRole(role);
            localStorage.setItem("worksphere_active_user", JSON.stringify(userObj));
            localStorage.setItem("worksphere_active_role", role);
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setCurrentRole(null);
          localStorage.removeItem("worksphere_active_user");
          localStorage.removeItem("worksphere_active_role");
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (supabase) {
        await logoutUser();
      }
    } catch (err) {
      console.warn("Logout notice:", err);
    } finally {
      setCurrentUser(null);
      setCurrentRole(null);
      localStorage.removeItem("worksphere_active_user");
      localStorage.removeItem("worksphere_active_role");
      navigate("/login");
    }
  };

  const handleRoleSwitch = (newRole) => {
    if (newRole === currentRole) return;
    if (newRole === "admin") navigate("/admin/dashboard");
    else if (newRole === "worker") navigate("/worker/dashboard");
    else navigate("/customer/dashboard");
  };

  // Quick allocation helper for demo testing or immediate dashboard entry
  const allocateRoleAndNavigate = (role) => {
    const defaultUsers = {
      customer: {
        id: "demo-customer-id",
        email: "customer@worksphere.ai",
        name: "Ramesh Varma",
        phone: "+91 98765 43210",
        city: "Guntur",
        role: "customer",
      },
      worker: {
        id: "demo-worker-id",
        email: "worker@worksphere.ai",
        name: "Koteswara Rao",
        phone: "+91 98480 12345",
        city: "Vijayawada",
        role: "worker",
        workerProfile: {
          display_name: "Koteswara Rao",
          trade: "Carpentry & Woodwork",
          skills: ["Carpentry", "Wood Polish", "Modular Furniture"],
          experience_years: 8,
          city: "Vijayawada",
          service_area: "Vijayawada & Krishna",
          approval_status: "approved",
          rating: 4.9,
          total_jobs: 142
        }
      },
      admin: {
        id: "demo-admin-id",
        email: "admin@worksphere.ai",
        name: "Platform Administrator",
        phone: "+91 90000 00001",
        city: "Amaravati",
        role: "admin",
      }
    };

    const targetUser = defaultUsers[role] || defaultUsers.customer;
    setCurrentUser(targetUser);
    setCurrentRole(role);
    localStorage.setItem("worksphere_active_user", JSON.stringify(targetUser));
    localStorage.setItem("worksphere_active_role", role);

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "worker") {
      navigate("/worker/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  // Common Dashboard Shell
  const DashboardLayout = ({ role, children }) => {
    const effectiveRole = role || currentRole || "customer";

    // Ensure fallback user if accessing directly in development
    const activeUser = currentUser || {
      id: `dev-${effectiveRole}`,
      email: `${effectiveRole}@worksphere.ai`,
      name: effectiveRole === "admin" ? "Admin Supervisor" : effectiveRole === "worker" ? "Qualified Technician" : "Verified Customer",
      city: "Guntur",
      role: effectiveRole,
    };

    return (
      <div className={`app-container ${effectiveRole === "customer" ? "customer-theme" : ""}`}>
        <Sidebar
          currentRole={effectiveRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          lang={lang}
          currentUser={activeUser}
          onLogout={handleLogout}
          stats={{ pendingWorkers: 0, activeBookings: 0, complaints: 0 }}
        />

        <div className="main-wrapper">
          <Topbar
            currentRole={effectiveRole}
            setCurrentRole={handleRoleSwitch}
            currentUser={activeUser}
            onLogout={handleLogout}
            onOpenAuth={() => navigate("/login")}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            lang={lang}
            setLang={setLang}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="content-body">
            {activeTab === "ai-assistant" ? (
              <AIWorkAssistantPage lang={lang} onNavigate={(tab) => setActiveTab(tab)} />
            ) : activeTab === "analytics" ? (
              <DemandAnalyticsPage lang={lang} />
            ) : (
              children
            )}
          </main>

          <MobileBottomNav
            currentRole={effectiveRole}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        </div>
      </div>
    );
  };

  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<HomePage onSelectRole={allocateRoleAndNavigate} />} />
      <Route path="/home" element={<HomePage onSelectRole={allocateRoleAndNavigate} />} />

      {/* 2. Three Logins Role Selection Screen */}
      <Route
        path="/login"
        element={<RoleSelectionPage lang={lang} onDirectRoleSelect={allocateRoleAndNavigate} />}
      />

      {/* 3. Dedicated Login & Register Pages */}
      <Route path="/customer/login" element={<CustomerLoginPage lang={lang} defaultMode="login" />} />
      <Route path="/customer/register" element={<CustomerLoginPage lang={lang} defaultMode="register" />} />
      <Route path="/worker/login" element={<WorkerLoginPage lang={lang} />} />
      <Route path="/admin/login" element={<AdminLoginPage lang={lang} />} />
      <Route path="/worker/register" element={<WorkerRegisterPage lang={lang} />} />
      <Route path="/worker/application-status" element={<PendingApprovalPage lang={lang} />} />
      <Route path="/worker/pending" element={<PendingApprovalPage lang={lang} />} />

      {/* 4. Step 3: Customer Dashboard */}
      <Route
        path="/customer/dashboard/*"
        element={
          <DashboardLayout role="customer">
            <CustomerDashboard
              lang={lang}
              currentUser={currentUser || {
                id: "customer-user",
                email: "customer@worksphere.ai",
                name: "Customer User",
                city: "Guntur",
                role: "customer"
              }}
              onOpenAuth={() => navigate("/customer/login")}
              onNavigate={(tab) => setActiveTab(tab)}
              activeTab={activeTab}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <DashboardLayout role="customer">
            <CustomerDashboard
              lang={lang}
              currentUser={currentUser || {
                id: "customer-user",
                email: "customer@worksphere.ai",
                name: "Customer User",
                city: "Guntur",
                role: "customer"
              }}
              onOpenAuth={() => navigate("/customer/login")}
              onNavigate={(tab) => setActiveTab(tab)}
              activeTab="customer-bookings"
            />
          </DashboardLayout>
        }
      />

      {/* 5. Step 4: Worker Dashboard */}
      <Route
        path="/worker/dashboard/*"
        element={
          <DashboardLayout role="worker">
            <WorkerDashboard
              lang={lang}
              currentUser={currentUser || {
                id: "worker-user",
                email: "worker@worksphere.ai",
                name: "Skilled Worker",
                city: "Vijayawada",
                role: "worker"
              }}
              onOpenAuth={() => navigate("/worker/login")}
              activeTab={activeTab}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="/worker/requests"
        element={
          <DashboardLayout role="worker">
            <WorkerDashboard
              lang={lang}
              currentUser={currentUser || {
                id: "worker-user",
                email: "worker@worksphere.ai",
                name: "Skilled Worker",
                city: "Vijayawada",
                role: "worker"
              }}
              onOpenAuth={() => navigate("/worker/login")}
              activeTab="worker-overview"
            />
          </DashboardLayout>
        }
      />

      {/* 6. Step 5: Admin Dashboard */}
      <Route
        path="/admin/dashboard/*"
        element={
          <DashboardLayout role="admin">
            <AdminDashboard
              lang={lang}
              currentUser={currentUser || {
                id: "admin-user",
                email: "admin@worksphere.ai",
                name: "Administrator",
                role: "admin"
              }}
              onOpenAuth={() => navigate("/admin/login")}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          </DashboardLayout>
        }
      />

      {/* 7. Direct Dashboard Redirect Route */}
      <Route
        path="/dashboard/*"
        element={
          currentRole === "admin" ? (
            <Navigate to="/admin/dashboard" replace />
          ) : currentRole === "worker" ? (
            <Navigate to="/worker/dashboard" replace />
          ) : (
            <Navigate to="/customer/dashboard" replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
