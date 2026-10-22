import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { loginUser, verifyRoleAccess, resetPassword, logoutUser } from "../../lib/supabase";

export default function AdminLoginPage({ lang = "en" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEn = lang === "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mismatchData, setMismatchData] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ loading: false, msg: "", error: "" });

  useEffect(() => {
    if (location.state?.errorMsg) {
      setErrorMsg(location.state.errorMsg);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMismatchData(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg(isEn ? "Please enter both email and password." : "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ రెండూ నమోదు చేయండి.");
      return;
    }

    // Strictly enforce authorized admin email
    if (cleanEmail !== "ssunny143870@gmail.com") {
      setErrorMsg(
        isEn
          ? "Invalid administrator credentials or unauthorized account."
          : "చెల్లని అడ్మిన్ ఆధారాలు లేదా అనుమతి లేని ఖాతా."
      );
      return;
    }

    try {
      setLoading(true);
      const authData = await loginUser({ email: cleanEmail, password });
      const user = authData?.user;

      if (!user) {
        throw new Error("Unable to establish authentication session.");
      }

      // Check strictly for admin role
      const access = await verifyRoleAccess(user, "admin");

      if (!access.authorized) {
        // Role mismatch: Non-admin account
        await logoutUser();
        setMismatchData(access);
        setErrorMsg(access.message || "This account does not have administrator privileges.");
        return;
      }

      // Authorized admin -> redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMsg(
        err.message ||
          (isEn
            ? "Invalid email or password."
            : "తప్పు ఈమెయిల్ లేదా పాస్‌వర్డ్.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ loading: false, msg: "", error: "Please enter your email address." });
      return;
    }
    try {
      setForgotStatus({ loading: true, msg: "", error: "" });
      await resetPassword(forgotEmail.trim());
      setForgotStatus({
        loading: false,
        msg: "Password recovery link sent! Please check your email.",
        error: "",
      });
    } catch (err) {
      setForgotStatus({ loading: false, msg: "", error: err.message || "Failed to send reset email." });
    }
  };

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
              {isEn ? "Administrator Portal" : "నిర్వాహక పోర్టల్"}
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid #cbd5e1",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} />
            <span>{isEn ? "Back to Home" : "ల్యాండింగ్ పేజీ"}</span>
          </button>
          <Link to="/login" className="auth-back-link">
            <span>{isEn ? "Roles" : "రోల్స్"}</span>
          </Link>
        </div>
      </header>

      <main className="auth-card-wrapper">
        <div className="auth-form-card">
          <div className="auth-card-badge" style={{ background: "#eef2ff", color: "#6366f1" }}>
            <ShieldCheck size={14} />
            <span>{isEn ? "Restricted Access" : "సురక్షిత యాక్సెస్"}</span>
          </div>

          <h1 className="auth-card-title">{isEn ? "Admin Login" : "అడ్మిన్ లాగిన్"}</h1>
          <p className="auth-card-desc">
            {isEn
              ? "Sign in with verified administrator credentials to govern platform operations, worker approvals, and audits."
              : "ప్లాట్‌ఫారమ్ కార్యకలాపాలు మరియు కార్మికుల ఆమోదం కోసం లాగిన్ అవ్వండి."}
          </p>

          {/* Role Mismatch Error Notice */}
          {mismatchData && (
            <div className="auth-alert error" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={20} color="#e11d48" />
                <b style={{ color: "#9f1239" }}>
                  {isEn
                    ? "This account is not authorized for the selected portal. Please select the correct role."
                    : "ఈ ఖాతాకు అడ్మిన్ అధికారాలు లేవు. దయచేసి సరైన రోల్ ఎంచుకోండి."}
                </b>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#881337", margin: 0 }}>
                {isEn
                  ? `Your account has the '${mismatchData.actualRole}' role in user_roles. Administrator access requires explicit administrative authorization.`
                  : "ఈ ఖాతా అడ్మిన్ ఖాతా కాదు."}
              </p>
              <div style={{ marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => navigate(mismatchData.correctPath || "/login")}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  {isEn ? `Go to ${mismatchData.correctPortal === "worker" ? "Worker" : "Customer"} Login →` : "సరైన లాగిన్‌కు వెళ్లండి →"}
                </button>
              </div>
            </div>
          )}

          {/* Standard error banner */}
          {errorMsg && !mismatchData && (
            <div className="auth-alert error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="admin-email">{isEn ? "Admin Email Address" : "అడ్మిన్ ఈమెయిల్"}</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder={isEn ? "Enter administrator email" : "అడ్మిన్ ఈమెయిల్ నమోదు చేయండి"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="admin-password">{isEn ? "Password" : "పాస్‌వర్డ్"}</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotModalOpen(true);
                  }}
                  className="forgot-password-link"
                >
                  {isEn ? "Forgot Password?" : "పాస్‌వర్డ్ మర్చిపోయారా?"}
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isEn ? "Enter administrator password" : "పాస్‌వర్డ్ నమోదు చేయండి"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={{ backgroundColor: "#4f46e5" }}
            >
              {loading ? (
                <span>{isEn ? "Authenticating Administrator..." : "ధృవీకరిస్తోంది..."}</span>
              ) : (
                <>
                  <span>{isEn ? "Sign In to Admin Portal" : "అడ్మిన్‌గా లాగిన్"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="auth-card-footer-links">
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={14} />
              <span>{isEn ? "Back to Role Selection" : "రోల్ ఎంపికకు తిరిగి వెళ్లండి"}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {isEn ? "Reset Admin Password" : "అడ్మిన్ పాస్‌వర్డ్ రీసెట్"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: "1rem" }}>
              {isEn
                ? "Enter your administrator email to receive a recovery link."
                : "మీ ఈమెయిల్ నమోదు చేయండి."}
            </p>

            {forgotStatus.msg && (
              <div className="auth-alert success" style={{ marginBottom: "1rem" }}>
                <CheckCircle2 size={16} />
                <span>{forgotStatus.msg}</span>
              </div>
            )}

            {forgotStatus.error && (
              <div className="auth-alert error" style={{ marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{forgotStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="admin@worksphere.ai"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotStatus({ loading: false, msg: "", error: "" });
                  }}
                >
                  {isEn ? "Close" : "మూసివేయి"}
                </button>
                <button
                  type="submit"
                  disabled={forgotStatus.loading}
                  className="btn-primary"
                  style={{ backgroundColor: "#4f46e5" }}
                >
                  {forgotStatus.loading ? (isEn ? "Sending..." : "పంపిస్తోంది...") : (isEn ? "Send Link" : "లింక్ పంపండి")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
