import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Clock,
  ArrowLeft,
  Wrench,
  CheckCircle2,
  LogOut,
  ShieldCheck
} from "lucide-react";
import {
  loginUser,
  verifyRoleAccess,
  resetPassword,
  logoutUser,
  getCurrentUserAndRole
} from "../../lib/supabase";

export default function WorkerLoginPage({ lang = "en" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEn = lang === "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCustomerAccount, setIsCustomerAccount] = useState(false);
  const [isAdminAccount, setIsAdminAccount] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ loading: false, msg: "", error: "" });

  // Check incoming redirect state or existing session on mount
  useEffect(() => {
    let isMounted = true;

    async function evaluateState() {
      // 1. Check if error message was passed via navigation state (e.g. from ProtectedRoute)
      if (location.state?.errorMsg) {
        if (!isMounted) return;
        setErrorMsg(location.state.errorMsg);
        if (location.state.actualRole === "customer") {
          setIsCustomerAccount(true);
        } else if (location.state.actualRole === "admin") {
          setIsAdminAccount(true);
        }
      }

      // 2. Check current Supabase session
      try {
        const authData = await getCurrentUserAndRole();
        if (!isMounted) return;

        if (authData?.user) {
          if (authData.role === "worker") {
            if (authData.isIncomplete) {
              navigate("/worker/register", { replace: true });
            } else if (!authData.isPaymentVerified) {
              navigate("/worker/payment", { replace: true });
            } else if (!authData.isApproved) {
              navigate("/worker/pending", { replace: true });
            } else {
              navigate("/worker/dashboard", { replace: true });
            }
          } else if (authData.role === "customer") {
            setIsCustomerAccount(true);
            setErrorMsg(
              location.state?.errorMsg ||
                "This account is registered as a customer. Please use worker login with your worker account."
            );
          } else if (authData.role === "admin") {
            setIsAdminAccount(true);
            setErrorMsg(
              location.state?.errorMsg ||
                "This account is registered as an Administrator. Please use the Admin Portal."
            );
          }
        }
      } catch (err) {
        console.warn("WorkerLoginPage session check notice:", err);
      }
    }

    evaluateState();

    return () => {
      isMounted = false;
    };
  }, [location.state, navigate]);

  const handleSignOutCustomer = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setIsCustomerAccount(false);
      setIsAdminAccount(false);
      setErrorMsg("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsCustomerAccount(false);
    setIsAdminAccount(false);
    setIsPendingApproval(false);

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

      // Fetch actual role from database & verify role access for worker portal
      const access = await verifyRoleAccess(user, "worker");

      // Handle role mismatches cleanly and distinctly
      if (!access.authorized) {
        await logoutUser();

        if (access.actualRole === "customer") {
          setIsCustomerAccount(true);
          setErrorMsg("This account is registered as a customer. Please use worker login with your worker account.");
          return;
        }

        if (access.actualRole === "admin") {
          setIsAdminAccount(true);
          setErrorMsg("This account is registered as an Administrator. Please use the Admin Portal login.");
          return;
        }

        // If worker profile is incomplete
        if (access.reason === "incomplete_profile") {
          navigate("/worker/register", { replace: true });
          return;
        }

        // If registration fee payment is not verified
        if (!access.isPaymentVerified || access.reason?.includes("payment")) {
          navigate("/worker/payment", { replace: true });
          return;
        }

        // If worker application is pending approval
        if (access.isPending || !access.isApproved) {
          navigate("/worker/pending", { replace: true });
          return;
        }

        setErrorMsg(access.message || (isEn ? "Worker access denied." : "కార్మికుల అనుమతి నిరాకరించబడింది."));
        return;
      }

      // Verified worker role! Navigate to worker dashboard
      navigate("/worker/dashboard", { replace: true });
    } catch (err) {
      console.error("Worker login error:", err);
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
              {isEn ? "Worker / Artisan Portal" : "కార్మికుల పోర్టల్"}
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
          <div className="auth-card-badge" style={{ background: "#ecfdf5", color: "#059669" }}>
            <Wrench size={14} />
            <span>{isEn ? "Artisan Login" : "కార్మికుల లాగిన్"}</span>
          </div>

          <h1 className="auth-card-title">{isEn ? "Worker Login" : "కార్మికుల లాగిన్"}</h1>
          <p className="auth-card-desc">
            {isEn
              ? "Sign in to accept new service requests, view your active jobs, and manage your local bookings."
              : "కొత్త పనులను స్వీకరించడానికి మరియు మీ వివరాలను చూడటానికి లాగిన్ అవ్వండి."}
          </p>

          {/* Pending Approval Notice */}
          {isPendingApproval && (
            <div className="auth-alert warning" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={20} color="#d97706" />
                <b style={{ color: "#92400e" }}>
                  {isEn ? "Your worker application is awaiting admin approval." : "మీ దరఖాస్తు అడ్మిన్ ఆమోదం కోసం వేచి ఉంది."}
                </b>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#78350f", margin: 0 }}>
                {isEn
                  ? "Our administration team reviews qualifications before granting worker access. You cannot access worker features until approved."
                  : "నిర్వాహకులు పరిశీలించి ఆమోదించిన తర్వాతే పోర్టల్ అందుబాటులోకి వస్తుంది."}
              </p>
              <div style={{ marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/worker/pending")}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  {isEn ? "View Detailed Application Status →" : "దరఖాస్తు వివరాలు చూడండి →"}
                </button>
              </div>
            </div>
          )}

          {/* Admin Role Mismatch Alert Notice */}
          {isAdminAccount && (
            <div className="auth-alert error" style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fef3c7", borderColor: "#f59e0b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} color="#d97706" />
                <b style={{ color: "#92400e" }}>
                  This account is registered as an Administrator.
                </b>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#78350f", margin: 0 }}>
                {isEn
                  ? "Administrator accounts cannot access the Worker Portal. Please sign in through the Admin Portal."
                  : "అడ్మినిస్ట్రేటర్ ఖాతాలకు వర్కర్ పోర్టల్ యాక్సెస్ ఉండదు. దయచేసి అడ్మిన్ పోర్టల్ ద్వారా లాగిన్ అవ్వండి."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/admin/login")}
                  className="btn-primary"
                  style={{ fontSize: "0.82rem", padding: "6px 14px", background: "#d97706" }}
                >
                  {isEn ? "Go to Admin Login →" : "అడ్మిన్ లాగిన్‌కు వెళ్లండి →"}
                </button>
                <button
                  type="button"
                  onClick={handleSignOutCustomer}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "6px 12px", borderColor: "#cbd5e1" }}
                >
                  <LogOut size={13} style={{ marginRight: "4px" }} />
                  {isEn ? "Sign Out & Try Another Account" : "లాగౌట్ చేయండి"}
                </button>
              </div>
            </div>
          )}

          {/* Customer Role Mismatch Alert Notice */}
          {isCustomerAccount && (
            <div className="auth-alert error" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={20} color="#e11d48" />
                <b style={{ color: "#9f1239" }}>
                  This account is registered as a customer. Please use worker login with your worker account.
                </b>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#881337", margin: 0 }}>
                {isEn
                  ? "Customer accounts cannot access the Worker Portal. If you wish to provide services, you must register as a worker or sign in with your worker credentials."
                  : "కస్టమర్ ఖాతాకు వర్కర్ పోర్టల్ యాక్సెస్ లేదు. దయచేసి మీ వర్కర్ ఖాతాతో లాగిన్ అవ్వండి లేదా కొత్త వర్కర్‌గా నమోదు చేసుకోండి."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/customer/login")}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  {isEn ? "Go to Customer Login" : "కస్టమర్ లాగిన్‌కు వెళ్లండి"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/worker/register")}
                  className="btn-primary"
                  style={{ fontSize: "0.82rem", padding: "6px 12px", backgroundColor: "#059669" }}
                >
                  {isEn ? "Register as Worker" : "కార్మికుడిగా నమోదు చేసుకోండి"}
                </button>
                <button
                  type="button"
                  onClick={handleSignOutCustomer}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "6px 12px", borderColor: "#cbd5e1" }}
                >
                  <LogOut size={13} style={{ marginRight: "4px" }} />
                  {isEn ? "Sign Out & Try Again" : "లాగౌట్ చేసి మళ్లీ ప్రయత్నించండి"}
                </button>
              </div>
            </div>
          )}

          {/* Standard error banner */}
          {errorMsg && !isCustomerAccount && !isAdminAccount && !isPendingApproval && (
            <div className="auth-alert error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="worker-login-email">{isEn ? "Email Address" : "ఈమెయిల్ చిరునామా"}</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="worker-login-email"
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
                <label htmlFor="worker-login-password">{isEn ? "Password" : "పాస్‌వర్డ్"}</label>
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
                  id="worker-login-password"
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
              style={{ backgroundColor: "#059669" }}
            >
              {loading ? (
                <span>{isEn ? "Verifying Credentials..." : "ధృవీకరిస్తోంది..."}</span>
              ) : (
                <>
                  <span>{isEn ? "Sign In as Worker" : "కార్మికుడిగా లాగిన్"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Links: Register as Worker & Back to Role Selection */}
          <div className="auth-card-footer-links" style={{ flexDirection: "column", gap: "10px" }}>
            <div>
              <span>{isEn ? "New artisan?" : "కొత్త కార్మికులా?"}</span>{" "}
              <Link to="/worker/register" className="auth-text-link" style={{ color: "#059669" }}>
                <b>{isEn ? "Register as Worker" : "కార్మికుడిగా నమోదు చేసుకోండి"}</b>
              </Link>
            </div>

            <div>
              <Link to="/login" className="auth-back-link" style={{ justifyContent: "center" }}>
                <ArrowLeft size={14} />
                <span>{isEn ? "Back to Role Selection" : "రోల్ ఎంపికకు తిరిగి వెళ్లండి"}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {isEn ? "Reset Worker Password" : "పాస్‌వర్డ్ రీసెట్"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: "1rem" }}>
              {isEn
                ? "Enter your registered email address to receive password reset instructions."
                : "మీ రిజిస్టర్డ్ ఈమెయిల్ నమోదు చేయండి."}
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
                  placeholder="worker@worksphere.ai"
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
                  style={{ backgroundColor: "#059669" }}
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
