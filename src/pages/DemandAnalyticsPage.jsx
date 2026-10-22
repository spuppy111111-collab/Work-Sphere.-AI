import React, { useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Briefcase,
  TrendingUp,
  Layers
} from "lucide-react";
import { LOCALITIES } from "../data/initialData";

export default function DemandAnalyticsPage({ lang, bookings = [], workers = [] }) {
  const isEn = lang === "en";
  const [timePeriod, setTimePeriod] = useState("This Month");

  // Real KPI calculations
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) =>
    ["Completed", "Confirmed"].includes(b.status)
  );
  const completionRate =
    totalBookings > 0
      ? `${Math.round((completedBookings.length / totalBookings) * 100)}%`
      : "0%";
  const pendingRequests = bookings.filter((b) => b.status === "Requested").length;
  const grossGmv = completedBookings.reduce(
    (sum, b) => sum + (Number(b.quotedAmount) || 0),
    0
  );

  // Real Locality demand calculated from bookings and registered workers
  const localityStats = useMemo(() => {
    return LOCALITIES.map((loc) => {
      const locRequests = bookings.filter(
        (b) => b.locality?.toLowerCase() === loc.name.toLowerCase()
      ).length;
      const locWorkers = workers.filter(
        (w) =>
          w.locality?.toLowerCase() === loc.name.toLowerCase() &&
          w.idVerified
      ).length;
      const shortage = locRequests > 0 && locWorkers === 0;

      return {
        ...loc,
        activeRequests: locRequests,
        workersAvailable: locWorkers,
        shortage
      };
    });
  }, [bookings, workers]);

  // Real Category breakdown from bookings
  const categoryStats = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const cat = b.categoryName || b.category || "General";
      if (!map[cat]) map[cat] = 0;
      map[cat] += 1;
    });
    const total = bookings.length || 1;
    return Object.entries(map).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }, [bookings]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEn ? "Local Demand & Market Analytics" : "స్థానిక డిమాండ్ & కొరత విశ్లేషణ"}
          </h1>
          <p className="page-subtitle">
            {isEn
              ? "Actual market metrics, locality supply health, and category booking distribution"
              : "సేవల డిమాండ్, కార్మికుల లభ్యత మరియు బుకింగ్‌ల విశ్లేషణ"}
          </p>
        </div>
      </div>

      {/* Real Performance KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">{isEn ? "Total Bookings" : "మొత్తం బుకింగ్‌లు"}</span>
            <div className="kpi-icon" style={{ background: "#ecfeff", color: "#0891b2" }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalBookings}</div>
          <div className="kpi-footer">
            <span className="trend-badge neutral">
              {pendingRequests} {isEn ? "pending" : "వేచి ఉంది"}
            </span>
            <span>{isEn ? "Recorded requests" : "నమోదైనవి"}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">{isEn ? "Booking Completion Rate" : "పూర్తి రేటు"}</span>
            <div className="kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value">{completionRate}</div>
          <div className="kpi-footer">
            <span className="trend-badge positive">
              {completedBookings.length} {isEn ? "completed" : "పూర్తయినవి"}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">{isEn ? "Pending Requests" : "పరిష్కారం కావాల్సినవి"}</span>
            <div className="kpi-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingRequests}</div>
          <div className="kpi-footer">
            <span className={`trend-badge ${pendingRequests > 0 ? "warning" : "positive"}`}>
              {pendingRequests > 0 ? (isEn ? "Needs Artisan Action" : "చర్య అవసరం") : (isEn ? "All Dispatched" : "అన్నీ పూర్తయ్యాయి")}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">{isEn ? "Completed GMV" : "మొత్తం ఆదాయం"}</span>
            <div className="kpi-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{grossGmv.toLocaleString("en-IN")}</div>
          <div className="kpi-footer">
            <span className="trend-badge positive">
              {isEn ? "Direct payments" : "చెల్లింపులు"}
            </span>
          </div>
        </div>
      </div>

      {/* Demand by Locality Table */}
      <div className="panel-card" style={{ marginBottom: "2rem" }}>
        <div className="panel-header">
          <div className="panel-title">
            <MapPin size={18} color="#0891b2" />
            <span>{isEn ? "Locality Request vs Verified Worker Supply Index" : "ప్రాంతాల వారీగా డిమాండ్ vs కార్మికుల లభ్యత"}</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {LOCALITIES.length} {isEn ? "Tracked Localities" : "ప్రాంతాలు"}
          </span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{isEn ? "Locality" : "ప్రాంతం"}</th>
                  <th>{isEn ? "Pincode" : "పిన్‌కోడ్"}</th>
                  <th>{isEn ? "Active Requests" : "అభ్యర్థనలు"}</th>
                  <th>{isEn ? "Verified Workers" : "ధృవీకరించబడిన కార్మికులు"}</th>
                  <th>{isEn ? "Supply Status" : "సరఫరా స్థితి"}</th>
                </tr>
              </thead>
              <tbody>
                {localityStats.map((loc) => (
                  <tr key={loc.id}>
                    <td>
                      <b style={{ color: "#0f172a" }}>{loc.name}</b>
                    </td>
                    <td>
                      <span style={{ color: "#64748b" }}>{loc.pincode}</span>
                    </td>
                    <td>
                      <b style={{ color: "#0284c7" }}>{loc.activeRequests}</b>
                    </td>
                    <td>
                      <b style={{ color: "#059669" }}>{loc.workersAvailable}</b>
                    </td>
                    <td>
                      {loc.shortage ? (
                        <span
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: "0.74rem",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 700
                          }}
                        >
                          ⚠️ Shortage (Needs Onboarding)
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            fontSize: "0.74rem",
                            padding: "2px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          ✓ Adequate Supply
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={18} color="#0284c7" />
            <span>{isEn ? "Booking Requests by Trade Category" : "కేటగిరీల వారీగా బుకింగ్‌లు"}</span>
          </div>
        </div>
        <div className="panel-body">
          {categoryStats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b" }}>
              <Layers size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
              <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>
                {isEn ? "No bookings recorded yet" : "ఇంకా బుకింగ్‌లు నమోదు కాలేదు"}
              </p>
              <p style={{ fontSize: "0.82rem", margin: 0 }}>
                {isEn ? "As bookings are placed across various categories, distribution metrics will chart here automatically." : "బుకింగ్‌లు నమోదు కాగానే ఇక్కడ వివరాలు కనిపిస్తాయి."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {categoryStats.map((cat) => (
                <div key={cat.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{cat.category}</span>
                    <span style={{ color: "#64748b" }}>
                      {cat.count} {isEn ? "jobs" : "పనులు"} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        background: "#0284c7"
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
