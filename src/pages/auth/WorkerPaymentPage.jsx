import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  QrCode,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import {
  getCurrentUserAndRole,
  getWorkerRegistrationPayment,
  submitWorkerRegistrationPayment,
  logoutUser,
  WORKER_REGISTRATION_FEE_INR,
  WORKER_UPI_ID,
  WORKER_UPI_QR_PATH
} from "../../lib/supabase";

export default function WorkerPaymentPage({ lang = "en" }) {
  const navigate = useNavigate();
  const isEn = lang === "en";

  const [currentUser, setCurrentUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [utrNumber, setUtrNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(true);

  // Load user and payment details
  const loadPaymentDetails = async () => {
    try {
      const authData = await getCurrentUserAndRole();
      if (!authData?.user) {
        navigate("/worker/login", { replace: true });
        return;
      }

      if (authData.role !== "worker") {
        navigate("/login", { replace: true });
        return;
      }

      setCurrentUser(authData.user);
      setWorkerProfile(authData.workerProfile || null);

      // Fetch payment record
      const { data: pData, error: pErr } = await getWorkerRegistrationPayment(authData.user.id);
      if (pErr) {
        console.warn("Notice fetching payment:", pErr);
      }
      setPaymentData(pData || null);

      // If already verified AND worker profile approved, forward directly to dashboard
      if (pData?.payment_status === "verified" && authData.workerProfile?.approval_status === "approved") {
        navigate("/worker/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error loading payment details:", err);
      setErrorMsg("Failed to load account details. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(WORKER_UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMsg("");
    await loadPaymentDetails();
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMsg(isEn ? "Please enter your UPI transaction reference / UTR." : "దయచేసి మీ UPI లావాదేవీ రిఫరెన్స్ / UTR నమోదు చేయండి.");
      return;
    }

    if (cleanUtr.length < 6) {
      setErrorMsg(isEn ? "Transaction reference must be at least 6 characters." : "లావాదేవీ రిఫరెన్స్ కనీసం 6 అక్షరాలు ఉండాలి.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitWorkerRegistrationPayment({
        workerId: currentUser.id,
        transactionReference: cleanUtr,
        receiptUrl: null, // Supabase storage integration when configured
      });

      setPaymentData(res.data);
      setIsResubmitting(false);
      setUtrNumber("");
    } catch (err) {
      console.error("Payment submission error:", err);
      setErrorMsg(
        err.message ||
          (isEn
            ? "Submission failed. Please check your reference and try again."
            : "సమర్పణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>WorkSphere AI</p>
          <span style={{ fontSize: "0.85rem", color: "#A3B3AB" }}>
            {isEn ? "Loading payment verification portal..." : "చెల్లింపు పోర్టల్ లోడ్ అవుతోంది..."}
          </span>
        </div>
      </div>
    );
  }

  const paymentStatus = paymentData?.payment_status || "none";
  const isPending = paymentStatus === "pending";
  const isVerified = paymentStatus === "verified";
  const isRejected = paymentStatus === "rejected";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #071914 0%, #0B221B 50%, #061511 100%)",
        color: "#F8F6F0",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Header Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(214, 183, 121, 0.15)",
          background: "rgba(11, 34, 27, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0B221B, #1B4332)",
              border: "1px solid #D6B779",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D6B779",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#FFFFFF", letterSpacing: "0.02em" }}>
              WorkSphere <span style={{ color: "#D6B779" }}>AI</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#A3B3AB" }}>
              {isEn ? "Worker Registration Payment" : "కార్మికుల రిజిస్ట్రేషన్ చెల్లింపు"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span style={{ display: "none", "@media (minWidth: 480px)": { display: "inline" } }}>
              {isEn ? "Refresh" : "రిఫ్రెష్"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            <span>{isEn ? "Sign Out" : "లాగౌట్"}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main
        style={{
          flex: 1,
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          padding: "1.75rem 1rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Progress indicator */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "0.85rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
            color: "#A3B3AB",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#D6B779", fontWeight: 700 }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#D6B779", color: "#0B221B", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>1</span>
            <span>Registered</span>
          </div>
          <div style={{ height: "2px", flex: 1, background: "rgba(214, 183, 121, 0.3)", margin: "0 10px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isVerified ? "#34D399" : "#D6B779", fontWeight: 700 }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: isVerified ? "#10B981" : "#D6B779", color: "#0B221B", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>2</span>
            <span>₹25 Fee Payment</span>
          </div>
          <div style={{ height: "2px", flex: 1, background: isVerified ? "rgba(52, 211, 153, 0.4)" : "rgba(255, 255, 255, 0.1)", margin: "0 10px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isVerified && workerProfile?.approval_status === "approved" ? "#34D399" : "#A3B3AB", fontWeight: 600 }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>3</span>
            <span>Dashboard</span>
          </div>
        </div>

        {/* STATE 1: PAYMENT PENDING VERIFICATION */}
        {isPending && !isResubmitting && (
          <div
            style={{
              background: "linear-gradient(180deg, rgba(16, 44, 35, 0.9) 0%, rgba(11, 34, 27, 0.95) 100%)",
              border: "1px solid rgba(214, 183, 121, 0.3)",
              borderRadius: "20px",
              padding: "2rem 1.5rem",
              textAlign: "center",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(214, 183, 121, 0.15)",
                border: "2px solid #D6B779",
                color: "#D6B779",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <Clock size={36} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(214, 183, 121, 0.15)",
                border: "1px solid rgba(214, 183, 121, 0.35)",
                color: "#D6B779",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              <Clock size={14} />
              <span>Payment Verification Pending</span>
            </div>

            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.75rem 0" }}>
              {isEn ? "Payment Reference Under Review" : "చెల్లింపు రిఫరెన్స్ పరిశీలనలో ఉంది"}
            </h1>

            <p style={{ color: "#CBD5E1", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 auto 1.5rem", maxWidth: "480px" }}>
              {isEn
                ? "Your ₹25 registration payment reference has been submitted. Our admin will verify your payment against our bank records before reviewing your worker application."
                : "మీ ₹25 రిజిస్ట్రేషన్ చెల్లింపు రిఫరెన్స్ సమర్పించబడింది. బ్యాంక్ రికార్డులతో సరిచూసిన తర్వాత అడ్మిన్ మీ దరఖాస్తును పరిశీలిస్తారు."}
            </p>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                textAlign: "left",
                marginBottom: "1.5rem",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#94A3B8" }}>Fee Amount:</span>
                <span style={{ fontWeight: 700, color: "#D6B779" }}>₹{WORKER_REGISTRATION_FEE_INR} (One-Time)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#94A3B8" }}>UPI Transaction Reference (UTR):</span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "monospace" }}>
                  {paymentData?.transaction_reference}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#94A3B8" }}>Payment Method:</span>
                <span style={{ color: "#FFFFFF" }}>UPI / FamX</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94A3B8" }}>Submitted On:</span>
                <span style={{ color: "#FFFFFF" }}>
                  {paymentData?.created_at ? new Date(paymentData.created_at).toLocaleString() : "Recently"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #D6B779 0%, #B8964E 100%)",
                  color: "#0B221B",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Checking Status..." : "Check Verification Status"}</span>
              </button>

              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8" }}>
                {isEn
                  ? "You do not need to submit payment again. Your status will update automatically once verified."
                  : "మీరు మళ్లీ చెల్లించాల్సిన అవసరం లేదు. ధృవీకరించబడిన వెంటనే స్టేటస్ అప్‌డేట్ అవుతుంది."}
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: PAYMENT REJECTED */}
        {isRejected && !isResubmitting && (
          <div
            style={{
              background: "linear-gradient(180deg, rgba(35, 16, 16, 0.9) 0%, rgba(20, 10, 10, 0.95) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "20px",
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                border: "2px solid #EF4444",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <AlertCircle size={32} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(239, 68, 68, 0.2)",
                color: "#FCA5A5",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Payment Verification Rejected
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.5rem 0" }}>
              {isEn ? "Payment Could Not Be Verified" : "చెల్లింపు ధృవీకరించబడలేదు"}
            </h2>

            <p style={{ color: "#FCA5A5", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
              <b>Reason:</b> {paymentData?.rejection_reason || "The submitted UPI reference did not match our bank records."}
            </p>

            <button
              onClick={() => setIsResubmitting(true)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "#D6B779",
                color: "#0B221B",
                fontWeight: 800,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Resubmit Correct Transaction Reference
            </button>
          </div>
        )}

        {/* STATE 3: PAYMENT VERIFIED */}
        {isVerified && (
          <div
            style={{
              background: "linear-gradient(180deg, rgba(16, 44, 35, 0.9) 0%, rgba(11, 34, 27, 0.95) 100%)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              borderRadius: "20px",
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(52, 211, 153, 0.15)",
                border: "2px solid #34D399",
                color: "#34D399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <CheckCircle2 size={34} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(52, 211, 153, 0.2)",
                color: "#34D399",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Payment Verified
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.5rem 0" }}>
              {isEn ? "Registration Fee Verified" : "రిజిస్ట్రేషన్ ఫీజు ధృవీకరించబడింది"}
            </h2>

            <p style={{ color: "#CBD5E1", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1.25rem 0" }}>
              {workerProfile?.approval_status === "approved"
                ? "Your payment and worker application have both been approved! You now have full access to your Worker Dashboard."
                : "Your ₹25 registration payment has been verified by the administrator. Your worker application is currently awaiting final admin approval."}
            </p>

            <button
              onClick={() => {
                if (workerProfile?.approval_status === "approved") {
                  navigate("/worker/dashboard");
                } else {
                  navigate("/worker/pending");
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #D6B779 0%, #B8964E 100%)",
                color: "#0B221B",
                border: "none",
                fontWeight: 800,
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>{workerProfile?.approval_status === "approved" ? "Open Worker Dashboard" : "View Application Status"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STATE 4: PAYMENT REQUIRED FORM (Not submitted yet or Resubmitting) */}
        {(!paymentData || isResubmitting) && !isPending && !isVerified && (
          <div
            style={{
              background: "linear-gradient(180deg, rgba(16, 44, 35, 0.85) 0%, rgba(11, 34, 27, 0.95) 100%)",
              border: "1px solid rgba(214, 183, 121, 0.25)",
              borderRadius: "20px",
              padding: "1.75rem 1.5rem",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Title & Badge */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(214, 183, 121, 0.15)",
                  border: "1px solid rgba(214, 183, 121, 0.3)",
                  color: "#D6B779",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                ₹{WORKER_REGISTRATION_FEE_INR} • One-Time Verification Fee
              </div>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.35rem 0" }}>
                {isEn ? "Worker Registration Fee" : "కార్మికుల రిజిస్ట్రేషన్ ఫీజు"}
              </h1>
              <p style={{ color: "#A3B3AB", fontSize: "0.85rem", margin: 0 }}>
                {isEn
                  ? "Scan the FamX QR code or send ₹25 to our verified UPI ID to complete your registration."
                  : "రిజిస్ట్రేషన్ పూర్తి చేయడానికి FamX QR కోడ్‌ను స్కాన్ చేయండి లేదా మా UPI IDకి ₹25 చెల్లించండి."}
              </p>
            </div>

            {/* QR Code & Payment Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(214, 183, 121, 0.2)",
                borderRadius: "16px",
                padding: "1.5rem 1rem",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#D6B779", marginBottom: "0.85rem", letterSpacing: "0.03em" }}>
                SCAN AND PAY USING UPI
              </div>

              {/* Real FamX QR image asset */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "230px",
                  height: "auto",
                  aspectRatio: "1/1",
                  margin: "0 auto 1.25rem",
                  background: "#081B15",
                  padding: "10px",
                  borderRadius: "20px",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
                  border: "2px solid #D6B779",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {qrLoaded ? (
                  <img
                    src={`${WORKER_UPI_QR_PATH}?v=${Date.now()}`}
                    alt="WorkSphere AI FamX UPI QR Code Scanner"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "12px",
                      display: "block",
                    }}
                    onError={() => {
                      console.warn("QR code asset not found at", WORKER_UPI_QR_PATH);
                      setQrLoaded(false);
                    }}
                  />
                ) : (
                  <div style={{ color: "#D6B779", fontSize: "0.85rem", textAlign: "center", padding: "10px" }}>
                    <b>FamX UPI QR</b>
                    <br />
                    <span>Scan with any UPI App</span>
                  </div>
                )}
              </div>

              {/* UPI ID Row with Copy button */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  background: "rgba(11, 34, 27, 0.8)",
                  border: "1px solid rgba(214, 183, 121, 0.4)",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.68rem", color: "#A3B3AB", textTransform: "uppercase" }}>UPI ID:</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#FFFFFF", fontFamily: "monospace" }}>
                    {WORKER_UPI_ID}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: copied ? "#10B981" : "#D6B779",
                    color: copied ? "#FFFFFF" : "#0B221B",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Amount reminder */}
              <div style={{ marginTop: "0.85rem", fontSize: "0.82rem", color: "#CBD5E1" }}>
                Amount to Pay: <b style={{ color: "#D6B779", fontSize: "1rem" }}>₹{WORKER_REGISTRATION_FEE_INR}</b> (Exact amount)
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#FCA5A5",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="utrInput"
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  UPI Transaction Reference / UTR Number <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  id="utrInput"
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. 429381749201"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(214, 183, 121, 0.35)",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "#A3B3AB", marginTop: "4px", display: "block" }}>
                  Enter the 12-digit UPI reference ID or alphanumeric UTR from your payment confirmation.
                </span>
              </div>

              {/* Notice */}
              <div
                style={{
                  background: "rgba(214, 183, 121, 0.08)",
                  border: "1px solid rgba(214, 183, 121, 0.2)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "0.78rem",
                  color: "#CBD5E1",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <ShieldCheck size={18} color="#D6B779" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <b>Notice:</b> Your payment will be verified by the WorkSphere AI Admin before worker approval. Do not share your UPI PIN or banking credentials with anyone.
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #D6B779 0%, #B8964E 100%)",
                  color: "#0B221B",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.98rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "opacity 0.2s",
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: "0 6px 18px rgba(214, 183, 121, 0.25)",
                }}
              >
                <span>{submitting ? "Submitting Reference..." : "Submit for Verification"}</span>
                <ArrowRight size={18} />
              </button>

              {isResubmitting && (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#A3B3AB",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Cancel and return
                </button>
              )}
            </form>
          </div>
        )}

        {/* 3. Refund Policy & Assistance Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "1rem 1.25rem",
            fontSize: "0.78rem",
            color: "#94A3B8",
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#CBD5E1", fontWeight: 700, marginBottom: "4px" }}>
            <HelpCircle size={15} color="#D6B779" />
            <span>Platform Policy & Support</span>
          </div>
          <p style={{ margin: "0 0 6px 0" }}>
            Please confirm the worker registration fee refund policy with the platform administrator before payment.
          </p>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748B" }}>
            WorkSphere AI • Secure UPI Verification System • FamX: 6281376739@fam
          </p>
        </div>
      </main>
    </div>
  );
}
