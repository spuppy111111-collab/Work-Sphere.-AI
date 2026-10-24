import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUserAndRole, AUTHORIZED_ADMIN_EMAIL } from "../lib/supabase";

/**
 * WorkSphere AI ProtectedRoute
 * Strict role-based protection:
 * - Worker portal (/worker/*): If not logged in as worker -> redirect to /worker/login
 * - Customer portal (/customer/*): If not logged in as customer -> redirect to /customer/login
 * - Admin portal (/admin/*): If not logged in as admin -> redirect to /admin/login
 * - Once logged in with the matching role -> open the authorized dashboard directly
 */
export default function ProtectedRoute({
  user: propUser,
  role: propRole,
  allowedRole,
  loading: propLoading,
  children,
  lang = "en",
  allowGuest = false,
}) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(propUser || null);
  const [activeRole, setActiveRole] = useState(propRole || null);
  const [roleError, setRoleError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveSecurity() {
      // Query Supabase directly to ensure freshest session and role
      try {
        if (isMounted) setLoading(true);
        const authData = await getCurrentUserAndRole();
        if (!isMounted) return;

        if (authData?.user) {
          setActiveUser(authData.user);
          setActiveRole(authData.role || null);
          setRoleError(authData.roleError || null);
          setIsPending(!!authData.isPending);
          setIsIncomplete(!!authData.isIncomplete);
          setIsPaymentVerified(!!authData.isPaymentVerified);
          setIsApproved(!!authData.isApproved);
        } else {
          setActiveUser(null);
          setActiveRole(null);
          setRoleError(null);
          setIsPending(false);
          setIsIncomplete(false);
          setIsPaymentVerified(false);
          setIsApproved(false);
        }
      } catch (err) {
        console.error("Protected route auth resolution failed:", err);
        if (isMounted) {
          setActiveUser(null);
          setActiveRole(null);
          setRoleError(err);
          setIsPending(false);
          setIsIncomplete(false);
          setIsPaymentVerified(false);
          setIsApproved(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    resolveSecurity();

    return () => {
      isMounted = false;
    };
  }, [propUser, propRole, allowedRole, location.pathname]);

  // 1. Show loading screen while verifying session
  if (loading || (propLoading && !activeUser)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0B221B",
          color: "#FFFFFF",
          gap: "1.25rem",
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
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.02em" }}>
            WorkSphere AI
          </p>
          <span style={{ fontSize: "0.85rem", color: "#A3B3AB" }}>
            Loading {allowedRole === "worker" ? "Worker" : allowedRole === "admin" ? "Admin" : "Customer"} Dashboard...
          </span>
        </div>
      </div>
    );
  }

  // 2. If unauthenticated, redirect to that specific portal's login page
  if (!activeUser) {
    if (allowedRole === "worker") {
      return <Navigate to="/worker/login" state={{ from: location }} replace />;
    }
    if (allowedRole === "admin") {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  // 3. Strict Admin Authorization Gate:
  // Must be the authorized admin email AND have admin role in public.user_roles
  if (allowedRole === "admin") {
    const cleanEmail = (activeUser?.email || "").trim().toLowerCase();
    const isTargetAdmin = cleanEmail === (AUTHORIZED_ADMIN_EMAIL || "ssunny143870@gmail.com");

    if (roleError) {
      return (
        <Navigate
          to="/admin/login"
          state={{
            from: location,
            errorMsg: `Database error while verifying admin role in public.user_roles: ${roleError.message || "Query failed."}`,
            actualRole: activeRole,
          }}
          replace
        />
      );
    }

    if (!isTargetAdmin || activeRole !== "admin") {
      return (
        <Navigate
          to="/admin/login"
          state={{
            from: location,
            roleMismatch: true,
            errorMsg: !isTargetAdmin
              ? `Access denied. Only the authorized administrator account (${AUTHORIZED_ADMIN_EMAIL || "ssunny143870@gmail.com"}) may access the Admin Portal.`
              : "Authentication succeeded, but this account is not assigned the 'admin' role in public.user_roles.",
            actualRole: activeRole,
          }}
          replace
        />
      );
    }
  }

  // 4. Role enforcement for other portals: if user does not have the allowed role
  if (activeRole !== allowedRole) {
    // If a non-worker (e.g. customer) tries to access worker dashboard, send to worker login with denied message
    if (allowedRole === "worker") {
      const errorMsg =
        activeRole === "customer"
          ? "This account is registered as a customer. Please use worker login with your worker account."
          : activeRole === "admin"
          ? "This account has administrator privileges. Please use the Admin Portal."
          : "This account is not authorized for the worker portal.";

      return (
        <Navigate
          to="/worker/login"
          state={{
            from: location,
            roleMismatch: true,
            errorMsg,
            actualRole: activeRole,
          }}
          replace
        />
      );
    }

    // If a worker tries to access customer dashboard, send to customer login with message
    if (allowedRole === "customer") {
      const errorMsg =
        activeRole === "worker"
          ? "This account is registered as a worker. Please use customer login with your customer account."
          : activeRole === "admin"
          ? "This account has administrator privileges. Please use the Admin Portal."
          : "This account is not authorized for the customer portal.";

      return (
        <Navigate
          to="/customer/login"
          state={{
            from: location,
            roleMismatch: true,
            errorMsg,
            actualRole: activeRole,
          }}
          replace
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  // 4. Worker-specific verification: incomplete profile, ₹25 payment verification, admin approval
  if (allowedRole === "worker") {
    if (isIncomplete) {
      return <Navigate to="/worker/register" replace />;
    }
    // Condition 1: Payment MUST be verified
    if (!isPaymentVerified) {
      return <Navigate to="/worker/payment" replace />;
    }
    // Condition 2: Profile MUST be approved
    if (!isApproved) {
      return <Navigate to="/worker/pending" replace />;
    }
  }

  // 5. Authorized -> Render protected dashboard content
  return children;
}
