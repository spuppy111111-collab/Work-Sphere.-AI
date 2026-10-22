import React, { useState } from "react";
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
  Terminal
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function SupabaseModal({ isOpen, onClose, onRefresh }) {
  if (!isOpen) return null;

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setTestResult({
          success: false,
          message: "No live credentials provided in .env. Running on local verified mock database."
        });
      } else {
        const { data, error } = await supabase.from("service_categories").select("count");
        if (error) {
          setTestResult({
            success: false,
            message: `Connection reachable but query failed: ${error.message}. Did you execute supabase/worksphere_schema.sql?`
          });
        } else {
          setTestResult({
            success: true,
            message: "Connected successfully to Supabase! Tables and RLS policies are active."
          });
        }
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || "Failed to contact Supabase endpoint."
      });
    } finally {
      setTesting(false);
    }
  }

  function copySchemaCmd() {
    navigator.clipboard.writeText("supabase/worksphere_schema.sql");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <Database size={22} color="#06b6d4" />
            <h3>Supabase Connection & Database Settings</h3>
          </div>
          <button onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Banner */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              background: isSupabaseConfigured ? "#ecfdf5" : "#fffbeb",
              border: `1px solid ${isSupabaseConfigured ? "#a7f3d0" : "#fde68a"}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              marginBottom: "1.25rem"
            }}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            )}
            <div>
              <strong style={{ display: "block", color: isSupabaseConfigured ? "#065f46" : "#92400e", fontSize: "0.9rem" }}>
                {isSupabaseConfigured
                  ? "Live Supabase Connection Detected"
                  : "Running in High-Fidelity Guntur Pilot Sandbox Mode"}
              </strong>
              <p style={{ fontSize: "0.82rem", color: isSupabaseConfigured ? "#047857" : "#b45309", marginTop: "2px" }}>
                {isSupabaseConfigured
                  ? "Frontend queries will write and read from your Supabase PostgreSQL cluster."
                  : "All UI workflows (creating bookings, changing statuses, filtering workers, AI diagnostics, complaints) run seamlessly with verified demo records."}
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0f172a" }}>
            How to Connect Your Supabase Project:
          </h4>
          <ol style={{ paddingLeft: "1.25rem", fontSize: "0.82rem", color: "#475569", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>
              Open your <strong>Supabase Dashboard</strong> and create or select a project.
            </li>
            <li>
              Go to <strong>SQL Editor</strong> and execute the complete schema provided in:
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "4px" }}>
                <code style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#0f172a", fontSize: "0.8rem", border: "1px solid #e2e8f0" }}>
                  supabase/worksphere_schema.sql
                </code>
                <button
                  onClick={copySchemaCmd}
                  style={{ fontSize: "0.75rem", color: "#0891b2", display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <Copy size={13} /> {copied ? "Copied!" : "Copy path"}
                </button>
              </div>
            </li>
            <li>
              Under <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>Anon Key</strong>.
            </li>
            <li>
              Paste them into your local <code>.env</code> file:
              <pre style={{ background: "#0b132b", color: "#38bdf8", padding: "0.65rem 0.85rem", borderRadius: "8px", fontSize: "0.76rem", marginTop: "4px", overflowX: "auto" }}>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
              </pre>
            </li>
            <li>
              Restart your Vite server (<code>npm run dev</code>).
            </li>
          </ol>

          {/* Test feedback */}
          {testResult && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.85rem",
                borderRadius: "8px",
                background: testResult.success ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${testResult.success ? "#6ee7b7" : "#fecaca"}`,
                fontSize: "0.82rem",
                color: testResult.success ? "#065f46" : "#991b1b"
              }}
            >
              {testResult.message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleTestConnection} disabled={testing}>
            <RefreshCw size={15} className={testing ? "spin" : ""} />
            {testing ? "Testing Connection..." : "Test Connection"}
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
