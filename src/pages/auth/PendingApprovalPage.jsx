import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  MapPin,
  Briefcase,
  Phone,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { getCurrentUserAndRole, logoutUser } from "../../lib/supabase";

export default function PendingApprovalPage({ lang = "en" }) {
  const navigate = useNavigate();
  const isEn = lang === "en";

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const checkStatus = async () => {
    try {
      setChecking(true);
      const data = await getCurrentUserAndRole();
      setUserData(data);

      if (data?.role === "worker") {
        if (!data?.isPaymentVerified) {
          navigate("/worker/payment", { replace: true });
          return;
        }
        if (data?.workerProfile?.approval_status === "approved") {
          navigate("/worker/dashboard", { replace: true });
          return;
        }
      }

      if (data?.workerProfile?.approval_status === "rejected") {
        setStatusMessage(
          isEn
            ? "Your application has been reviewed and was not approved at this time. Please contact support."
            : "మీ దరఖాస్తు ఆమోదించబడలేదు. దయచేసి సహాయ కేంద్రాన్ని సంప్రదించండి."
        );
      } else {
        setStatusMessage(
          isEn
            ? "Your application is still under review by our administration team."
            : "మీ దరఖాస్తు ఇంకా పరిశీలనలో ఉంది."
        );
      }
    } catch (err) {
      console.error("Error checking approval status:", err);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const wp = userData?.workerProfile;
  const profile = userData?.profile;

  return (
    <div className="auth-page-container">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      {/* Header */}
      <header className="auth-header-bar">
        <Link to="/login" className="auth-logo-row">
          <div className="brand-badge">
            <Sparkles size={22} color="#06b6d4" />
          </div>
          <div>
            <span className="auth-brand-name">
              WorkSphere <span style={{ color: "var(--teal-500)" }}>AI</span>
            </span>
            <span className="auth-brand-subtitle">
              {isEn ? "Worker Verification Portal" : "కార్మికుల ధృవీకరణ"}
            </span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ fontSize: "0.82rem", padding: "6px 12px", color: "#dc2626" }}
        >
          <LogOut size={14} />
          <span>{isEn ? "Sign Out" : "లాగౌట్"}</span>
        </button>
      </header>

      <main className="auth-card-wrapper">
        <div className="auth-form-card" style={{ maxWidth: "580px", textAlign: "center" }}>
          {/* Animated Clock / Status Icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#fffbeb",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              border: "3px solid #fef3c7",
              boxShadow: "0 4px 14px rgba(217, 119, 6, 0.15)",
            }}
          >
            <Clock size={36} />
          </div>

          <div
            className="status-badge status-pending"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "0.85rem",
              borderRadius: "9999px",
              margin: "0 auto 1rem",
              background: "#fffbeb",
              color: "#b45309",
              border: "1px solid #fde68a",
            }}
          >
            <Clock size={14} />
            <b>Application Status: Pending Admin Review</b>
          </div>

          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: "800",
              color: "var(--navy-900)",
              marginBottom: "0.75rem",
              lineHeight: "1.3",
            }}
          >
            {isEn
              ? "Your worker application is awaiting admin approval."
              : "మీ కార్మికుల దరఖాస్తు అడ్మిన్ ఆమోదం కోసం వేచి ఉంది."}
          </h1>

          <p
            style={{
              color: "var(--gray-600)",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
            }}
          >
            {isEn
              ? "Thank you for registering with WorkSphere AI. To maintain high service quality across Guntur & Vijayawada, an authorized administrator will review your professional experience and operating location before activating your artisan dashboard."
              : "ధన్యవాదాలు! నిర్వాహకులు మీ అనుభవాన్ని పరిశీలించి ఆమోదించిన తర్వాతే పోర్టల్ అందుబాటులోకి వస్తుంది."}
          </p>

          {/* Submitted Application Summary Card */}
          <div
            style={{
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "14px",
              padding: "1.25rem",
              textAlign: "left",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <b style={{ fontSize: "0.85rem", color: "var(--navy-900)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {isEn ? "Submitted Application Details" : "సమర్పించిన వివరాలు"}
              </b>
              <span style={{ fontSize: "0.75rem", color: "var(--teal-600)", background: "var(--teal-50)", padding: "2px 8px", borderRadius: "6px" }}>
                Under Review
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block", fontSize: "0.75rem" }}>Full Name</span>
                <b style={{ color: "var(--navy-900)" }}>{wp?.display_name || profile?.full_name || "Artisan Applicant"}</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block", fontSize: "0.75rem" }}>Email Account</span>
                <b style={{ color: "var(--navy-900)" }}>{userData?.user?.email || "—"}</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block", fontSize: "0.75rem" }}>Experience</span>
                <b style={{ color: "var(--navy-900)" }}>{wp?.experience_years ?? 1} Years</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block", fontSize: "0.75rem" }}>Operating Area</span>
                <b style={{ color: "var(--navy-900)" }}>{wp?.city || profile?.city || "Guntur"}</b>
              </div>
            </div>
          </div>

          {/* Dynamic feedback message */}
          {statusMessage && (
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
              {statusMessage}
            </p>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={checkStatus}
              disabled={checking}
              className="btn-primary"
              style={{ width: "100%", padding: "12px", backgroundColor: "#059669" }}
            >
              <RefreshCw size={16} className={checking ? "spin-icon" : ""} />
              <span>{checking ? (isEn ? "Checking Approval Status..." : "పరిశీలిస్తోంది...") : (isEn ? "Refresh Approval Status" : "స్టేటస్ రీఫ్రెష్ చేయండి")}</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ width: "100%", padding: "10px" }}
            >
              <LogOut size={15} />
              <span>{isEn ? "Sign Out / Switch Account" : "లాగౌట్ / వేరే ఖాతా"}</span>
            </button>

            <Link
              to="/login"
              style={{
                color: "var(--gray-500)",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "0.5rem",
              }}
            >
              <ArrowLeft size={14} />
              <span>{isEn ? "Back to Role Selection" : "రోల్ ఎంపికకు తిరిగి వెళ్లండి"}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
