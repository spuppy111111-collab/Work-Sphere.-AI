import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MapPin
} from "lucide-react";
import {
  loginUser,
  registerCustomer,
  verifyRoleAccess,
  resetPassword,
  logoutUser
} from "../../lib/supabase";

export default function CustomerLoginPage({ lang = "en", defaultMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEn = lang === "en";

  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Guntur");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mismatchData, setMismatchData] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ loading: false, msg: "", error: "" });

  useEffect(() => {
    if (defaultMode) {
      setMode(defaultMode);
    }
    if (location.state?.errorMsg) {
      setErrorMsg(location.state.errorMsg);
    }
  }, [defaultMode, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMismatchData(null);

    if (!email.trim() || !password) {
      setErrorMsg(isEn ? "Please enter both email and password." : "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ రెండూ నమోదు చేయండి.");
      return;
    }

    try {
      setLoading(true);
      const authData = await loginUser({ email: email.trim(), password });
      const user = authData?.user;

      if (!user) {
        throw new Error("Unable to establish authentication session.");
      }

      // Check role authorization for customer portal
      const access = await verifyRoleAccess(user, "customer");

      if (!access.authorized) {
        await logoutUser();
        setMismatchData(access);
        setErrorMsg(access.message || (isEn ? "Customer access denied." : "కస్టమర్ అనుమతి నిరాకరించబడింది."));
        return;
      }

      // Authorized -> navigate to customer dashboard (preserving draft if pending)
      const hasDraft = !!(sessionStorage.getItem("ws_pending_booking_draft") || localStorage.getItem("ws_pending_booking_draft"));
      navigate("/customer/dashboard", { state: { restoreBookingDraft: hasDraft } });
    } catch (err) {
      console.error("Customer login error:", err);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate Full Name
    if (!fullName.trim()) {
      setErrorMsg(isEn ? "Full Name is required." : "పూర్తి పేరు నమోదు చేయండి.");
      return;
    }

    // Validate Email Address
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(isEn ? "Please enter a valid email address." : "సరైన ఈమెయిల్ నమోదు చేయండి.");
      return;
    }

    // Validate Password
    if (!password || password.length < 6) {
      setErrorMsg(isEn ? "Password must be at least 6 characters." : "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.");
      return;
    }

    // Validate Phone Number
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone || !/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setErrorMsg(isEn ? "Please enter a valid 10-digit phone number." : "దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి.");
      return;
    }

    // Validate Location
    if (!city.trim()) {
      setErrorMsg(isEn ? "Location is required." : "దయచేసి మీ ప్రాంతాన్ని నమోదు చేయండి.");
      return;
    }

    try {
      setLoading(true);
      const regData = await registerCustomer({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: city.trim(),
      });

      const hasDraft = !!(sessionStorage.getItem("ws_pending_booking_draft") || localStorage.getItem("ws_pending_booking_draft"));

      // If active session is returned directly, proceed to dashboard
      if (regData?.session?.user) {
        navigate("/customer/dashboard", { state: { restoreBookingDraft: hasDraft } });
        return;
      }

      // Auto sign in and proceed
      const authData = await loginUser({ email: email.trim(), password });
      if (authData?.user) {
        navigate("/customer/dashboard", { state: { restoreBookingDraft: hasDraft } });
      }
    } catch (err) {
      console.error("Customer registration error:", err);
      if (err.message?.toLowerCase().includes("already registered")) {
        setErrorMsg(
          isEn
            ? "This email is already registered. Please sign in with your password."
            : "ఈ ఈమెయిల్ ఇప్పటికే నమోదై ఉంది. దయచేసి లాగిన్ అవ్వండి."
        );
      } else {
        setErrorMsg(err.message || "Failed to create account. Please try again.");
      }
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
              {isEn ? "Customer Service Portal" : "కస్టమర్ పోర్టల్"}
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
          <div className="auth-card-badge" style={{ background: "#ecfeff", color: "#0891b2" }}>
            <User size={14} />
            <span>{isEn ? "Customer Account" : "కస్టమర్ ఖాతా"}</span>
          </div>

          <h1 className="auth-card-title">
            {mode === "login"
              ? isEn
                ? "Customer Login"
                : "కస్టమర్ లాగిన్"
              : isEn
              ? "Create Customer Account"
              : "కస్టమర్ ఖాతా తెరవండి"}
          </h1>
          <p className="auth-card-desc">
            {mode === "login"
              ? isEn
                ? "Sign in to book local trades, track active requests, and manage your home services."
                : "స్థానిక సేవలను బుక్ చేసుకోవడానికి మీ ఖాతాలోకి ప్రవేశించండి."
              : isEn
              ? "Book verified local artisans across Guntur & Vijayawada with zero upfront charges."
              : "గుంటూరు మరియు విజయవాడలో నమ్మకమైన సేవలను బుక్ చేసుకోండి."}
          </p>

          {/* Mode Switcher */}
          <div className="auth-mode-tabs" style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
            <button
              type="button"
              className={`role-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setMismatchData(null);
              }}
              style={{ flex: 1, padding: "8px", fontSize: "0.85rem" }}
            >
              {isEn ? "Sign In" : "లాగిన్"}
            </button>
            <button
              type="button"
              className={`role-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setErrorMsg("");
                setMismatchData(null);
              }}
              style={{ flex: 1, padding: "8px", fontSize: "0.85rem" }}
            >
              {isEn ? "New Customer" : "కొత్త ఖాతా"}
            </button>
          </div>

          {/* Role Mismatch Error Notice */}
          {mismatchData && (
            <div className="auth-alert error" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={20} color="#e11d48" />
                <b style={{ color: "#9f1239" }}>
                  {isEn
                    ? "This account is not authorized for the selected portal. Please select the correct role."
                    : "ఈ ఖాతాకు ఈ పోర్టల్ యాక్సెస్ లేదు. దయచేసి సరైన రోల్ ఎంచుకోండి."}
                </b>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#881337", margin: 0 }}>
                {isEn
                  ? "This email is registered as an artisan / worker. Please log in through the Worker Portal."
                  : "ఈ ఖాతా కార్మికుల పోర్టల్ కోసం నమోదై ఉంది."}
              </p>
              <div style={{ marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => navigate(mismatchData.correctPath || "/worker/login")}
                  className="btn-primary"
                  style={{ fontSize: "0.82rem", padding: "6px 14px", backgroundColor: "#059669" }}
                >
                  {isEn ? "Go to Worker Login →" : "కార్మికుల లాగిన్‌కు వెళ్లండి →"}
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

          {/* Booking draft notice */}
          {(sessionStorage.getItem("ws_pending_booking_draft") || localStorage.getItem("ws_pending_booking_draft")) && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#065f46",
                fontSize: "0.85rem",
              }}
            >
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
              <span>
                {isEn
                  ? "Your booking details are safely saved. Sign in or register to submit your service request."
                  : "మీ బుకింగ్ వివరాలు భద్రపరచబడ్డాయి. సమర్పించడానికి దయచేసి సైన్ ఇన్ అవ్వండి."}
              </span>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="customer-email">{isEn ? "Email Address" : "ఈమెయిల్ చిరునామా"}</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="customer-email"
                    type="email"
                    placeholder={isEn ? "Enter your email" : "మీ ఈమెయిల్ నమోదు చేయండి"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="customer-password">{isEn ? "Password" : "పాస్‌వర్డ్"}</label>
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
                    id="customer-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isEn ? "Enter your password" : "పాస్‌వర్డ్ నమోదు చేయండి"}
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
                style={{ backgroundColor: "#0891b2" }}
              >
                {loading ? (
                  <span>{isEn ? "Signing In..." : "లాగిన్ అవుతోంది..."}</span>
                ) : (
                  <>
                    <span>{isEn ? "Sign In as Customer" : "కస్టమర్‌గా లాగిన్"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "var(--gray-600)" }}>
                <span>{isEn ? "Don't have an account?" : "ఖాతా లేదా?"} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg("");
                    setMismatchData(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0891b2",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.85rem",
                    padding: 0,
                  }}
                >
                  {isEn ? "Register as Customer" : "కస్టమర్‌గా నమోదు చేసుకోండి"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              {/* 1. Full Name */}
              <div className="form-group">
                <label htmlFor="customer-reg-name">
                  1. {isEn ? "Full Name" : "పూర్తి పేరు"} <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="customer-reg-name"
                    type="text"
                    placeholder={isEn ? "e.g. Anitha Rao" : "మీ పూర్తి పేరు"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div className="form-group">
                <label htmlFor="customer-reg-email">
                  2. {isEn ? "Email Address" : "ఈమెయిల్ చిరునామా"} <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="customer-reg-email"
                    type="email"
                    placeholder="customer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 3. Password with toggle */}
              <div className="form-group">
                <label htmlFor="customer-reg-pass">
                  3. {isEn ? "Password" : "పాస్‌వర్డ్"} <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="customer-reg-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={isEn ? "At least 6 characters" : "కనీసం 6 అక్షరాలు"}
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

              {/* 4. Phone Number */}
              <div className="form-group">
                <label htmlFor="customer-reg-phone">
                  4. {isEn ? "Phone Number" : "ఫోన్ నంబర్"} <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="customer-reg-phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 5. Location */}
              <div className="form-group">
                <label htmlFor="customer-reg-city">
                  5. {isEn ? "Location" : "ప్రాంతం"} <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    id="customer-reg-city"
                    type="text"
                    placeholder="Guntur / Arundelpet / Vijayawada"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
                style={{ backgroundColor: "#0891b2" }}
              >
                {loading ? (
                  <span>{isEn ? "Creating Account..." : "ఖాతా తెరవబడుతోంది..."}</span>
                ) : (
                  <>
                    <span>{isEn ? "Create Customer Account" : "ఖాతా తెరవండి"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "var(--gray-600)" }}>
                <span>{isEn ? "Already have an account?" : "ఇప్పటికే ఖాతా ఉందా?"} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                    setMismatchData(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0891b2",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.85rem",
                    padding: 0,
                  }}
                >
                  {isEn ? "Sign In" : "లాగిన్ అవ్వండి"}
                </button>
              </div>
            </form>
          )}

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
              {isEn ? "Reset Customer Password" : "పాస్‌వర్డ్ రీసెట్"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: "1rem" }}>
              {isEn
                ? "Enter your customer email to receive a password reset link."
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
                  placeholder="customer@gmail.com"
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
                  style={{ backgroundColor: "#0891b2" }}
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
