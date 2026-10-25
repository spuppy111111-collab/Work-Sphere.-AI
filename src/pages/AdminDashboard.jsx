import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle,
  Star,
  ChevronRight,
  MoreVertical,
  Plus,
  Wrench,
  BarChart3,
  Search,
  Check,
  X,
  Shield,
  Layers,
  MapPin,
  Sparkles,
  RotateCw,
  FolderPlus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  getAllUsersForAdmin,
  getAllWorkerApplicationsForAdmin,
  reviewWorkerApplication,
  getAllServicesForAdmin,
  createService,
  updateService,
  getAllBookingsForAdmin,
  changeBookingStatus,
  getAllWorkerPaymentsForAdmin,
  verifyWorkerPayment,
  rejectWorkerPayment,
  supabase
} from "../lib/supabase";
import { useTimeGreeting, useLiveClock } from "../utils/greeting";

export default function AdminDashboard({ lang = "en", currentUser, onNavigate }) {
  const isEn = lang === "en";
  const greeting = useTimeGreeting(lang);
  const { formattedDate, formattedTime } = useLiveClock();

  // Data states from Supabase
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active action menu row
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Wood Polish & Carpentry");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [approvingWorkerId, setApprovingWorkerId] = useState(null);
  const [workerPayments, setWorkerPayments] = useState([]);
  const [verifyingPaymentId, setVerifyingPaymentId] = useState(null);
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [showRejectInputForId, setShowRejectInputForId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Load real records from Supabase
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, workersData, servicesData, bookingsData, paymentsData] = await Promise.all([
        getAllUsersForAdmin().catch(() => []),
        getAllWorkerApplicationsForAdmin().catch(() => []),
        getAllServicesForAdmin().catch(() => []),
        getAllBookingsForAdmin().catch(() => []),
        getAllWorkerPaymentsForAdmin().catch(() => []),
      ]);
      setUsers(usersData || []);
      setWorkers(workersData || []);
      setServices(servicesData || []);
      setBookings(bookingsData || []);
      setWorkerPayments(paymentsData || []);
    } catch (err) {
      console.warn("Notice loading admin records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Supabase Realtime subscription for live admin updates
    const channel = supabase
      .channel("admin-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          loadAdminData();
        }
      )
      .subscribe();

    const handleLocalBookingUpdate = () => {
      loadAdminData();
    };

    window.addEventListener("ws_booking_updated", handleLocalBookingUpdate);
    window.addEventListener("storage", handleLocalBookingUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("ws_booking_updated", handleLocalBookingUpdate);
      window.removeEventListener("storage", handleLocalBookingUpdate);
    };
  }, []);

  // Worker Review Action
  const handleReviewWorker = async (workerId, approved) => {
    try {
      setApprovingWorkerId(workerId);
      await reviewWorkerApplication({ workerUserId: workerId, approved });
      await loadAdminData();
      setActiveMenuId(null);
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApprovingWorkerId(null);
    }
  };

  // Payment Verification Actions (Separate from Worker Approval)
  const handleVerifyPayment = async (paymentId) => {
    try {
      setVerifyingPaymentId(paymentId);
      await verifyWorkerPayment({ paymentId, adminId: currentUser?.id });
      await loadAdminData();
    } catch (err) {
      alert(`Payment verification error: ${err.message}`);
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      setRejectingPaymentId(paymentId);
      await rejectWorkerPayment({
        paymentId,
        adminId: currentUser?.id,
        reason: rejectReason.trim() || "Transaction reference could not be verified in UPI account.",
      });
      setShowRejectInputForId(null);
      setRejectReason("");
      await loadAdminData();
    } catch (err) {
      alert(`Payment rejection error: ${err.message}`);
    } finally {
      setRejectingPaymentId(null);
    }
  };

  // Create Service Listing (NO FIXED PRICES)
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    try {
      setIsCreatingService(true);
      await createService({
        name: newServiceName.trim(),
        category: newServiceCategory,
        description: newServiceDesc.trim(),
        isActive: true,
      });
      setIsAddServiceOpen(false);
      setNewServiceName("");
      setNewServiceDesc("");
      await loadAdminData();
      alert("New service category created successfully!");
    } catch (err) {
      alert(`Service creation failed: ${err.message}`);
    } finally {
      setIsCreatingService(false);
    }
  };

  // Real calculations computed directly from Supabase records
  const pendingWorkers = workers.filter(
    (w) => (w.approval_status || "").toLowerCase() === "pending" || (w.approval_status || "").toLowerCase() === "under_review"
  );
  const approvedWorkers = workers.filter(
    (w) =>
      (w.approval_status || "").toLowerCase() === "approved" ||
      (w.approval_status || "").toLowerCase() === "verified" ||
      (w.is_available === true && (w.approval_status || "").toLowerCase() !== "rejected")
  );
  const totalCustomers = users.filter((u) => u.role !== "admin").length || users.length;

  const dynamicActivities = [
    ...workers.slice(0, 3).map((w) => ({
      id: `act-w-${w.id}`,
      iconBg: w.approval_status === "approved" ? "#dcfce7" : "#e0f2fe",
      iconColor: w.approval_status === "approved" ? "#16a34a" : "#0284c7",
      icon: Users,
      title: w.approval_status === "approved" ? "Worker Approved" : "Worker Application",
      sub: `${w.display_name || w.profiles?.full_name || "Artisan"} (${w.skills?.[0] || "General"})`,
      time: w.created_at ? new Date(w.created_at).toLocaleDateString() : "Recent",
    })),
    ...bookings.slice(0, 3).map((b) => ({
      id: `act-b-${b.id}`,
      iconBg: b.status === "completed" ? "#dcfce7" : "#e0f2fe",
      iconColor: b.status === "completed" ? "#16a34a" : "#0284c7",
      icon: CheckCircle,
      title: `Booking ${b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending"}`,
      sub: `${b.service_category || "Service"} (${b.locality || "Guntur"})`,
      time: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent",
    })),
  ];

  return (
    <div style={{ padding: "0.5rem 0.5rem 2rem 0.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.65rem",
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {greeting}, Admin!
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "4px" }}>
            Here's what's happening with your WorkSphere AI marketplace today.
          </p>
        </div>

        {/* Date and Time Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "#475569",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <Calendar size={14} color="#64748b" />
            <span>{formattedDate}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "#475569",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <Clock size={14} color="#64748b" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Card 1: Total Customers */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#e0f2fe",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
              Total Customers
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
                {totalCustomers}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1px" }}>
              Registered accounts
            </div>
          </div>
        </div>

        {/* Card 2: Approved Workers */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Briefcase size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
              Approved Workers
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
                {approvedWorkers.length}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1px" }}>
              Verified active artisans
            </div>
          </div>
        </div>

        {/* Card 3: Pending Applications */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#ffedd5",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clock size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
              Pending Applications
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
                {pendingWorkers.length}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1px" }}>
              Awaiting admin verification
            </div>
          </div>
        </div>

        {/* Card 4: Total Bookings */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#f3e8ff",
              color: "#9333ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Calendar size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
              Total Bookings
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
                {bookings.length}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1px" }}>
              All-time customer requests
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Platform Overview Chart, Quick Actions, Recent Activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr 1fr",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
        className="admin-mid-grid"
      >
        {/* Card 1: Platform Overview Chart */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Platform Overview
            </h2>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.75rem", color: "#64748b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0284c7" }} />
                <span>Customers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                <span>Workers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6" }} />
                <span>Bookings</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Curve Growth Chart */}
          <div style={{ width: "100%", height: "230px", position: "relative" }}>
            <svg
              viewBox="0 0 600 230"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <text x="15" y="24" fontSize="11" fill="#94a3b8" fontWeight="500">400</text>

              <line x1="40" y1="65" x2="580" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <text x="15" y="69" fontSize="11" fill="#94a3b8" fontWeight="500">300</text>

              <line x1="40" y1="110" x2="580" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <text x="15" y="114" fontSize="11" fill="#94a3b8" fontWeight="500">200</text>

              <line x1="40" y1="155" x2="580" y2="155" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <text x="15" y="159" fontSize="11" fill="#94a3b8" fontWeight="500">100</text>

              <line x1="40" y1="200" x2="580" y2="200" stroke="#f1f5f9" strokeWidth="1" />
              <text x="25" y="204" fontSize="11" fill="#94a3b8" fontWeight="500">0</text>

              {/* Month X Labels */}
              <text x="50" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Apr</text>
              <text x="135" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">May</text>
              <text x="220" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Jun</text>
              <text x="305" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Jul</text>
              <text x="390" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Aug</text>
              <text x="475" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Sep</text>
              <text x="560" y="222" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">Oct</text>

              {/* Gradient Area Fill under Purple curve */}
              <path
                d="M 50 145 C 90 125, 110 120, 135 120 C 175 120, 195 110, 220 108 C 260 105, 280 85, 305 80 C 345 75, 365 70, 390 68 C 430 65, 450 58, 475 54 C 515 48, 535 30, 560 25 L 560 200 L 50 200 Z"
                fill="url(#purpleAreaGrad)"
              />

              {/* Gradient Area Fill under Blue curve */}
              <path
                d="M 50 160 C 90 148, 110 145, 135 142 C 175 140, 195 138, 220 135 C 260 130, 280 120, 305 115 C 345 110, 365 102, 390 98 C 430 94, 450 88, 475 84 C 515 78, 535 60, 560 55 L 560 200 L 50 200 Z"
                fill="url(#blueAreaGrad)"
              />

              {/* 1. Purple Line: Bookings */}
              <path
                d="M 50 145 C 90 125, 110 120, 135 120 C 175 120, 195 110, 220 108 C 260 105, 280 85, 305 80 C 345 75, 365 70, 390 68 C 430 65, 450 58, 475 54 C 515 48, 535 30, 560 25"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
              />
              {[
                [50, 145],
                [135, 120],
                [220, 108],
                [305, 80],
                [390, 68],
                [475, 54],
                [560, 25],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#8b5cf6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* 2. Blue Line: Customers */}
              <path
                d="M 50 160 C 90 148, 110 145, 135 142 C 175 140, 195 138, 220 135 C 260 130, 280 120, 305 115 C 345 110, 365 102, 390 98 C 430 94, 450 88, 475 84 C 515 78, 535 60, 560 55"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
              />
              {[
                [50, 160],
                [135, 142],
                [220, 135],
                [305, 115],
                [390, 98],
                [475, 84],
                [560, 55],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* 3. Green Line: Workers */}
              <path
                d="M 50 185 C 90 178, 110 175, 135 172 C 175 170, 195 168, 220 165 C 260 160, 280 152, 305 148 C 345 144, 365 140, 390 138 C 430 135, 450 130, 475 126 C 515 120, 535 112, 560 106"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              {[
                [50, 185],
                [135, 172],
                [220, 165],
                [305, 148],
                [390, 138],
                [475, 126],
                [560, 106],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Card 2: Quick Actions */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a", margin: "0 0 1rem 0" }}>
            Quick Actions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "space-between" }}>
            {/* 1. Review Worker Applications */}
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                Review Worker Applications
              </span>
              <span
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  padding: "2px 7px",
                  borderRadius: "999px",
                }}
              >
                {pendingWorkers.length}
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* 1B. Review Worker Payments (₹25 UPI) */}
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(214, 183, 121, 0.18)",
                  color: "#B8964E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                Worker Payments (₹25 UPI)
              </span>
              <span
                style={{
                  background: workerPayments.filter(p => p.payment_status === "pending").length > 0 ? "#f59e0b" : "#10b981",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  padding: "2px 7px",
                  borderRadius: "999px",
                }}
              >
                {workerPayments.filter(p => p.payment_status === "pending").length} Pending
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* 2. Manage Services & Categories */}
            <button
              onClick={() => setIsAddServiceOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Wrench size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                Manage Services & Categories
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* 3. View All Bookings */}
            <button
              onClick={() => setIsBookingsModalOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Calendar size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                View All Bookings
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* 4. Add New Service */}
            <button
              onClick={() => setIsAddServiceOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                Add New Service
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* 5. View Reports */}
            <button
              onClick={() => setIsReportsModalOpen(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#f3e8ff",
                  color: "#9333ea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BarChart3 size={16} />
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "#1e293b" }}>
                View Reports
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Card 3: Recent Activity */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Recent Activity
            </h2>
            <button
              onClick={() => alert("Showing all recent activity log for marketplace.")}
              style={{
                background: "none",
                border: "none",
                color: "#0284c7",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "flex-start" }}>
            {dynamicActivities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#64748b", fontSize: "0.82rem" }}>
                <Clock size={24} style={{ color: "#94a3b8", margin: "0 auto 6px", display: "block" }} />
                <span>No recent marketplace activity logged yet.</span>
              </div>
            ) : (
              dynamicActivities.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: item.iconBg,
                        color: item.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                        {item.sub}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {item.time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Worker Applications, Recent Bookings, WorkSphere AI Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.3fr 0.9fr",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
        className="admin-bottom-grid"
      >
        {/* Card 1: Recent Worker Applications */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Recent Worker Applications
            </h2>
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#0284c7",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ color: "#94a3b8", borderBottom: "1px solid #f1f5f9", fontSize: "0.72rem" }}>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Professional / Trade</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Experience</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Location</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "8px 6px", fontWeight: "600", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No worker applications submitted yet.
                  </td>
                </tr>
              ) : (
                workers.slice(0, 5).map((w) => {
                  const displayName = w.display_name || w.profiles?.full_name || "Artisan";
                  const initials = displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const trade = w.skills && w.skills.length > 0 ? (Array.isArray(w.skills) ? w.skills.join(", ") : w.skills) : "General Artisan";
                  const experience = w.experience_years ? `${w.experience_years} years` : "1+ years";
                  const location = w.city || w.service_area || "Guntur, AP";
                  const status = (w.approval_status || "pending").toLowerCase();

                  return (
                    <tr key={w.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "10px 6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: status === "approved" ? "#0284c7" : "#f59e0b",
                              color: "#ffffff",
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {initials || "W"}
                          </div>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>{displayName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 6px", color: "#475569" }}>{trade}</td>
                      <td style={{ padding: "10px 6px", color: "#64748b" }}>{experience}</td>
                      <td style={{ padding: "10px 6px", color: "#64748b" }}>{location}</td>
                      <td style={{ padding: "10px 6px" }}>
                        <span
                          style={{
                            background: status === "approved" ? "#dcfce7" : "#fef3c7",
                            color: status === "approved" ? "#16a34a" : "#d97706",
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            textTransform: "capitalize",
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right", position: "relative" }}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === w.id ? null : w.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === w.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: "0",
                              top: "28px",
                              background: "#ffffff",
                              borderRadius: "8px",
                              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                              border: "1px solid #e2e8f0",
                              zIndex: 50,
                              minWidth: "140px",
                              padding: "4px",
                              textAlign: "left",
                            }}
                          >
                            <button
                              onClick={() => handleReviewWorker(w.id, true)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                fontSize: "0.75rem",
                                color: "#16a34a",
                                fontWeight: "600",
                                textAlign: "left",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#ecfdf5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReviewWorker(w.id, false)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                fontSize: "0.75rem",
                                color: "#dc2626",
                                fontWeight: "600",
                                textAlign: "left",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Card 2: Recent Bookings */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Recent Bookings
            </h2>
            <button
              onClick={() => setIsBookingsModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#0284c7",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ color: "#94a3b8", borderBottom: "1px solid #f1f5f9", fontSize: "0.72rem" }}>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Customer</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Worker</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Service</th>
                <th style={{ padding: "8px 6px", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "8px 6px", fontWeight: "600", textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No bookings logged yet.
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map((b) => {
                  const customerName = b.profiles?.full_name || "Customer";
                  const workerName = b.worker_profiles?.display_name || (b.worker_id ? "Assigned" : "Pending");
                  const dateStr = b.scheduled_at
                    ? new Date(b.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : (b.created_at ? new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent");
                  const statusStr = (b.status || "pending").toLowerCase();
                  const statusBg =
                    statusStr === "completed"
                      ? "#dcfce7"
                      : statusStr === "in_progress" || statusStr === "accepted"
                      ? "#e0f2fe"
                      : "#fef3c7";
                  const statusColor =
                    statusStr === "completed"
                      ? "#16a34a"
                      : statusStr === "in_progress" || statusStr === "accepted"
                      ? "#0284c7"
                      : "#d97706";

                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "10px 6px", fontWeight: "600", color: "#0f172a" }}>
                        {customerName}
                      </td>
                      <td style={{ padding: "10px 6px", color: "#475569" }}>{workerName}</td>
                      <td style={{ padding: "10px 6px", color: "#64748b" }}>{b.service_category || "General"}</td>
                      <td style={{ padding: "10px 6px" }}>
                        <span
                          style={{
                            background: statusBg,
                            color: statusColor,
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            textTransform: "capitalize",
                          }}
                        >
                          {b.status || "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right", color: "#64748b" }}>
                        {dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Card 3: WorkSphere AI Platform Mission Banner */}
        <div
          style={{
            background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "16px",
            padding: "1.5rem 1.25rem",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.15)",
              filter: "blur(30px)",
            }}
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={18} />
              </div>
              <span style={{ fontSize: "1.05rem", fontWeight: "800", letterSpacing: "-0.01em" }}>
                WorkSphere AI
              </span>
            </div>

            <p
              style={{
                fontSize: "0.8rem",
                color: "#cbd5e1",
                lineHeight: "1.4",
                margin: "0 0 1rem 0",
              }}
            >
              Building a stronger local workforce for a better tomorrow.
            </p>
          </div>

          {/* Graphic Artwork matching reference screenshot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 0",
            }}
          >
            <svg viewBox="0 0 200 120" style={{ width: "100%", maxHeight: "110px" }}>
              {/* Central Dashboard Frame */}
              <rect x="50" y="25" width="100" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="50" y1="40" x2="150" y2="40" stroke="#334155" strokeWidth="1" />
              <rect x="60" y="48" width="30" height="3" rx="1.5" fill="#38bdf8" />
              <rect x="60" y="56" width="45" height="3" rx="1.5" fill="#64748b" />
              <rect x="60" y="64" width="20" height="3" rx="1.5" fill="#64748b" />

              {/* Mini Chart Bars on right of dashboard */}
              <rect x="115" y="65" width="6" height="15" rx="2" fill="#06b6d4" />
              <rect x="125" y="55" width="6" height="25" rx="2" fill="#38bdf8" />
              <rect x="135" y="45" width="6" height="35" rx="2" fill="#60a5fa" />

              {/* Worker Silhouette on Left */}
              <circle cx="36" cy="55" r="9" fill="#38bdf8" />
              <path d="M 22 80 C 22 68, 50 68, 50 80 Z" fill="#38bdf8" opacity="0.85" />

              {/* Tech Gears / Cog Icons */}
              <g transform="translate(160, 68)">
                <circle cx="8" cy="8" r="7" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="3 2" />
                <circle cx="8" cy="8" r="3" fill="#60a5fa" />
              </g>
              <g transform="translate(142, 85)">
                <circle cx="6" cy="6" r="5" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #eef2f6",
          fontSize: "0.78rem",
          color: "#94a3b8",
        }}
      >
        <div>© 2026 WorkSphere AI. All rights reserved.</div>
        <div style={{ display: "flex", gap: "16px", color: "#64748b" }}>
          <span style={{ cursor: "pointer" }} onClick={() => alert("Privacy Policy: All customer & worker records are safeguarded under strict privacy governance.")}>
            Privacy Policy
          </span>
          <span>|</span>
          <span style={{ cursor: "pointer" }} onClick={() => alert("Terms of Service: Operating under verified marketplace guidelines across Guntur & Andhra Pradesh.")}>
            Terms of Service
          </span>
          <span>|</span>
          <span style={{ cursor: "pointer" }} onClick={() => alert("WorkSphere AI Support: Contact admin@worksphere.ai for operations assistance.")}>
            Help
          </span>
        </div>
      </footer>

      {/* MODAL 1: Add New Service (Strictly NO FIXED PRICES) */}
      {isAddServiceOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "#dcfce7", color: "#16a34a", padding: "6px", borderRadius: "8px" }}>
                  <Plus size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                  Add Marketplace Service
                </h3>
              </div>
              <button
                onClick={() => setIsAddServiceOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: "1.4" }}>
              Register a new service category for customers and workers. All services operate under direct work inspection without hardcoded or fixed pricing.
            </p>

            <form onSubmit={handleCreateService}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Italian PU Wood Polish or Main DB Rewiring"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  Category *
                </label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                  }}
                >
                  <option value="Wood Polish & Carpentry">Wood Polish & Carpentry</option>
                  <option value="Electrical Services">Electrical Services</option>
                  <option value="Plumbing Services">Plumbing Services</option>
                  <option value="Wall Painting & Finishing">Wall Painting & Finishing</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Deep Cleaning & Sanitization">Deep Cleaning & Sanitization</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  Scope Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Detail the work process and on-site inspection criteria..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "0.82rem",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingService}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(90deg, #0284c7, #06b6d4)",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  {isCreatingService ? "Saving..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Review Worker Applications */}
      {isWorkerModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#0f172a" }}>
                  Worker Applications Review
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {pendingWorkers.length} pending verification applications awaiting admin review
                </span>
              </div>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {workers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  No worker applications found.
                </div>
              ) : (
                workers.map((w) => {
                  const displayName = w.display_name || w.profiles?.full_name || "Artisan";
                  const initials = displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const trade = w.skills && w.skills.length > 0 ? (Array.isArray(w.skills) ? w.skills.join(", ") : w.skills) : "General Artisan";
                  const experience = w.experience_years ? `${w.experience_years} years` : "1+ years";
                  const location = w.city || w.service_area || "Guntur, AP";
                  const status = (w.approval_status || "pending").toLowerCase();

                  return (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            background: status === "approved" ? "#0284c7" : "#f59e0b",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                          }}
                        >
                          {initials || "W"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "#0f172a" }}>
                            {displayName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {trade} • {experience} • {location}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span
                          style={{
                            background: status === "approved" ? "#dcfce7" : "#fef3c7",
                            color: status === "approved" ? "#16a34a" : "#d97706",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            marginRight: "6px",
                            textTransform: "capitalize",
                          }}
                        >
                          {status}
                        </span>
                        {status !== "approved" && (
                          <button
                            onClick={() => handleReviewWorker(w.id, true)}
                            disabled={approvingWorkerId === w.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 14px",
                              borderRadius: "8px",
                              background: "#16a34a",
                              color: "#fff",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {status !== "rejected" && (
                          <button
                            onClick={() => handleReviewWorker(w.id, false)}
                            disabled={approvingWorkerId === w.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 14px",
                              borderRadius: "8px",
                              background: "#fff1f2",
                              color: "#ef4444",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                              border: "1px solid #fecdd3",
                              cursor: "pointer",
                            }}
                          >
                            <X size={14} /> Decline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: All Bookings Modal */}
      {isBookingsModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#0f172a" }}>
                  All Marketplace Bookings
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Live bookings across Guntur, Vijayawada, and Tenali ({bookings.length} total)
                </span>
              </div>
              <button
                onClick={() => setIsBookingsModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  No bookings recorded yet.
                </div>
              ) : (
                bookings.map((b) => {
                  const customerName = b.profiles?.full_name || "Customer";
                  const workerName = b.worker_profiles?.display_name || (b.worker_id ? "Assigned" : "Pending Assignment");
                  const dateStr = b.scheduled_at
                    ? new Date(b.scheduled_at).toLocaleDateString()
                    : "Recent";
                  const statusStr = (b.status || "pending").toLowerCase();
                  const statusBg =
                    statusStr === "completed"
                      ? "#dcfce7"
                      : statusStr === "in_progress" || statusStr === "accepted"
                      ? "#e0f2fe"
                      : "#fef3c7";
                  const statusColor =
                    statusStr === "completed"
                      ? "#16a34a"
                      : statusStr === "in_progress" || statusStr === "accepted"
                      ? "#0284c7"
                      : "#d97706";

                  return (
                    <div
                      key={b.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "#0f172a" }}>
                          {b.service_category || "Service"} — {customerName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Worker: {workerName} • Scheduled: {dateStr}
                        </div>
                      </div>

                      <span
                        style={{
                          background: statusBg,
                          color: statusColor,
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          textTransform: "capitalize",
                        }}
                      >
                        {b.status || "Pending"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3B: Worker Registration Payments (₹25 UPI) Section */}
      {isPaymentModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "960px",
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                    Worker Registration Payments (₹25 UPI)
                  </h3>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    FamX: 6281376739@fam
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "4px 0 0 0" }}>
                  Admin verification is required before worker approval. Verify the UTR against your bank or UPI transaction record.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Security Verification Notice */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "1.25rem",
                fontSize: "0.78rem",
                color: "#475569",
                lineHeight: 1.5,
              }}
            >
              <b>Admin Verification Rules:</b> A worker can access <code>/worker/dashboard</code> only when <b>both</b> conditions are satisfied: (1) Payment status is verified, and (2) Worker application is approved. Payment verification and worker approval remain independent actions.
            </div>

            {/* Payments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {workerPayments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b" }}>
                  No worker registration payment records found.
                </div>
              ) : (
                workerPayments.map((p) => {
                  const status = (p.payment_status || "pending").toLowerCase();
                  const approvalStatus = (p.worker_approval_status || "pending").toLowerCase();
                  const isVerified = status === "verified";
                  const isRejected = status === "rejected";
                  const isPending = status === "pending";

                  const statusBg = isVerified ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7";
                  const statusColor = isVerified ? "#15803d" : isRejected ? "#b91c1c" : "#b45309";

                  const approvalBg = approvalStatus === "approved" ? "#e0e7ff" : approvalStatus === "rejected" ? "#fee2e2" : "#f3f4f6";
                  const approvalColor = approvalStatus === "approved" ? "#4338ca" : approvalStatus === "rejected" ? "#b91c1c" : "#4b5563";

                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "#0f172a" }}>
                            {p.worker_name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            Trade: {p.worker_trade} • City: {p.worker_city} • {p.worker_phone || p.worker_email}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: statusBg,
                              color: statusColor,
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              textTransform: "uppercase",
                              letterSpacing: "0.02em",
                            }}
                          >
                            Payment: {status}
                          </span>

                          <span
                            style={{
                              background: approvalBg,
                              color: approvalColor,
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              textTransform: "capitalize",
                            }}
                          >
                            Worker: {approvalStatus}
                          </span>
                        </div>
                      </div>

                      {/* Transaction reference & fee details */}
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.82rem",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <span style={{ color: "#64748b" }}>Fee: </span>
                          <b style={{ color: "#0f172a" }}>₹{(p.amount_paise / 100).toFixed(0)} ({p.currency})</b>
                          <span style={{ color: "#94a3b8", margin: "0 8px" }}>•</span>
                          <span style={{ color: "#64748b" }}>UTR / Reference: </span>
                          <b style={{ color: "#0284c7", fontFamily: "monospace", fontSize: "0.88rem" }}>{p.transaction_reference}</b>
                        </div>

                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Submitted: {p.created_at ? new Date(p.created_at).toLocaleString() : "Recently"}
                        </div>
                      </div>

                      {p.rejection_reason && (
                        <div style={{ fontSize: "0.75rem", color: "#dc2626", background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" }}>
                          <b>Rejection Reason:</b> {p.rejection_reason}
                        </div>
                      )}

                      {/* Separate Authorized Admin Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "4px" }}>
                        {/* 1. Payment verification actions */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!isVerified && (
                            <button
                              onClick={() => handleVerifyPayment(p.id)}
                              disabled={verifyingPaymentId === p.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                background: "#16a34a",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={13} />
                              <span>{verifyingPaymentId === p.id ? "Verifying..." : "Verify Payment"}</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => setShowRejectInputForId(showRejectInputForId === p.id ? null : p.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                background: "#dc2626",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <X size={13} />
                              <span>Reject Payment</span>
                            </button>
                          )}
                        </div>

                        {/* 2. Worker approval actions (Separate) */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {approvalStatus !== "approved" && (
                            <button
                              onClick={() => handleReviewWorker(p.worker_id, true)}
                              disabled={approvingWorkerId === p.worker_id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                background: "#0284c7",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={13} />
                              <span>Approve Worker</span>
                            </button>
                          )}

                          {approvalStatus !== "rejected" && (
                            <button
                              onClick={() => handleReviewWorker(p.worker_id, false)}
                              disabled={approvingWorkerId === p.worker_id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                background: "#475569",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <X size={13} />
                              <span>Reject Worker</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rejection reason inline form */}
                      {showRejectInputForId === p.id && (
                        <div
                          style={{
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Enter rejection reason (e.g. UTR not found in bank)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.8rem",
                            }}
                          />
                          <button
                            onClick={() => handleRejectPayment(p.id)}
                            disabled={rejectingPaymentId === p.id}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            {rejectingPaymentId === p.id ? "Rejecting..." : "Confirm Rejection"}
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectInputForId(null);
                              setRejectReason("");
                            }}
                            style={{
                              padding: "6px 10px",
                              background: "none",
                              border: "none",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reports Modal */}
      {isReportsModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "#f3e8ff", color: "#9333ea", padding: "6px", borderRadius: "8px" }}>
                  <BarChart3 size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                  Marketplace Analytics Report
                </h3>
              </div>
              <button
                onClick={() => setIsReportsModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Monthly Completed Jobs</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>278</div>
                <div style={{ fontSize: "0.72rem", color: "#16a34a" }}>↑ 22% growth</div>
              </div>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Avg Customer Satisfaction</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>4.85 ★</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>From 312 reviews</div>
              </div>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: "1.4" }}>
              Marketplace operations report verified for Guntur, Vijayawada, and Tenali coverage areas. All worker background checks and service tickets are monitored real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
