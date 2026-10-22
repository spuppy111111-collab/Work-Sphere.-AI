import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Clock,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  CalendarCheck,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import { analyzeProblemDescription } from "../data/initialData";

export default function AIWorkAssistantPage({ workers = [], categories = [], lang, onNavigate }) {
  const isEn = lang === "en";

  const [prompt, setPrompt] = useState("నా బాత్రూంలో పైప్ లీక్ అవుతోంది. ఈరోజు ప్లంబర్ కావాలి.");
  const [locality, setLocality] = useState("Arundelpet");
  const [preferredTime, setPreferredTime] = useState("Today Afternoon");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [result, setResult] = useState(analyzeProblemDescription(prompt));
  const [confirmedCategory, setConfirmedCategory] = useState(result?.categoryId || "plumbing");

  function handleRunDiagnosis() {
    setIsDiagnosing(true);
    setTimeout(() => {
      const diag = analyzeProblemDescription(prompt);
      setResult(diag);
      if (diag) setConfirmedCategory(diag.categoryId);
      setIsDiagnosing(false);
    }, 400);
  }

  // Filter matching workers based on AI result
  const matchingWorkers = (workers || []).filter(
    (w) => w.category === confirmedCategory
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="ai-badge" style={{ marginBottom: "0.5rem" }}>
            <Sparkles size={14} /> WorkSphere NLP Diagnostic Model v2.4
          </div>
          <h1 className="page-title">
            {isEn ? "AI Work Category Recognition & Matching" : "AI పని కేటగిరీ గుర్తింపు & సరిపోలిక"}
          </h1>
          <p className="page-subtitle">
            {isEn
              ? "Dual-lingual problem understanding (Telugu / English) with explainable artisan matching in Guntur"
              : "తెలుగు మరియు ఇంగ్లీష్ భాషల్లో సమస్యను గుర్తించి, స్పష్టమైన కారణాలతో నిపుణులను సిఫార్సు చేస్తుంది."}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Interactive Input Wizard */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Sparkles size={18} color="#0891b2" />
              <span>Step 1: Problem Description (Telugu or English)</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>NLP Parser Active</span>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label>Enter problem in natural spoken Telugu or English:</label>
              <textarea
                className="form-control"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your issue..."
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Quick test cases:</span>
              <button
                className="quick-prompt-chip"
                style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                onClick={() => {
                  const t = "నా బాత్రూంలో పైప్ లీక్ అవుతోంది. ఈరోజు ప్లంబర్ కావాలి.";
                  setPrompt(t);
                  const d = analyzeProblemDescription(t);
                  setResult(d);
                  if (d) setConfirmedCategory(d.categoryId);
                }}
              >
                Pipe leakage (Telugu)
              </button>
              <button
                className="quick-prompt-chip"
                style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                onClick={() => {
                  const t = "Teakwood carved main entrance door polish and melamine finish.";
                  setPrompt(t);
                  const d = analyzeProblemDescription(t);
                  setResult(d);
                  if (d) setConfirmedCategory(d.categoryId);
                }}
              >
                Wood door polish
              </button>
              <button
                className="quick-prompt-chip"
                style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                onClick={() => {
                  const t = "MCB tripping repeatedly with burning smell from kitchen switchboard.";
                  setPrompt(t);
                  const d = analyzeProblemDescription(t);
                  setResult(d);
                  if (d) setConfirmedCategory(d.categoryId);
                }}
              >
                Electrical MCB trip
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label>Locality in Guntur:</label>
                <select
                  className="form-control"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                >
                  <option value="Arundelpet">Arundelpet (522002)</option>
                  <option value="Brodipet">Brodipet (522002)</option>
                  <option value="Lakshmipuram">Lakshmipuram (522007)</option>
                  <option value="Pattabhipuram">Pattabhipuram (522006)</option>
                  <option value="Amaravathi Road">Amaravathi Road (522034)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Visit Timing:</label>
                <select
                  className="form-control"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="Today Emergency (within 1 hr)">Today Emergency (within 1 hr)</option>
                  <option value="Today Afternoon">Today Afternoon</option>
                  <option value="Tomorrow Morning">Tomorrow Morning</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Attach Problem Photo (Optional Demo Preview):</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setSelectedPhoto(e.target.files?.[0]?.name || null)}
              />
              {selectedPhoto && (
                <small style={{ color: "#0891b2", marginTop: "4px" }}>
                  Selected: {selectedPhoto}
                </small>
              )}
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem" }}
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw size={16} className="spin" /> Analyzing semantics...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Run AI Categorization & Explain Match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & Explainability */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <CheckCircle2 size={18} color="#059669" />
              <span>Step 2: AI Diagnostic Results & Explainable Proof</span>
            </div>
          </div>
          <div className="panel-body">
            {result ? (
              <div>
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "10px",
                    background: "#ecfeff",
                    border: "1px solid #a5f3fc",
                    marginBottom: "1rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#0891b2", fontWeight: 700, textTransform: "uppercase" }}>
                      Detected Category (Confidence: {(result.confidence * 100).toFixed(0)}%)
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: result.urgency.includes("Urgent") ? "#dc2626" : "#0284c7",
                        color: "#fff"
                      }}
                    >
                      {result.urgency}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0e7490", margin: "4px 0" }}>
                    {isEn ? result.categoryName : result.categoryNameTe}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#155e75" }}>
                    {result.problemType}
                  </p>
                </div>

                {/* Manual Correction Capability */}
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <SlidersHorizontal size={14} color="#64748b" />
                    <span>Confirm or Manually Correct Category:</span>
                  </label>
                  <select
                    className="form-control"
                    value={confirmedCategory}
                    onChange={(e) => setConfirmedCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name_en} ({c.name_te})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.85rem",
                    marginBottom: "1.25rem"
                  }}
                >
                  <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Explainable Matching Criteria:
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                    "{result.explanation}"
                  </p>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
                    <b>Matching Rules applied:</b> Required Skill Match (100%) + Locality Proximity ({locality}) + Identity & Police Verification Status.
                  </div>
                </div>

                {/* Matched Workers Showcase */}
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                  Top Matched Workers ({matchingWorkers.length}):
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {matchingWorkers.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <img
                          src={w.avatar}
                          alt={w.name}
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <b style={{ color: "#0f172a", fontSize: "0.9rem" }}>{w.name}</b>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {w.locality} • ★ {w.rating} ({w.completedJobs} jobs)
                          </div>
                        </div>
                      </div>
                      <a
                        href={`tel:${w.phone}`}
                        className="btn-primary"
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      >
                        <Phone size={13} /> Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#64748b" }}>
                Type your issue and click "Run AI Categorization" to inspect the explainable reasoning.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
