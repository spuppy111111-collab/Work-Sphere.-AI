import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut
} from "lucide-react";
import {
  loginUser,
  registerCustomer,
  resetPassword,
  getCurrentUserAndRole
} from "../lib/supabase";

export default function AuthLoginScreen({ isOpen, onClose, onAuthSuccess, lang = "en" }) {
  if (!isOpen) return null;

  const isEn = lang === "en";
  const [tab, setTab] = useState("login"); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Guntur");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setErrorMsg(isEn ? "Please provide both email and password." : "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ రెండూ నమోదు చేయండి.");
      return;
    }

    try {
      setLoading(true);
      await loginUser({ email, password });
      const userAndRole = await getCurrentUserAndRole();
      setSuccessMsg(isEn ? "Logged in successfully!" : "విజయవంతంగా లాగిన్ అయ్యారు!");
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(userAndRole);
        onClose();
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || (isEn ? "Failed to log in. Please check credentials." : "లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!fullName.trim()) {
      setErrorMsg(isEn ? "Please enter your full name." : "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg(isEn ? "Please enter a valid email address." : "దయచేసి సరైన ఈమెయిల్ నమోదు చేయండి.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isEn ? "Password must be at least 6 characters." : "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(isEn ? "Passwords do not match." : "పాస్‌వర్డ్‌లు సరిపోలడం లేదు.");
      return;
    }

    try {
      setLoading(true);
      await registerCustomer({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: city.trim() || "Guntur",
      });

      // Fetch newly restored session & role
      const userAndRole = await getCurrentUserAndRole();
      setSuccessMsg(
        isEn
          ? "Account created successfully! Welcome to WorkSphere."
          : "ఖాతా విజయవంతంగా సృష్టించబడింది! వర్క్‌స్పియర్‌కి స్వాగతం."
      );
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(userAndRole);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || (isEn ? "Failed to create account." : "ఖాతా సృష్టించడం విఫలమైంది."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setErrorMsg(isEn ? "Please enter your registered email address." : "దయచేసి మీ నమోదిత ఈమెయిల్‌ను నమోదు చేయండి.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());
      setSuccessMsg(
        isEn
          ? "Password reset link sent to your email. Please check your inbox."
          : "పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్‌కు పంపబడింది."
      );
    } catch (err) {
      console.error("Reset error:", err);
      setErrorMsg(err.message || (isEn ? "Failed to send reset link." : "రీసెట్ లింక్ పంపడంలో లోపం ఏర్పడింది."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: "480px",
          width: "90%",
          padding: "2rem",
          borderRadius: "16px",
          position: "relative",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0891b2, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 0.75rem",
              boxShadow: "0 8px 16px rgba(8, 145, 178, 0.25)",
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
            WorkSphere AI
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            {isEn
              ? "Local Service Marketplace • Supabase Auth"
              : "స్థానిక సర్వీస్ మార్కెట్‌ప్లేస్ • సురక్షిత లాగిన్"}
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-subtle, #f1f5f9)",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab("login");
              resetMessages();
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: tab === "login" ? "#fff" : "transparent",
              color: tab === "login" ? "#0f172a" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: tab === "login" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            {isEn ? "Sign In" : "లాగిన్"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              resetMessages();
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: tab === "register" ? "#fff" : "transparent",
              color: tab === "register" ? "#0f172a" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: tab === "register" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            {isEn ? "Register" : "రిజిస్ట్రేషన్"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("forgot");
              resetMessages();
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: tab === "forgot" ? "#fff" : "transparent",
              color: tab === "forgot" ? "#0f172a" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: tab === "forgot" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            {isEn ? "Reset" : "రీసెట్"}
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab: LOGIN */}
        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                {isEn ? "Email Address" : "ఈమెయిల్ అడ్రస్"}
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {isEn ? "Password" : "పాస్‌వర్డ్"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot");
                    resetMessages();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0891b2",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {isEn ? "Forgot password?" : "పాస్‌వర్డ్ మర్చిపోయారా?"}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
              }}
            >
              {loading ? (isEn ? "Signing in..." : "లాగిన్ అవుతోంది...") : (isEn ? "Sign In to Account" : "లాగిన్ చేయండి")}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {/* Tab: REGISTER */}
        {tab === "register" && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                {isEn ? "Full Name" : "పూర్తి పేరు"}
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  required
                  placeholder={isEn ? "e.g. Ramesh Kumar" : "ఉదా: రమేష్ కుమార్"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px", marginBottom: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                  {isEn ? "Email Address" : "ఈమెయిల్"}
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                  {isEn ? "Phone Number" : "ఫోన్ నెంబర్"}
                </label>
                <input
                  type="tel"
                  placeholder="9848012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                {isEn ? "City / Locality" : "నగరం / ప్రాంతం"}
              </label>
              <div style={{ position: "relative" }}>
                <MapPin
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Guntur (Brodipet, Arundelpet, etc.)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                  {isEn ? "Password" : "పాస్‌వర్డ్"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                  {isEn ? "Confirm" : "నిర్ధారించండి"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
              }}
            >
              {loading ? (isEn ? "Creating Account..." : "ఖాతా సృష్టిస్తోంది...") : (isEn ? "Complete Registration" : "రిజిస్ట్రేషన్ పూర్తి చేయండి")}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {/* Tab: FORGOT PASSWORD */}
        {tab === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              {isEn
                ? "Enter your registered email address and we'll send you a secure link to reset your password via Supabase Auth."
                : "మీ నమోదిత ఈమెయిల్‌ను నమోదు చేయండి. సురక్షితమైన పాస్‌వర్డ్ రీసెట్ లింక్‌ను పంపుతాము."}
            </p>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
                {isEn ? "Email Address" : "ఈమెయిల్ అడ్రస్"}
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
              }}
            >
              <KeyRound size={16} />
              {loading ? (isEn ? "Sending Link..." : "లింక్ పంపుతోంది...") : (isEn ? "Send Password Reset Link" : "రీసెట్ లింక్ పంపండి")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
