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
import WorkerPaymentPage from "./pages/auth/WorkerPaymentPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileBottomNav from "./components/MobileBottomNav";

import {
  isSupabaseConfigured,
  supabase,
  getCurrentUserAndRole,
  logoutUser,
  getMyNotifications,
  getCustomerBookings,
  getNewServiceRequestsForWorker,
  getWorkerActiveJobs,
  getAllBookingsForAdmin,
  getAllWorkerProfilesForAdmin
} from "./lib/supabase";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [lang, setLang] = useState("en"); // 'en' | 'te'
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("customer-home");
  const [initialLoading, setInitialLoading] = useState(true);

  // Restore and maintain current session from Supabase
  useEffect(() => {
    let isMounted = true;

    async function applyUserSession(user, session) {
      if (!isMounted) return;
      if (!user) {
        setCurrentUser(null);
        setCurrentRole(null);
        return;
      }

      try {
        const authData = await getCurrentUserAndRole();
        if (!isMounted) return;

        if (authData?.user) {
          const role = authData.role || null;
          setCurrentUser({
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
          });
          setCurrentRole(role);
        } else {
          setCurrentUser(null);
          setCurrentRole(null);
        }
      } catch (err) {
        console.error("Auth state update error:", err);
        if (isMounted) {
          setCurrentUser(null);
          setCurrentRole(null);
        }
      }
    }

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Check actual active session from Supabase
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.warn("Session check notice:", sessionErr.message);
          }
          if (session?.user) {
            await applyUserSession(session.user, session);
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            await applyUserSession(user, null);
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    initAuth();

    // Listen to all Supabase auth transitions
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (
          (event === "SIGNED_IN" ||
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED" ||
            event === "USER_UPDATED") &&
          session?.user
        ) {
          await applyUserSession(session.user, session);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setCurrentRole(null);
        }

        if (isMounted) setInitialLoading(false);
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setCurrentRole(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleRoleSwitch = (newRole) => {
    if (newRole === currentRole) return;
    if (newRole === "admin" && currentRole === "admin") {
      navigate("/admin/dashboard");
    } else if (newRole === "worker" && currentRole === "worker") {
      navigate("/worker/dashboard");
    } else if (newRole === "customer" && currentRole === "customer") {
      navigate("/customer/dashboard");
    } else {
      if (newRole === "admin") navigate("/admin/login");
      else if (newRole === "worker") navigate("/worker/login");
      else navigate("/customer/login");
    }
  };

  const [sharedStats, setSharedStats] = useState({
    pendingWorkers: 0,
    totalBookings: 0,
    activeBookings: 0,
    newRequests: 0,
    activeJobs: 0,
    unreadNotifications: 0,
  });

  const refreshSharedStats = async () => {
    try {
      if (currentUser?.id) {
        const notifs = await getMyNotifications().catch(() => []);
        const unread = (notifs || []).filter((n) => !n.is_read).length;

        if (currentRole === "admin") {
          const [apps, bks] = await Promise.all([
            getAllWorkerProfilesForAdmin().catch(() => []),
            getAllBookingsForAdmin().catch(() => []),
          ]);
          const pending = (apps || []).filter((w) => (w.approval_status || "").toLowerCase() === "pending").length;
          setSharedStats({
            pendingWorkers: pending,
            totalBookings: (bks || []).length,
            activeBookings: 0,
            newRequests: 0,
            activeJobs: 0,
            unreadNotifications: unread,
          });
        } else if (currentRole === "worker") {
          const [reqs, jobs] = await Promise.all([
            getNewServiceRequestsForWorker(currentUser.id).catch(() => []),
            getWorkerActiveJobs(currentUser.id).catch(() => []),
          ]);
          setSharedStats({
            pendingWorkers: 0,
            totalBookings: 0,
            activeBookings: 0,
            newRequests: (reqs || []).length,
            activeJobs: (jobs || []).length,
            unreadNotifications: unread,
          });
        } else {
          const bks = await getCustomerBookings(currentUser.id).catch(() => []);
          const active = (bks || []).filter((b) =>
            !["Completed", "completed", "Cancelled", "cancelled", "Rejected", "rejected"].includes(b.status)
          ).length;
          setSharedStats({
            pendingWorkers: 0,
            totalBookings: (bks || []).length,
            activeBookings: active,
            newRequests: 0,
            activeJobs: 0,
            unreadNotifications: unread,
          });
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    refreshSharedStats();

    window.addEventListener("ws_booking_updated", refreshSharedStats);
    window.addEventListener("storage", refreshSharedStats);

    return () => {
      window.removeEventListener("ws_booking_updated", refreshSharedStats);
      window.removeEventListener("storage", refreshSharedStats);
    };
  }, [currentUser?.id, currentRole]);

  // Common Dashboard Shell
  const DashboardLayout = ({ role, children }) => {
    const effectiveRole = role || currentRole || null;

    // Synchronize default tab with role when dashboard loads
    useEffect(() => {
      if (effectiveRole === "worker" && (!activeTab || !activeTab.startsWith("worker-"))) {
        setActiveTab("worker-overview");
      } else if (effectiveRole === "admin" && (!activeTab || activeTab.startsWith("worker-") || activeTab.startsWith("customer-"))) {
        setActiveTab("overview");
      } else if (effectiveRole === "customer" && (!activeTab || activeTab.startsWith("worker-") || activeTab === "overview")) {
        setActiveTab("customer-home");
      }
    }, [effectiveRole]);

    return (
      <div className={`app-container ${effectiveRole === "customer" ? "customer-theme" : ""}`}>
        <Sidebar
          currentRole={effectiveRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          lang={lang}
          currentUser={currentUser}
          onLogout={handleLogout}
          stats={sharedStats}
        />

        <div className="main-wrapper">
          <Topbar
            currentRole={effectiveRole}
            setCurrentRole={handleRoleSwitch}
            currentUser={currentUser}
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

  // Smart dashboard redirection based on authenticated role
  const RootRedirect = () => {
    if (initialLoading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#0B221B",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "3px solid rgba(255, 255, 255, 0.15)",
              borderTopColor: "#D6B779",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      );
    }

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (currentRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (currentRole === "worker") {
      return <Navigate to="/worker/dashboard" replace />;
    }

    if (currentRole === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* 1. Common Role Selection Page */}
      <Route path="/login" element={<RoleSelectionPage lang={lang} />} />

      {/* 2. Dedicated Login & Register Pages */}
      <Route path="/customer/login" element={<CustomerLoginPage lang={lang} defaultMode="login" />} />
      <Route path="/customer/register" element={<CustomerLoginPage lang={lang} defaultMode="register" />} />
      <Route path="/worker/login" element={<WorkerLoginPage lang={lang} />} />
      <Route path="/admin/login" element={<AdminLoginPage lang={lang} />} />

      {/* 3. Worker Registration (7 required fields) */}
      <Route path="/worker/register" element={<WorkerRegisterPage lang={lang} />} />

      {/* 4. Worker ₹25 Registration Payment & Status Pages */}
      <Route path="/worker/payment" element={<WorkerPaymentPage lang={lang} />} />
      <Route path="/worker/application-status" element={<PendingApprovalPage lang={lang} />} />
      <Route path="/worker/pending" element={<PendingApprovalPage lang={lang} />} />

      {/* 5. Protected Customer Dashboard & Bookings */}
      <Route
        path="/customer/dashboard/*"
        element={
          <ProtectedRoute
            user={currentUser}
            role={currentRole}
            allowedRole="customer"
            loading={initialLoading}
            lang={lang}
          >
            <DashboardLayout role="customer">
              <CustomerDashboard
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => navigate("/customer/login")}
                onNavigate={(tab) => setActiveTab(tab)}
                activeTab={activeTab}
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute
            user={currentUser}
            role={currentRole}
            allowedRole="customer"
            loading={initialLoading}
            lang={lang}
          >
            <DashboardLayout role="customer">
              <CustomerDashboard
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => navigate("/customer/login")}
                onNavigate={(tab) => setActiveTab(tab)}
                activeTab="customer-bookings"
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 6. Protected Worker Dashboard & Requests */}
      <Route
        path="/worker/dashboard/*"
        element={
          <ProtectedRoute
            user={currentUser}
            role={currentRole}
            allowedRole="worker"
            loading={initialLoading}
            lang={lang}
          >
            <DashboardLayout role="worker">
              <WorkerDashboard
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => navigate("/worker/login")}
                activeTab={activeTab}
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/requests"
        element={
          <ProtectedRoute
            user={currentUser}
            role={currentRole}
            allowedRole="worker"
            loading={initialLoading}
            lang={lang}
          >
            <DashboardLayout role="worker">
              <WorkerDashboard
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => navigate("/worker/login")}
                activeTab="worker-overview"
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 7. Protected Admin Dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard/*"
        element={
          <ProtectedRoute
            user={currentUser}
            role={currentRole}
            allowedRole="admin"
            loading={initialLoading}
            lang={lang}
          >
            <DashboardLayout role="admin">
              <AdminDashboard
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => navigate("/admin/login")}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 8. Dedicated General Dashboard Route -> redirects based on actual role */}
      <Route path="/dashboard/*" element={<RootRedirect />} />

      {/* Public Pages */}
      <Route path="/" element={<HomePage lang={lang} />} />
      <Route path="/home" element={<HomePage lang={lang} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
