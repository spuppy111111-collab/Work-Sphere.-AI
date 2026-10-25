import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  LogOut
} from "lucide-react";
import { loginUser, getCurrentUserAndRole, logoutUser } from "../../lib/supabase";

export default function RoleSelectionPage({ lang = "en" }) {
  const navigate = useNavigate();
  const [quickLoading, setQuickLoading] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const isEn = lang === "en";

  // Check existing session to display active status without forcing redirect
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const authData = await getCurrentUserAndRole();
        if (authData?.user) {
          setActiveSession(authData);
        }
      } catch (_) {}
    }
    checkExistingSession();
  }, []);

  return (
    <div className="role-landing-page">
      {/* Top Navigation Bar */}
      <header className="role-navbar">
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          {/* Back to Landing Page Button on Left */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="role-back-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid #cbd5e1",
              color: "#0f172a",
              padding: "7px 12px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.82rem",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0284c7";
              e.currentTarget.style.color = "#0284c7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#0f172a";
            }}
          >
            <ArrowLeft size={16} />
            <span>{isEn ? "Back" : "వెనుకకు"}</span>
          </button>

          <div className="role-nav-logo">
            {/* WorkSphere AI Logo Icon */}
            <div className="role-logo-mark">
              <svg width="34" height="28" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8L11 26L18 10L25 26L32 8" stroke="#0284c7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8L18 24L24 10L30 24L36 8" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
              </svg>
            </div>
            <div>
              <div className="role-logo-text">
                WorkSphere <span style={{ color: "#0284c7" }}>AI</span>
              </div>
              <div className="role-logo-tagline">
                Skilled People | Better Tomorrow
              </div>
            </div>
          </div>
        </div>

        <div className="role-nav-links">
          <span>Find</span>
          <span className="dot">•</span>
          <span>Hire</span>
          <span className="dot">•</span>
          <span>Work</span>
          <span className="dot">•</span>
          <span>Grow</span>
        </div>
      </header>

      {/* Main Role Selection Section */}
      <main className="role-main-content">
        {/* Left Side Back to Landing Page before logins */}
        <div style={{ maxWidth: "1080px", width: "100%", margin: "0 auto 1.25rem", display: "flex", justifyContent: "flex-start" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1.5px solid #cbd5e1",
              color: "#0f172a",
              padding: "9px 18px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0284c7";
              e.currentTarget.style.color = "#0284c7";
              e.currentTarget.style.transform = "translateX(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <ArrowLeft size={16} />
            <span>{isEn ? "← Back to Landing Page" : "← ల్యాండింగ్ పేజీకి తిరిగి వెళ్లండి"}</span>
          </button>
        </div>

        {/* Optional Active Session Notification */}
        {activeSession?.user && (
          <div
            style={{
              maxWidth: "1080px",
              width: "100%",
              margin: "0 auto 1.5rem",
              background: "#F0FDF4",
              border: "1.5px solid #86EFAC",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              boxShadow: "0 2px 10px rgba(34, 197, 94, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={22} color="#16A34A" />
              <div>
                <b style={{ color: "#14532D", fontSize: "0.92rem", display: "block" }}>
                  {isEn
                    ? `Active Session: ${activeSession.profile?.full_name || activeSession.user.email} ${activeSession.role ? `(${activeSession.role.toUpperCase()})` : "(ROLE PENDING)"}`
                    : `ప్రస్తుత సెషన్: ${activeSession.profile?.full_name || activeSession.user.email} ${activeSession.role ? `(${activeSession.role})` : "(రోల్ ధృవీకరణ పెండింగ్)"}`}
                </b>
                <span style={{ fontSize: "0.78rem", color: "#15803D" }}>
                  {isEn
                    ? "You can go to your active dashboard or select any of the 3 roles below to switch accounts."
                    : "మీ ప్రస్తుత డాష్‌బోర్డ్‌కి వెళ్లవచ్చు లేదా క్రింద మరొక లాగిన్ ఎంచుకోవచ్చు."}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  if (activeSession.role === "admin") navigate("/admin/dashboard");
                  else if (activeSession.role === "worker") navigate("/worker/dashboard");
                  else if (activeSession.role === "customer") navigate("/customer/dashboard");
                  else navigate("/login");
                }}
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                {isEn ? "Open My Dashboard →" : "నా డాష్‌బోర్డ్ తెరవండి →"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                  setActiveSession(null);
                }}
                style={{
                  background: "#FFFFFF",
                  color: "#DC2626",
                  border: "1px solid #FCA5A5",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <LogOut size={13} />
                <span>{isEn ? "Sign Out" : "లాగౌట్"}</span>
              </button>
            </div>
          </div>
        )}

        <div className="role-title-group">
          <p className="role-welcome-label">
            {isEn ? "Welcome to WorkSphere AI" : "వర్క్‌స్పియర్ AIకి స్వాగతం"}
          </p>
          <h1 className="role-hero-title">
            {isEn ? "Choose Your Role" : "మీ పాత్రను ఎంచుకోండి"}
          </h1>
          <p className="role-hero-subtitle">
            {isEn
              ? "Select how you want to continue and log in to your account. Each role gives you access to a personalized experience."
              : "మీ ఖాతాలోకి ప్రవేశించడానికి ఒక పాత్రను ఎంచుకోండి. ప్రతి పాత్రకు ప్రత్యేకమైన ఫీచర్లు ఉంటాయి."}
          </p>
        </div>

        {/* 3 Selectable Cards */}
        <div className="role-cards-container">
          {/* Card 1: Customer */}
          <div className="role-action-card card-customer">
            <div className="role-circle-icon icon-customer">
              <User size={38} strokeWidth={2.4} />
            </div>
            <h2 className="role-card-heading">{isEn ? "Customer" : "కస్టమర్"}</h2>
            <p className="role-card-paragraph">
              {isEn
                ? "Find and book trusted workers for your home and business needs."
                : "మీ ఇల్లు మరియు వ్యాపార అవసరాలకు నమ్మకమైన కార్మికులను కనుగొనండి."}
            </p>

            <button
              className="role-pill-btn btn-customer"
              onClick={() => navigate("/customer/login")}
              id="select-customer-login"
            >
              <span>{isEn ? "Customer Login" : "కస్టమర్ లాగిన్"}</span>
              <ArrowRight size={16} />
            </button>
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <span
                onClick={() => navigate("/customer/register")}
                style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                {isEn ? "New customer? Create account →" : "కొత్త ఖాతా తెరవండి →"}
              </span>
            </div>
          </div>

          {/* Card 2: Worker */}
          <div className="role-action-card card-worker">
            <div className="role-circle-icon icon-worker">
              <Briefcase size={38} strokeWidth={2.4} />
            </div>
            <h2 className="role-card-heading">{isEn ? "Worker" : "కార్మికుడు"}</h2>
            <p className="role-card-paragraph">
              {isEn
                ? "Manage your services, receive bookings and grow your business."
                : "మీ సేవలను నిర్వహించండి, పనులను స్వీకరించి సంపాదించండి."}
            </p>

            <button
              className="role-pill-btn btn-worker"
              onClick={() => navigate("/worker/login")}
              id="select-worker-login"
            >
              <span>{isEn ? "Worker Login" : "కార్మికుల లాగిన్"}</span>
              <ArrowRight size={16} />
            </button>
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <span
                onClick={() => navigate("/worker/register")}
                style={{ fontSize: "0.78rem", color: "#d97706", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                {isEn ? "Apply / Register as worker →" : "కొత్త దరఖాస్తు →"}
              </span>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div className="role-action-card card-admin">
            <div className="role-circle-icon icon-admin">
              <Shield size={38} strokeWidth={2.4} />
            </div>
            <h2 className="role-card-heading">{isEn ? "Admin" : "అడ్మిన్"}</h2>
            <p className="role-card-paragraph">
              {isEn
                ? "Manage users, approve workers and oversee the platform."
                : "యూజర్లను మరియు కార్మికుల దరఖాస్తులను నిర్వహించండి."}
            </p>

            <button
              className="role-pill-btn btn-admin"
              onClick={() => navigate("/admin/login")}
              id="select-admin-login"
            >
              <span>{isEn ? "Admin Login" : "అడ్మిన్ లాగిన్"}</span>
              <ArrowRight size={16} />
            </button>
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                {isEn ? "Authorized administrator access only" : "అధీకృత అడ్మిన్ మాత్రమే"}
              </span>
            </div>
          </div>
        </div>

        {/* Need Help Divider & Registration Link */}
        <div className="role-help-section">
          <div className="role-help-divider">
            <span className="role-help-text">{isEn ? "Need help?" : "సహాయం కావాలా?"}</span>
          </div>

          <div className="role-apply-cta">
            <span>{isEn ? "New worker?" : "కొత్త కార్మికులా?"}</span>{" "}
            <Link to="/worker/register" className="role-apply-link">
              <b>{isEn ? "Apply to join WorkSphere AI →" : "వర్క్‌స్పియర్‌లో చేరడానికి దరఖాస్తు చేయండి →"}</b>
            </Link>
          </div>
        </div>

        {/* Bottom Banner with Artisan Illustration and Script Header */}
        <div className="role-footer-art-banner">
          <div className="role-script-callout">
            <span className="script-line-1">Connecting</span>
            <span className="script-line-2">People with</span>
            <span className="script-line-3">Opportunities</span>
            <svg className="script-arrow" width="120" height="24" viewBox="0 0 120 24" fill="none">
              <path d="M4 14C35 4 80 4 116 18" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M106 10L117 19L106 22" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* SVG Illustration of Diverse Local Artisans in front of skyline */}
          <div className="role-workers-illustration">
            <svg width="620" height="150" viewBox="0 0 620 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.1"/>
                </linearGradient>
              </defs>

              {/* Distant Skyline */}
              <rect x="0" y="0" width="620" height="150" fill="url(#skyGrad)"/>
              <rect x="20" y="50" width="35" height="100" fill="url(#cityGrad)" rx="2"/>
              <rect x="65" y="30" width="45" height="120" fill="url(#cityGrad)" rx="2"/>
              <rect x="120" y="60" width="40" height="90" fill="url(#cityGrad)" rx="2"/>
              <rect x="175" y="40" width="50" height="110" fill="url(#cityGrad)" rx="2"/>
              <rect x="420" y="45" width="45" height="105" fill="url(#cityGrad)" rx="2"/>
              <rect x="480" y="25" width="55" height="125" fill="url(#cityGrad)" rx="2"/>
              <rect x="550" y="55" width="40" height="95" fill="url(#cityGrad)" rx="2"/>

              {/* Trees & Greenery */}
              <circle cx="20" cy="140" r="35" fill="#a7f3d0" opacity="0.6"/>
              <circle cx="90" cy="145" r="40" fill="#6ee7b7" opacity="0.5"/>
              <circle cx="530" cy="145" r="45" fill="#a7f3d0" opacity="0.6"/>
              <circle cx="600" cy="140" r="38" fill="#6ee7b7" opacity="0.5"/>

              {/* Artisan 1: Technician with Wrench (Left) */}
              <g transform="translate(130, 25)">
                {/* Body & Shirt */}
                <path d="M15 65 C15 50, 45 50, 45 65 L50 120 L10 120 Z" fill="#0284c7"/>
                {/* Face & Cap */}
                <circle cx="30" cy="35" r="14" fill="#fed7aa"/>
                <path d="M16 30 C16 18, 44 18, 44 30 L48 30 C48 30, 46 26, 30 22 C14 26, 12 30, 12 30 Z" fill="#0369a1"/>
                {/* Wrench */}
                <path d="M5 45 L15 65 L18 63 L8 43 Z" fill="#94a3b8"/>
                <circle cx="5" cy="42" r="5" stroke="#94a3b8" strokeWidth="2.5" fill="none"/>
              </g>

              {/* Artisan 2: Service Specialist with Apron */}
              <g transform="translate(200, 28)">
                <path d="M15 62 C15 50, 45 50, 45 62 L48 120 L12 120 Z" fill="#f8fafc"/>
                <path d="M18 62 L42 62 L40 120 L20 120 Z" fill="#334155"/>
                {/* Hair & Face */}
                <circle cx="30" cy="34" r="13" fill="#fed7aa"/>
                <path d="M14 30 C14 16, 46 16, 46 30 C46 40, 40 45, 40 45 C40 45, 30 40, 20 45 C20 45, 14 40, 14 30 Z" fill="#1e293b"/>
              </g>

              {/* Artisan 3: Builder with Yellow Hardhat (Center) */}
              <g transform="translate(275, 12)">
                <path d="M15 75 C15 60, 55 60, 55 75 L60 140 L10 140 Z" fill="#0284c7"/>
                <path d="M22 75 L48 75 L52 140 L18 140 Z" fill="#ea580c"/>
                {/* Face & Beard */}
                <circle cx="35" cy="44" r="15" fill="#fed7aa"/>
                <path d="M22 46 C22 58, 48 58, 48 46 Z" fill="#78350f"/>
                {/* Yellow Hardhat */}
                <path d="M17 38 C17 22, 53 22, 53 38 L57 41 L13 41 Z" fill="#facc15"/>
              </g>

              {/* Professional 4: Manager with Tablet */}
              <g transform="translate(355, 25)">
                <path d="M15 64 C15 50, 45 50, 45 64 L48 120 L12 120 Z" fill="#0f766e"/>
                <circle cx="30" cy="35" r="13" fill="#fed7aa"/>
                {/* Long Hair */}
                <path d="M14 32 C14 18, 46 18, 46 32 C48 48, 44 55, 44 55 C44 55, 30 38, 16 55 C16 55, 12 48, 14 32 Z" fill="#0f172a"/>
                {/* Tablet */}
                <rect x="36" y="60" width="16" height="24" rx="2" fill="#1e293b"/>
                <rect x="38" y="62" width="12" height="20" rx="1" fill="#38bdf8"/>
              </g>

              {/* Artisan 5: Field Tech with Cap (Right) */}
              <g transform="translate(425, 24)">
                <path d="M15 65 C15 52, 45 52, 45 65 L48 120 L12 120 Z" fill="#2563eb"/>
                <circle cx="30" cy="35" r="14" fill="#fed7aa"/>
                {/* Cap */}
                <path d="M16 30 C16 18, 44 18, 44 30 L52 32 L16 32 Z" fill="#1d4ed8"/>
              </g>
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}
