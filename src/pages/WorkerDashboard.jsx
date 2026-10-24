import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Briefcase,
  Check,
  XCircle,
  RotateCw,
  Play,
  Sliders,
  CalendarCheck,
  User,
  Bell,
  ChevronRight,
  ArrowRight,
  Zap,
  Droplet,
  Paintbrush,
  Hammer,
  Image,
  Flame,
  Home,
  QrCode,
  Smartphone,
  CheckSquare,
  Sparkles,
  Search,
  Truck
} from "lucide-react";
import { CATEGORIES } from "../data/initialData";
import { SERVICE_GROUPS, SERVICE_CATEGORIES } from "../data/serviceCatalog";
import CategoryIcon from "../components/CategoryIcon";
import {
  getNewServiceRequestsForWorker,
  acceptWorkerBooking,
  declineWorkerBooking,
  getWorkerActiveJobs,
  getWorkerBookingHistory,
  updateWorkerJobStatus,
  updateWorkerConfiguration,
  getWorkerProfile,
  getMyNotifications,
  supabase
} from "../lib/supabase";
import { useTimeGreeting } from "../utils/greeting";

export default function WorkerDashboard({ lang = "en", currentUser, onOpenAuth, activeTab }) {
  const isEn = lang === "en";
  const greeting = useTimeGreeting(lang);

  // Worker Display Name & Profile
  const rawName = currentUser?.name || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Worker";
  const firstName = rawName.split(" ")[0] || "Worker";
  const workerProfile = currentUser?.workerProfile;

  // Modals state
  const [isManageAvailOpen, setIsManageAvailOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [isManageAreasOpen, setIsManageAreasOpen] = useState(false);

  // Availability State
  const [selectedSlots, setSelectedSlots] = useState(["09:00 AM - 12:00 PM"]);
  const [isAvailableToday, setIsAvailableToday] = useState(true);

  // Skills State (50 Categories Catalogue)
  const [skillsList, setSkillsList] = useState([
    "Plumbing",
    "Electrical Services",
    "AC Services",
    "Painting Services",
  ]);
  const [skillGroupFilter, setSkillGroupFilter] = useState("all");
  const [skillSearch, setSkillSearch] = useState("");
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [saveSkillsSuccessMsg, setSaveSkillsSuccessMsg] = useState("");

  // Service Areas State
  const [areasList, setAreasList] = useState(["Guntur", "Vijayawada"]);

  // Requests, Active Jobs, History
  const [loading, setLoading] = useState(true);
  const [newRequests, setNewRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [historyJobs, setHistoryJobs] = useState([]);

  // Action states
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptSuccessMsg, setAcceptSuccessMsg] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Load live data from Supabase if available
  const loadWorkerData = async () => {
    try {
      setLoading(true);
      if (currentUser?.id) {
        const [reqs, active, history, profile] = await Promise.all([
          getNewServiceRequestsForWorker(currentUser.id).catch(() => []),
          getWorkerActiveJobs(currentUser.id).catch(() => []),
          getWorkerBookingHistory(currentUser.id).catch(() => []),
          getWorkerProfile(currentUser.id).catch(() => null),
        ]);

        if (profile?.skills && Array.isArray(profile.skills)) {
          setSkillsList(profile.skills);
        }
        if (profile?.service_area && typeof profile.service_area === "string") {
          const areas = profile.service_area.split(",").map((a) => a.trim()).filter(Boolean);
          if (areas.length > 0) setAreasList(areas);
        }

        if (reqs && reqs.length > 0) {
          setNewRequests(
            reqs.map((r, i) => ({
              id: r.id,
              trade: r.service_category || r.category_name || "General Service",
              priority: i === 0 ? "High Priority" : "Medium",
              priorityType: i === 0 ? "high" : "medium",
              problem: r.description || r.problem_description || "Service request from customer.",
              location: r.address || `${r.locality || r.city || "Guntur"}, Andhra Pradesh`,
              date: r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : "Upcoming",
              time: r.preferred_time || "10:00 AM",
              photos: 1,
              badge: "Verified",
              customerName: r.profiles?.full_name || "Customer",
              customerPhone: r.profiles?.phone || "+91 98765 43210",
              icon: Briefcase,
              iconBg: "#e0f2fe",
              iconColor: "#0284c7",
            }))
          );
        } else {
          setNewRequests([]);
        }

        setActiveJobs(active || []);
        setHistoryJobs(history || []);
      } else {
        setNewRequests([]);
        setActiveJobs([]);
        setHistoryJobs([]);
      }
    } catch (err) {
      console.error("Worker data load error:", err);
      setNewRequests([]);
      setActiveJobs([]);
      setHistoryJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();

    // Supabase Realtime subscription for incoming booking requests and updates
    const channel = supabase
      .channel("worker-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          loadWorkerData();
        }
      )
      .subscribe();

    // Cross-tab and local-storage event listener for instant local sync
    const handleLocalBookingUpdate = () => {
      loadWorkerData();
    };

    window.addEventListener("ws_booking_updated", handleLocalBookingUpdate);
    window.addEventListener("storage", handleLocalBookingUpdate);
    window.addEventListener("focus", handleLocalBookingUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("ws_booking_updated", handleLocalBookingUpdate);
      window.removeEventListener("storage", handleLocalBookingUpdate);
      window.removeEventListener("focus", handleLocalBookingUpdate);
    };
  }, [currentUser?.id]);

  // Accept Booking Request
  const handleAcceptRequest = async (requestItem) => {
    try {
      setAcceptingId(requestItem.id);
      await acceptWorkerBooking(requestItem.id);
      setAcceptSuccessMsg(`Accepted request for ${requestItem.trade}!`);
      await loadWorkerData();

      setTimeout(() => {
        setAcceptSuccessMsg("");
      }, 3000);
    } catch (err) {
      console.error("Accept error:", err);
      alert(`Could not accept booking: ${err.message}`);
    } finally {
      setAcceptingId(null);
    }
  };

  // Decline Booking Request
  const handleDeclineRequest = async (requestId) => {
    try {
      await declineWorkerBooking(requestId);
      await loadWorkerData();
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  // Toggle Time Slot
  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Update Active Job Status: 'Accepted' -> 'In Progress' -> 'Completed'
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      setStatusUpdatingId(jobId);
      await updateWorkerJobStatus(jobId, newStatus);
      await loadWorkerData();
    } catch (err) {
      alert(`Could not update job status: ${err.message}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Save worker skills to Supabase
  const handleSaveSkills = async () => {
    try {
      setIsSavingSkills(true);
      const res = await updateWorkerConfiguration({
        skills: skillsList,
        workerUserId: currentUser?.id,
      });
      if (res?.skills) {
        setSkillsList(res.skills);
      }
      await loadWorkerData();
      setSaveSkillsSuccessMsg(
        isEn
          ? `Successfully saved ${skillsList.length} skills! Customer catalog updated.`
          : `${skillsList.length} నైపుణ్యాలు విజయవంతంగా భద్రపరచబడ్డాయి!`
      );
      setTimeout(() => {
        setSaveSkillsSuccessMsg("");
        setIsEditSkillsOpen(false);
      }, 1400);
    } catch (err) {
      console.error("Could not save worker skills:", err);
      alert(`Could not save skills: ${err.message}`);
    } finally {
      setIsSavingSkills(false);
    }
  };

  // Toggle single skill in skillsList
  const toggleSkill = (skillName) => {
    if (skillsList.includes(skillName)) {
      setSkillsList(skillsList.filter((s) => s !== skillName));
    } else {
      setSkillsList([...skillsList, skillName]);
    }
  };

  return (
    <div className="worker-dashboard-container">
      {/* 1. HERO BANNER (Matches user reference image) */}
      <div className="worker-hero-card">
        <div className="worker-hero-left">
          {/* Worker Avatar Illustration */}
          <div className="worker-avatar-circle">
            <svg width="68" height="68" viewBox="0 0 70 70" fill="none">
              <circle cx="35" cy="35" r="35" fill="#0284c7" />
              {/* Cap */}
              <path d="M22 24C22 17 28 13 35 13C42 13 48 17 48 24H22Z" fill="#38bdf8" />
              <path d="M19 24H51V26H19V24Z" fill="#bae6fd" />
              {/* Face */}
              <circle cx="35" cy="31" r="10" fill="#fcd34d" />
              {/* Blue Uniform Shirt */}
              <path d="M16 54C16 43 25 40 35 40C45 40 54 43 54 54V70H16V54Z" fill="#0369a1" />
              {/* Shirt Collar */}
              <path d="M30 40L35 46L40 40" stroke="#bae6fd" strokeWidth="2" />
            </svg>
          </div>

          <div>
            <h1 className="worker-hero-greeting">
              {greeting}, {firstName}!
            </h1>
            <p className="worker-hero-sub">
              Trusted service. Happy customers. More opportunities.
            </p>
            <div className="worker-badge-verified">
              <ShieldCheck size={14} />
              <span>Verified Worker</span>
            </div>
          </div>
        </div>

        {/* Right side illustration and message */}
        <div className="worker-hero-right">
          <p className="worker-hero-quote">
            You're making a difference in your community!
          </p>
          <div style={{ opacity: 0.85 }}>
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <path d="M32 10C22 10 16 16 16 26H48C48 16 42 10 32 10Z" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M12 26H52V30H12V26Z" fill="#38bdf8" />
              <rect x="22" y="34" width="20" height="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Accept Notification Toast */}
      {acceptSuccessMsg && (
        <div className="auth-alert success" style={{ marginBottom: "0.5rem" }}>
          <CheckCircle size={18} />
          <span>{acceptSuccessMsg}</span>
        </div>
      )}

      {/* 2. 4 METRIC STATS ROW */}
      <div className="worker-stats-row">
        {/* Card 1: New Requests */}
        <div className="worker-stat-card">
          <div className="worker-stat-top">
            <div className="worker-stat-icon-wrap" style={{ backgroundColor: "#ecfeff", color: "#0891b2" }}>
              <Zap size={20} />
            </div>
            <div className="worker-stat-arrow">
              <ArrowRight size={13} />
            </div>
          </div>
          <div>
            <div className="worker-stat-label">New Requests</div>
            <div className="worker-stat-value">{newRequests.length}</div>
            <div className="worker-stat-desc">Waiting for your response</div>
          </div>
        </div>

        {/* Card 2: Active Jobs */}
        <div className="worker-stat-card">
          <div className="worker-stat-top">
            <div className="worker-stat-icon-wrap" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
              <CalendarCheck size={20} />
            </div>
            <div className="worker-stat-arrow">
              <ArrowRight size={13} />
            </div>
          </div>
          <div>
            <div className="worker-stat-label">Active Jobs</div>
            <div className="worker-stat-value">{activeJobs.length}</div>
            <div className="worker-stat-desc">In progress</div>
          </div>
        </div>

        {/* Card 3: Completed Jobs */}
        <div className="worker-stat-card">
          <div className="worker-stat-top">
            <div className="worker-stat-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
              <CheckCircle size={20} />
            </div>
            <div className="worker-stat-arrow">
              <ArrowRight size={13} />
            </div>
          </div>
          <div>
            <div className="worker-stat-label">Completed Jobs</div>
            <div className="worker-stat-value">{historyJobs.length}</div>
            <div className="worker-stat-desc">All time completed</div>
          </div>
        </div>

        {/* Card 4: Rating */}
        <div className="worker-stat-card">
          <div className="worker-stat-top">
            <div className="worker-stat-icon-wrap" style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}>
              <Star size={20} />
            </div>
            <div className="worker-stat-arrow">
              <ArrowRight size={13} />
            </div>
          </div>
          <div>
            <div className="worker-stat-label">Rating</div>
            <div className="worker-stat-value">
              {workerProfile?.rating ? Number(workerProfile.rating).toFixed(1) : "5.0"}
            </div>
            <div className="worker-stat-desc">Verified artisan score</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION */}
      <div className="worker-main-grid">
        {/* LEFT COLUMN: New Requests + Active Jobs / History Split */}
        <div className="worker-left-col">
          {/* Card: New Service Requests */}
          <div className="cust-card">
            <div className="cust-card-header">
              <div className="cust-card-title">
                <Briefcase size={20} color="#0284c7" />
                <span>New Service Requests</span>
              </div>
              <button
                className="cust-view-all-link"
                onClick={() => alert("All incoming service requests are currently visible below.")}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {newRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: "0 auto 8px" }} />
                <b>All Caught Up!</b>
                <p style={{ fontSize: "0.82rem", margin: "4px 0 0" }}>
                  No pending requests waiting right now. Keep your availability active!
                </p>
              </div>
            ) : (
              <div>
                {newRequests.map((req) => (
                  <div key={req.id} className="worker-request-item">
                    <div className="worker-request-left">
                      {/* Trade Thumbnail */}
                      <div className="worker-request-thumb" style={{ backgroundColor: req.iconBg, color: req.iconColor }}>
                        {req.trade.includes("Plumb") ? (
                          <Droplet size={26} />
                        ) : req.trade.includes("AC") ? (
                          <Clock size={26} />
                        ) : req.trade.includes("Paint") ? (
                          <Paintbrush size={26} />
                        ) : (
                          <Zap size={26} />
                        )}
                      </div>

                      {/* Request Details */}
                      <div>
                        <div className="worker-request-title-row">
                          <span className="worker-request-title">{req.trade}</span>
                          <span
                            className={
                              req.priorityType === "high"
                                ? "badge-priority-high"
                                : req.priorityType === "medium"
                                ? "badge-priority-medium"
                                : "badge-priority-low"
                            }
                          >
                            {req.priority}
                          </span>
                        </div>

                        <div className="worker-request-problem">{req.problem}</div>

                        <div className="worker-request-meta-row">
                          <span className="worker-request-meta-item">
                            <MapPin size={13} color="#0284c7" />
                            <span>{req.location}</span>
                          </span>
                          <span className="worker-request-meta-item">
                            <Calendar size={13} color="#64748b" />
                            <span>{req.date}</span>
                          </span>
                          <span className="worker-request-meta-item">
                            <Clock size={13} color="#64748b" />
                            <span>{req.time}</span>
                          </span>
                          <span className="worker-request-meta-item">
                            <Image size={13} color="#64748b" />
                            <span>{req.photos} photo</span>
                          </span>
                          <span className="worker-request-meta-item" style={{ color: "#0891b2", fontWeight: 600 }}>
                            • {req.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info & Action Buttons */}
                    <div className="worker-request-right">
                      <div className="worker-customer-info">
                        <div className="worker-customer-name">
                          <User size={13} color="#0284c7" />
                          <span>{req.customerName}</span>
                        </div>
                        <div className="worker-customer-phone">{req.customerPhone}</div>
                      </div>

                      <div className="worker-request-actions">
                        <button
                          className="btn-worker-accept"
                          disabled={acceptingId === req.id}
                          onClick={() => handleAcceptRequest(req)}
                        >
                          {acceptingId === req.id ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          className="btn-worker-decline"
                          onClick={() => handleDeclineRequest(req.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side: My Active Jobs & Booking History */}
          <div className="worker-bottom-split">
            {/* Box 1: My Active Jobs */}
            <div className="cust-card">
              <div className="cust-card-header" style={{ marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CalendarCheck size={18} color="#0284c7" />
                  <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    My Active Jobs
                  </h4>
                </div>
                <button className="cust-view-all-link" onClick={() => alert("Viewing all active jobs")}>
                  <span>View All</span>
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="cust-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem", color: "#64748b", fontSize: "0.82rem" }}>
                          No active jobs in progress. Accepted jobs will appear here.
                        </td>
                      </tr>
                    ) : (
                      activeJobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <b style={{ color: "#0f172a", fontSize: "0.82rem" }}>
                              {job.service_category}
                            </b>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.78rem", color: "#475569" }}>
                              {job.location}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" }}>
                              {job.date}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                className={
                                  job.status === "In Progress" || job.status === "in_progress"
                                    ? "status-pill-in-progress"
                                    : job.status === "On the Way" || job.status === "on_the_way"
                                    ? "status-pill-ontheway"
                                    : "status-pill-accepted"
                                }
                              >
                                {job.status === "in_progress" ? "In Progress" : job.status === "on_the_way" ? "On the Way" : job.status}
                              </span>
                              {(job.status === "Accepted" || job.status === "accepted") && (
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <button
                                    style={{
                                      background: "#d97706",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "4px 8px",
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                    disabled={statusUpdatingId === job.id}
                                    onClick={() => handleUpdateJobStatus(job.id, "on_the_way")}
                                  >
                                    <Truck size={10} />
                                    <span>On the Way</span>
                                  </button>
                                  <button
                                    style={{
                                      background: "#0284c7",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "4px 8px",
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                    disabled={statusUpdatingId === job.id}
                                    onClick={() => handleUpdateJobStatus(job.id, "in_progress")}
                                  >
                                    <Play size={10} />
                                    <span>Start Job</span>
                                  </button>
                                </div>
                              )}
                              {(job.status === "On the Way" || job.status === "on_the_way") && (
                                <button
                                  style={{
                                    background: "#0284c7",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                  disabled={statusUpdatingId === job.id}
                                  onClick={() => handleUpdateJobStatus(job.id, "in_progress")}
                                >
                                  <Play size={10} />
                                  <span>Start Job</span>
                                </button>
                              )}
                              {(job.status === "In Progress" || job.status === "in_progress") && (
                                <button
                                  style={{
                                    background: "#10b981",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                  disabled={statusUpdatingId === job.id}
                                  onClick={() => handleUpdateJobStatus(job.id, "Completed")}
                                >
                                  <Check size={10} />
                                  <span>Mark Completed</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Box 2: Booking History */}
            <div className="cust-card">
              <div className="cust-card-header" style={{ marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={18} color="#10b981" />
                  <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Booking History
                  </h4>
                </div>
                <button className="cust-view-all-link" onClick={() => alert("Viewing full booking history")}>
                  <span>View All</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {historyJobs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b", fontSize: "0.82rem" }}>
                    No completed jobs yet. Completed service requests will be archived here.
                  </div>
                ) : (
                  historyJobs.map((hist) => (
                    <div
                      key={hist.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: "#e0f2fe",
                            color: "#0284c7",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Check size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f172a" }}>
                            {hist.service_category}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{hist.date}</div>
                        </div>
                      </div>
                      <span className="status-pill-completed">Completed</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Availability, My Skills, Service Areas, Mobile App */}
        <div className="worker-right-col">
          {/* Card 1: Availability */}
          <div className="cust-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} color="#0284c7" />
                <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Availability
                </h4>
              </div>
              <button
                onClick={() => setIsManageAvailOpen(true)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                Manage
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "999px",
                }}
              >
                Available Today
              </span>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Mon, May 12, 2025</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["09:00 AM - 12:00 PM", "01:00 PM - 05:00 PM", "06:00 PM - 09:00 PM"].map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: isSelected ? "linear-gradient(90deg, #06b6d4, #0284c7)" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#475569",
                      border: isSelected ? "none" : "1px solid #cbd5e1",
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: My Skills */}
          <div className="cust-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={18} color="#0284c7" />
                <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  My Skills
                </h4>
              </div>
              <button
                onClick={() => setIsEditSkillsOpen(true)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    color: "#0369a1",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    padding: "5px 10px",
                    borderRadius: "8px",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Service Areas */}
          <div className="cust-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="#0284c7" />
                <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Service Areas
                </h4>
              </div>
              <button
                onClick={() => setIsManageAreasOpen(true)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                Manage
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", fontSize: "0.82rem", fontWeight: "600", color: "#0f172a" }}>
              {areasList.map((area) => (
                <span key={area} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} color="#059669" />
                  <span>{area}</span>
                </span>
              ))}
            </div>

            {/* Stylized Coverage Map Radar */}
            <div
              style={{
                position: "relative",
                height: "125px",
                background: "linear-gradient(135deg, #e0f2fe 0%, #ecfeff 100%)",
                borderRadius: "12px",
                border: "1px solid #bae6fd",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Radar rings */}
              <div
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "2px dashed rgba(2, 132, 199, 0.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(2, 132, 199, 0.15)",
                }}
              />
              {/* Guntur Pin */}
              <div style={{ position: "absolute", bottom: "35px", left: "60px", textAlign: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0284c7", margin: "0 auto 2px" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#0f172a" }}>Guntur</span>
              </div>
              {/* Vijayawada Pin */}
              <div style={{ position: "absolute", top: "30px", right: "60px", textAlign: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0284c7", margin: "0 auto 2px" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#0f172a" }}>Vijayawada</span>
              </div>
            </div>
          </div>

          {/* Card 4: WorkSphere AI Mobile App Promo */}
          <div className="worker-app-card">
            {/* Phone Illustration */}
            <div style={{ width: "48px", height: "80px", borderRadius: "8px", background: "#0284c7", border: "2px solid #38bdf8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: "10px", height: "2px", background: "#bae6fd", borderRadius: "2px", marginBottom: "6px" }} />
              <Sparkles size={16} color="#ffffff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#0f172a", lineHeight: 1.25, marginBottom: "4px" }}>
                Get the WorkSphere AI Mobile App
              </div>
              <div style={{ fontSize: "0.72rem", color: "#475569", lineHeight: 1.35, marginBottom: "6px" }}>
                Stay connected, receive jobs, manage your work — anytime, anywhere.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#0284c7" }}>
                  🤖 Available on Android
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ background: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", flexShrink: 0 }}>
              <QrCode size={36} color="#0f172a" />
              <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#64748b", marginTop: "2px" }}>
                Scan to Install
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS: MANAGE AVAILABILITY, EDIT SKILLS, MANAGE SERVICE AREAS
          ========================================================================= */}

      {/* MANAGE AVAILABILITY MODAL */}
      {isManageAvailOpen && (
        <div className="modal-backdrop" onClick={() => setIsManageAvailOpen(false)}>
          <div className="modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Manage Availability
              </h3>
              <button onClick={() => setIsManageAvailOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <XCircle size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
              Set which time windows you are open to receiving on-site job assignments today.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
              {["09:00 AM - 12:00 PM", "01:00 PM - 05:00 PM", "06:00 PM - 09:00 PM"].map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "#ecfeff" : "#f8fafc",
                      color: isSelected ? "#0891b2" : "#334155",
                      border: isSelected ? "2px solid #06b6d4" : "1px solid #cbd5e1",
                    }}
                  >
                    <span>{slot}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setIsManageAvailOpen(false)}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #06b6d4, #0284c7)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Save Availability
            </button>
          </div>
        </div>
      )}

      {/* EDIT SKILLS MODAL (50 SERVICE CATEGORIES CATALOGUE) */}
      {isEditSkillsOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditSkillsOpen(false)}>
          <div className="modal-card" style={{ maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Select Offered Categories & Trades
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "2px 0 0" }}>
                  Choose which of the 50 service categories you accept booking requests for.
                </p>
              </div>
              <button onClick={() => setIsEditSkillsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <XCircle size={22} />
              </button>
            </div>

            {/* Success Message Banner */}
            {saveSkillsSuccessMsg && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={16} color="#059669" />
                <span>{saveSkillsSuccessMsg}</span>
              </div>
            )}

            {/* Search and Group Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px" }}>
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search among all 50 categories or subservices..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.85rem", width: "100%" }}
                />
              </div>

              {/* Group cluster pills */}
              <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "4px" }}>
                <button
                  type="button"
                  onClick={() => setSkillGroupFilter("all")}
                  style={{
                    background: skillGroupFilter === "all" ? "#0284c7" : "#f1f5f9",
                    color: skillGroupFilter === "all" ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  All 10 Groups
                </button>
                {SERVICE_GROUPS.map((grp) => {
                  const label = grp.title || grp.name || `Group ${grp.id}`;
                  const shortName = typeof label === "string" ? label.split(" ")[0] : `Group ${grp.id}`;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSkillGroupFilter(grp.id)}
                      style={{
                        background: skillGroupFilter === grp.id ? "#0284c7" : "#f1f5f9",
                        color: skillGroupFilter === grp.id ? "#ffffff" : "#475569",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Count Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "3px 10px", borderRadius: "999px" }}>
                ✓ {skillsList.length} Categories Selected
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Matching requests will be routed to your queue
              </span>
            </div>

            {/* 50 Categories Grid List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px", overflowY: "auto", flex: 1, maxHeight: "360px", padding: "4px" }}>
              {SERVICE_CATEGORIES.filter((cat) => {
                if (skillGroupFilter !== "all" && cat.groupId !== skillGroupFilter) return false;
                if (skillSearch && skillSearch.trim()) {
                  const q = skillSearch.toLowerCase();
                  const mName = cat.name.toLowerCase().includes(q);
                  const mGrp = (cat.groupName || "").toLowerCase().includes(q);
                  const mSub = (cat.services || []).some((s) => s.name.toLowerCase().includes(q));
                  if (!mName && !mGrp && !mSub) return false;
                }
                return true;
              }).map((cat) => {
                const isSelected = skillsList.includes(cat.name);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleSkill(cat.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: isSelected ? "#e0f2fe" : "#ffffff",
                      border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CategoryIcon name={cat.icon} size={16} color={isSelected ? "#0284c7" : "#475569"} />
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isSelected ? "#0369a1" : "#1e293b" }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                          {cat.services?.length || 5} sub-services
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        border: isSelected ? "2px solid #0284c7" : "1px solid #94a3b8",
                        background: isSelected ? "#0284c7" : "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with Save button */}
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsEditSkillsOpen(false)}
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                style={{
                  flex: 2,
                  background: "linear-gradient(90deg, #06b6d4, #0284c7)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {isSavingSkills ? "Saving Catalogue Skills..." : `Save Offered Trades (${skillsList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE SERVICE AREAS MODAL */}
      {isManageAreasOpen && (
        <div className="modal-backdrop" onClick={() => setIsManageAreasOpen(false)}>
          <div className="modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Manage Service Areas
              </h3>
              <button onClick={() => setIsManageAreasOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <XCircle size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
              Select the towns and cities where you can take on-site customer service calls.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
              {["Guntur", "Vijayawada", "Tenali", "Mangalagiri"].map((area) => {
                const isSelected = areasList.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => {
                      if (isSelected) {
                        setAreasList(areasList.filter((a) => a !== area));
                      } else {
                        setAreasList([...areasList, area]);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "#ecfdf5" : "#f8fafc",
                      color: isSelected ? "#059669" : "#334155",
                      border: isSelected ? "2px solid #10b981" : "1px solid #cbd5e1",
                    }}
                  >
                    <span>{area}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setIsManageAreasOpen(false)}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #06b6d4, #0284c7)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Save Service Areas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
