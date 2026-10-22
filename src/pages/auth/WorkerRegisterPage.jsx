import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Wrench,
  Briefcase,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";
import { registerWorker, loginUser } from "../../lib/supabase";

const TRADE_OPTIONS = [
  "Wood Polisher",
  "Carpenter",
  "Plumber",
  "Electrician",
  "Painter",
  "AC & Appliance Repair",
  "Mason / Tiler",
  "Other Trade Professional"
];

export default function WorkerRegisterPage({ lang = "en" }) {
  const navigate = useNavigate();
  const isEn = lang === "en";

  // STRICTLY THE 7 FIELDS IN EXACT SPECIFIED ORDER:
  // 1. Full Name
  // 2. Email Address
  // 3. Password (with toggle)
  // 4. Professional / Trade
  // 5. Professional Experience (Years)
  // 6. Location / Operating Area
  // 7. Phone Number
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trade, setTrade] = useState("Wood Polisher");
  const [customTrade, setCustomTrade] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [location, setLocation] = useState("Guntur");
  const [phone, setPhone] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // Field validation
  const validate = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = isEn ? "Full Name is required." : "పూర్తి పేరు అవసరం.";
    }

    if (!email.trim()) {
      errors.email = isEn ? "Email Address is required." : "ఈమెయిల్ అవసరం.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = isEn ? "Please enter a valid email address." : "సరైన ఈమెయిల్ నమోదు చేయండి.";
    }

    if (!password) {
      errors.password = isEn ? "Password is required." : "పాస్‌వర్డ్ అవసరం.";
    } else if (password.length < 6) {
      errors.password = isEn
        ? "Password must be at least 6 characters."
        : "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.";
    }

    const effectiveTrade = trade === "Other Trade Professional" ? customTrade.trim() : trade;
    if (!effectiveTrade) {
      errors.trade = isEn ? "Professional / Trade is required." : "వృత్తి / ట్రేడ్ అవసరం.";
    }

    const exp = parseFloat(experienceYears);
    if (experienceYears === "" || isNaN(exp) || exp < 0 || exp > 60) {
      errors.experienceYears = isEn
        ? "Please enter your years of work experience between 0 and 60 (decimals allowed)."
        : "దయచేసి 0 నుండి 60 మధ్య మీ అనుభవ సంవత్సరాలు నమోదు చేయండి.";
    }

    if (!location.trim()) {
      errors.location = isEn ? "Location / Operating Area is required." : "ప్రాంతం అవసరం.";
    }

    const cleanPhone = (phone || "").replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errors.phone = isEn ? "Phone Number is required." : "ఫోన్ నంబర్ అవసరం.";
    } else if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      errors.phone = isEn
        ? "Please enter a valid 10-15 digit phone number."
        : "దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validate()) return;

    const effectiveTrade = trade === "Other Trade Professional" ? customTrade.trim() : trade;

    try {
      setLoading(true);
      await registerWorker({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        trade: effectiveTrade,
        experienceYears: parseFloat(experienceYears),
        location: location.trim(),
        phone: phone.trim(),
      });

      // Auto sign-in worker so session is established
      try {
        await loginUser({ email: email.trim(), password });
      } catch (loginErr) {
        console.warn("Auto sign-in note:", loginErr);
      }

      // Open workers dashboard immediately
      navigate("/worker/dashboard");
    } catch (err) {
      console.error("Worker registration error:", err);
      setErrorMsg(
        err.message ||
          (isEn
            ? "Worker registration failed. Please review the details and try again."
            : "రిజిస్ట్రేషన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.")
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE VIEW
  if (successData) {
    return (
      <div className="auth-page-container">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />

        <div className="auth-form-card" style={{ maxWidth: "560px", textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              border: "2px solid #a7f3d0",
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <div className="status-badge status-pending" style={{ display: "inline-flex", margin: "0 auto 0.75rem" }}>
            <Clock size={14} />
            <span>Application Status: Pending Approval</span>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--navy-900)", marginBottom: "0.5rem" }}>
            {isEn ? "Worker Application Submitted!" : "కార్మికుల దరఖాస్తు సమర్పించబడింది!"}
          </h2>

          <p style={{ color: "var(--gray-600)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            {isEn
              ? `Thank you, ${fullName}! Your application as ${successData.trade} has been registered with pending status. An authorized WorkSphere AI administrator will review your experience and operating location before granting artisan dashboard access.`
              : `ధన్యవాదాలు, ${fullName}! మీ దరఖాస్తు పెండింగ్‌లో ఉంది. నిర్వాహకులు పరిశీలించి ఆమోదిస్తారు.`}
          </p>

          <div
            style={{
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "12px",
              padding: "1rem",
              textAlign: "left",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block" }}>Full Name</span>
                <b style={{ color: "var(--navy-900)" }}>{fullName}</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block" }}>Professional Trade</span>
                <b style={{ color: "var(--navy-900)" }}>{successData.trade}</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block" }}>Registered Email</span>
                <b style={{ color: "var(--navy-900)" }}>{email}</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block" }}>Experience</span>
                <b style={{ color: "var(--navy-900)" }}>{experienceYears} Years</b>
              </div>
              <div>
                <span style={{ color: "var(--gray-500)", display: "block" }}>Location</span>
                <b style={{ color: "var(--navy-900)" }}>{location}</b>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={() => navigate("/worker/login")}
              className="btn-primary"
              style={{ width: "100%", padding: "12px", backgroundColor: "#059669" }}
            >
              <span>{isEn ? "Proceed to Worker Login" : "కార్మికుల లాగిన్‌కు వెళ్లండి"}</span>
              <ArrowRight size={16} />
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
              }}
            >
              <ArrowLeft size={14} />
              <span>{isEn ? "Back to Role Selection" : "రోల్ ఎంపికకు తిరిగి వెళ్లండి"}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      {/* Top Header */}
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
              {isEn ? "Worker / Artisan Registration" : "కార్మికుల రిజిస్ట్రేషన్"}
            </span>
          </div>
        </Link>

        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={16} />
          <span>{isEn ? "All Portals" : "అన్ని పోర్టల్‌లు"}</span>
        </Link>
      </header>

      {/* Registration Card */}
      <main className="auth-card-wrapper">
        <div className="auth-form-card">
          <div className="auth-card-badge" style={{ background: "#ecfdf5", color: "#059669" }}>
            <Briefcase size={14} />
            <span>{isEn ? "Worker Onboarding" : "కార్మికుల చేరిక"}</span>
          </div>

          <h1 className="auth-card-title">{isEn ? "Register as Worker" : "కార్మికుడిగా నమోదు చేసుకోండి"}</h1>
          <p className="auth-card-desc">
            {isEn
              ? "Join Guntur & Vijayawada's verified artisan network. Claim direct job requests with zero commission."
              : "గుంటూరు & విజయవాడ నెట్‌వర్క్‌లో చేరి నేరుగా పనులను స్వీకరించండి."}
          </p>

          {/* Global error banner */}
          {errorMsg && (
            <div className="auth-alert error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form containing the 7 fields in exact specified order */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Field 1: Full Name */}
            <div className="form-group">
              <label htmlFor="worker-fullName">
                1. {isEn ? "Full Name" : "పూర్తి పేరు"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="worker-fullName"
                  type="text"
                  placeholder={isEn ? "e.g. Santhapurapu Koteswararao" : "మీ పూర్తి పేరు"}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  className={fieldErrors.fullName ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
            </div>

            {/* Field 2: Email Address */}
            <div className="form-group">
              <label htmlFor="worker-email">
                2. {isEn ? "Email Address" : "ఈమెయిల్ చిరునామా"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="worker-email"
                  type="email"
                  placeholder={isEn ? "e.g. artisan@worksphere.ai" : "మీ ఈమెయిల్"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={fieldErrors.email ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
            </div>

            {/* Field 3: Password with show/hide toggle */}
            <div className="form-group">
              <label htmlFor="worker-password">
                3. {isEn ? "Password" : "పాస్‌వర్డ్"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="worker-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isEn ? "Minimum 6 characters" : "కనీసం 6 అక్షరాలు"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={fieldErrors.password ? "input-error" : ""}
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
              {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
            </div>

            {/* Field 4: Professional / Trade */}
            <div className="form-group">
              <label htmlFor="worker-trade">
                4. {isEn ? "Professional / Trade" : "వృత్తి / ట్రేడ్"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Wrench size={18} className="input-icon" />
                <select
                  id="worker-trade"
                  value={trade}
                  onChange={(e) => {
                    setTrade(e.target.value);
                    if (fieldErrors.trade) setFieldErrors((p) => ({ ...p, trade: "" }));
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 38px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--gray-200)",
                    fontSize: "0.9rem",
                    color: "var(--gray-900)",
                    background: "var(--white)",
                  }}
                  required
                >
                  {TRADE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {trade === "Other Trade Professional" && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Specify your trade or craft"
                    value={customTrade}
                    onChange={(e) => setCustomTrade(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid var(--gray-200)",
                      fontSize: "0.85rem",
                    }}
                    required
                  />
                </div>
              )}
              {fieldErrors.trade && <span className="field-error-text">{fieldErrors.trade}</span>}
            </div>

            {/* Field 5: Professional Experience (Years) */}
            <div className="form-group">
              <label htmlFor="worker-experience">
                5. {isEn ? "Professional Experience (Years)" : "వృత్తిపరమైన అనుభవం (సంవత్సరాలు)"}{" "}
                <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <input
                  id="worker-experience"
                  type="number"
                  step="0.5"
                  min="0"
                  max="60"
                  placeholder={isEn ? "e.g. 5 or 3.5" : "ఉదా. 5 లేదా 3.5"}
                  value={experienceYears}
                  onChange={(e) => {
                    setExperienceYears(e.target.value);
                    if (fieldErrors.experienceYears) setFieldErrors((p) => ({ ...p, experienceYears: "" }));
                  }}
                  className={fieldErrors.experienceYears ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.experienceYears && (
                <span className="field-error-text">{fieldErrors.experienceYears}</span>
              )}
            </div>

            {/* Field 6: Location / Operating Area */}
            <div className="form-group">
              <label htmlFor="worker-location">
                6. {isEn ? "Location / Operating Area" : "ప్రాంతం / నగర పరిధి"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input
                  id="worker-location"
                  type="text"
                  placeholder={isEn ? "e.g. Arundelpet, Guntur or Vijayawada" : "ఉదా. అరుండెల్‌పేట, గుంటూరు"}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (fieldErrors.location) setFieldErrors((p) => ({ ...p, location: "" }));
                  }}
                  className={fieldErrors.location ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
            </div>

            {/* Field 7: Phone Number */}
            <div className="form-group">
              <label htmlFor="worker-phone">
                7. {isEn ? "Phone Number" : "ఫోన్ నంబర్"} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  id="worker-phone"
                  type="tel"
                  placeholder={isEn ? "e.g. 9876543210" : "10 అంకెల ఫోన్ నంబర్"}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={fieldErrors.phone ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.phone && <span className="field-error-text">{fieldErrors.phone}</span>}
            </div>

            {/* Notice about Approval Requirement */}
            <div className="auth-info-box">
              <Clock size={16} color="#059669" />
              <span>
                {isEn
                  ? "Applications are submitted with pending status. An administrator verifies experience and trade credentials prior to worker portal activation."
                  : "దరఖాస్తులు పెండింగ్ హోదాలో సమర్పించబడతాయి. నిర్వాహకులు పరిశీలించి ఆమోదిస్తారు."}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={{ backgroundColor: "#059669" }}
            >
              {loading ? (
                <span>{isEn ? "Submitting Application..." : "సమర్పిస్తోంది..."}</span>
              ) : (
                <>
                  <span>{isEn ? "Register as Worker" : "కార్మికుడిగా నమోదు చేయండి"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link: Already registered? Login */}
          <div className="auth-card-footer-links">
            <span>{isEn ? "Already registered?" : "ఇప్పటికే ఖాతా ఉందా?"}</span>
            <Link to="/worker/login" className="auth-text-link">
              <b>{isEn ? "Login" : "లాగిన్ అవ్వండి"}</b>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
