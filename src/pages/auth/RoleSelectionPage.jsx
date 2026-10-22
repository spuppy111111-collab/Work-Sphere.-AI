import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function RoleSelectionPage({ lang = "en", onDirectRoleSelect }) {
  const navigate = useNavigate();
  const isEn = lang === "en";

  const handleSelect = (role, loginPath, dashboardPath) => {
    if (onDirectRoleSelect) {
      onDirectRoleSelect(role);
    } else {
      navigate(loginPath);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F5EF",
        color: "#243B33",
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          background: "#142D27",
          borderBottom: "1px solid rgba(200, 169, 106, 0.2)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "7px 14px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>

          <div
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(200, 169, 106, 0.15)",
                border: "1px solid rgba(200, 169, 106, 0.4)",
                display: "grid",
                placeItems: "center",
                color: "#C8A96A",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                WorkSphere <span style={{ color: "#C8A96A" }}>AI</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.78rem", color: "#C8A96A", fontWeight: 700, background: "rgba(200, 169, 106, 0.1)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(200, 169, 106, 0.3)" }}>
            PORTAL SELECTION
          </span>
        </div>
      </header>

      {/* Main Content: 3 Login Cards */}
      <main
        style={{
          flex: 1,
          maxWidth: "1180px",
          width: "100%",
          margin: "0 auto",
          padding: "3.5rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "680px", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "#EBF0EC",
              color: "#347B63",
              fontSize: "0.8rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            • Choose Your Portal
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              color: "#142D27",
              letterSpacing: "-0.025em",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            Sign In to WorkSphere AI
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#5A6D65", lineHeight: 1.6, margin: 0 }}>
            Select your account type below. Each portal connects you to your dedicated dashboard with customized tools and real-time data.
          </p>
        </div>

        {/* The 3 Arranged Login Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "2rem",
            width: "100%",
            marginBottom: "3rem",
          }}
        >
          {/* Card 1: Customer Login */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid rgba(20, 45, 39, 0.12)",
              borderRadius: "24px",
              padding: "2.25rem 1.75rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(20, 45, 39, 0.05)",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="hover-card"
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#EBF0EC",
                color: "#142D27",
                display: "grid",
                placeItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <User size={34} strokeWidth={2.2} />
            </div>

            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#347B63", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              STEP 3 DASHBOARD
            </span>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#142D27", marginBottom: "0.6rem" }}>
              Customer Portal
            </h2>

            <p style={{ fontSize: "0.9rem", color: "#5A6D65", lineHeight: 1.6, minHeight: "65px", marginBottom: "1.75rem" }}>
              Browse 50 service categories, book verified trade specialists, view booking status timelines, and manage profile history.
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/customer/login")}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "9999px",
                  background: "#142D27",
                  color: "#FFFFFF",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(20, 45, 39, 0.2)",
                }}
              >
                <span>Customer Login</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => handleSelect("customer", "/customer/login", "/customer/dashboard")}
                style={{
                  width: "100%",
                  padding: "10px 18px",
                  borderRadius: "9999px",
                  background: "#F7F5EF",
                  color: "#142D27",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: "1px solid rgba(20, 45, 39, 0.15)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} color="#C8A96A" />
                <span>Instant Customer Dashboard</span>
              </button>
            </div>
          </div>

          {/* Card 2: Worker Login */}
          <div
            style={{
              background: "#142D27",
              color: "#FFFFFF",
              border: "1.5px solid rgba(200, 169, 106, 0.35)",
              borderRadius: "24px",
              padding: "2.25rem 1.75rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "0 12px 35px rgba(20, 45, 39, 0.15)",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="hover-card"
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(200, 169, 106, 0.15)",
                color: "#C8A96A",
                display: "grid",
                placeItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Briefcase size={34} strokeWidth={2.2} />
            </div>

            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#C8A96A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              STEP 4 DASHBOARD
            </span>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.6rem" }}>
              Worker Portal
            </h2>

            <p style={{ fontSize: "0.9rem", color: "#D0DCD4", lineHeight: 1.6, minHeight: "65px", marginBottom: "1.75rem" }}>
              Receive local customer job requests, accept or reject incoming leads, update status to In Progress & Completed, and manage your trade skills.
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/worker/login")}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "9999px",
                  background: "#C8A96A",
                  color: "#142D27",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(200, 169, 106, 0.35)",
                }}
              >
                <span>Worker Login</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => handleSelect("worker", "/worker/login", "/worker/dashboard")}
                style={{
                  width: "100%",
                  padding: "10px 18px",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} color="#C8A96A" />
                <span>Instant Worker Dashboard</span>
              </button>
            </div>
          </div>

          {/* Card 3: Admin Login */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid rgba(200, 169, 106, 0.4)",
              borderRadius: "24px",
              padding: "2.25rem 1.75rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(20, 45, 39, 0.05)",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="hover-card"
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(200, 169, 106, 0.15)",
                color: "#142D27",
                display: "grid",
                placeItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Shield size={34} strokeWidth={2.2} color="#C8A96A" />
            </div>

            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#C8A96A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              STEP 5 DASHBOARD
            </span>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#142D27", marginBottom: "0.6rem" }}>
              Admin Portal
            </h2>

            <p style={{ fontSize: "0.9rem", color: "#5A6D65", lineHeight: 1.6, minHeight: "65px", marginBottom: "1.75rem" }}>
              Manage users, review & approve worker applications, oversee database bookings, maintain service catalogs, and inspect metrics.
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "9999px",
                  background: "#243B33",
                  color: "#FFFFFF",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(36, 59, 51, 0.2)",
                }}
              >
                <span>Admin Login</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => handleSelect("admin", "/admin/login", "/admin/dashboard")}
                style={{
                  width: "100%",
                  padding: "10px 18px",
                  borderRadius: "9999px",
                  background: "#F7F5EF",
                  color: "#142D27",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: "1px solid rgba(200, 169, 106, 0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} color="#C8A96A" />
                <span>Instant Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Back to Landing Page */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "#5A6D65" }}>
            New service professional wanting to join?{" "}
            <Link
              to="/worker/register"
              style={{ color: "#142D27", fontWeight: 700, textDecoration: "none", borderBottom: "1.5px solid #C8A96A" }}
            >
              Submit Worker Registration →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
