"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const navItems = [
  { name: "Dashboard", href: "/", icon: "▣" },
  { name: "Jobs", href: "/jobs", icon: "◈" },
  { name: "Applicants", href: "/applicants", icon: "◉" },
  { name: "AI Screening", href: "/screening", icon: "◆" },
  { name: "Interviews", href: "/interviews", icon: "◷" },
  { name: "Pipeline", href: "/pipeline", icon: "⇄" },
  { name: "Reports", href: "/reports", icon: "▦" },
  { name: "Users", href: "/users", icon: "◈" },
];

const SCORE_COLOR = (score: number) => {
  if (score >= 80)
    return { bg: "#dcfce7", color: "#16a34a", label: "Excellent" };
  if (score >= 60) return { bg: "#dbeafe", color: "#1d4ed8", label: "Good" };
  if (score >= 40) return { bg: "#fef9c3", color: "#ca8a04", label: "Average" };
  return { bg: "#fee2e2", color: "#dc2626", label: "Poor" };
};

export default function ScreeningPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    axios.get(API + "/jobs").then((r) => setJobs(r.data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedJob) {
      setApplicants([]);
      setResults([]);
      return;
    }
    setLoading(true);
    axios
      .get(API + "/applicants?jobId=" + selectedJob)
      .then((r) => {
        const list = r.data.data || [];
        setApplicants(list);
        // Show already-screened results
        const screened = list.filter((a: any) => a.aiScore);
        setResults(screened.sort((a: any, b: any) => b.aiScore - a.aiScore));
        setSelected([]);
        setDone(false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const unscreened = applicants.filter((a) => !a.aiScore);
  const toggleSelect = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const selectAll = () => setSelected(unscreened.map((a) => a._id));
  const clearAll = () => setSelected([]);

  const runScreening = async () => {
    if (!selectedJob || selected.length === 0) {
      alert("Please select a job and at least one applicant!");
      return;
    }
    setScreening(true);
    setProgress(0);
    setDone(false);
    const newResults: any[] = [...results];

    for (let i = 0; i < selected.length; i++) {
      const applicantId = selected[i];
      try {
        const res = await axios.post(API + "/screening/screen", {
          jobId: selectedJob,
          applicantId,
        });
        const data = res.data.data || res.data;
        const applicant = applicants.find((a) => a._id === applicantId);
        newResults.push({ ...applicant, ...data });
        newResults.sort((a, b) => b.aiScore - a.aiScore);
        setResults([...newResults]);
      } catch (e) {
        console.error("Screening failed for", applicantId);
      }
      setProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    setScreening(false);
    setDone(true);
    setSelected([]);
    // Refresh applicants
    const r = await axios.get(API + "/applicants?jobId=" + selectedJob);
    setApplicants(r.data.data || []);
  };

  const job = jobs.find((j) => j._id === selectedJob);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8faff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          boxShadow: "4px 0 24px rgba(29,78,216,0.15)",
        }}
      >
        <div
          style={{
            padding: "32px 24px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>
                T
              </span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>
                TalentLens
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                HR Intelligence Platform
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "0 12px",
              marginBottom: 8,
            }}
          >
            Navigation
          </div>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: "none",
                background:
                  item.name === "AI Screening"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color:
                  item.name === "AI Screening"
                    ? "white"
                    : "rgba(255,255,255,0.65)",
                fontWeight: item.name === "AI Screening" ? 600 : 400,
                fontSize: 14,
                borderLeft:
                  item.name === "AI Screening"
                    ? "3px solid white"
                    : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              A
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                Admin User
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                HR Manager
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
            }}
          >
            ◆ AI Screening
          </h1>
          <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
            Automatically score and rank candidates using AI
          </p>
        </div>

        {/* Step 1: Select Job */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 28,
            marginBottom: 24,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#1d4ed8",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              1
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Select a Job Position
            </h2>
          </div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 15,
              outline: "none",
              background: "#f8faff",
              color: "#0f172a",
            }}
          >
            <option value="">
              -- Choose a job to screen applicants for --
            </option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.location})
              </option>
            ))}
          </select>

          {job && (
            <div
              style={{
                marginTop: 16,
                background: "#f0f7ff",
                borderRadius: 12,
                padding: "16px 20px",
                border: "1px solid #dbeafe",
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}
              >
                {job.title}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                {job.description}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {job.requiredSkills?.map((s: string) => (
                  <span
                    key={s}
                    style={{
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 12,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
                {job.experienceYears}+ years experience · {job.educationLevel}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Select Applicants */}
        {selectedJob && (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#1d4ed8",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  2
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Select Applicants to Screen
                  {unscreened.length > 0 && (
                    <span
                      style={{
                        marginLeft: 10,
                        background: "#fef9c3",
                        color: "#ca8a04",
                        fontSize: 12,
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      {unscreened.length} unscreened
                    </span>
                  )}
                </h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={selectAll}
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {loading ? (
              <div
                style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}
              >
                Loading applicants...
              </div>
            ) : unscreened.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 32,
                  background: "#f8faff",
                  borderRadius: 12,
                  color: "#64748b",
                }}
              >
                {applicants.length === 0
                  ? "No applicants for this job yet."
                  : "✓ All applicants have been screened!"}
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {unscreened.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => toggleSelect(a._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `2px solid ${selected.includes(a._id) ? "#1d4ed8" : "#f1f5f9"}`,
                      background: selected.includes(a._id)
                        ? "#eff6ff"
                        : "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `2px solid ${selected.includes(a._id) ? "#1d4ed8" : "#cbd5e1"}`,
                        background: selected.includes(a._id)
                          ? "#1d4ed8"
                          : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {selected.includes(a._id) && (
                        <span
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#1d4ed8",
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {a.fullName?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: 14,
                        }}
                      >
                        {a.fullName}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>
                        {a.currentTitle || a.email} · {a.yearsOfExperience} yrs
                        exp
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {a.skills?.slice(0, 3).map((s: string) => (
                        <span
                          key={s}
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 10,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Run */}
        {selectedJob && unscreened.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#1d4ed8",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                3
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Run AI Screening
              </h2>
            </div>

            {screening && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}
                  >
                    Screening candidates with AI...
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}
                  >
                    {progress}%
                  </span>
                </div>
                <div
                  style={{
                    background: "#f1f5f9",
                    borderRadius: 99,
                    height: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: progress + "%",
                      background: "linear-gradient(90deg, #1d4ed8, #7c3aed)",
                      borderRadius: 99,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {done && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "14px 20px",
                  marginBottom: 20,
                  color: "#15803d",
                  fontWeight: 600,
                }}
              >
                ✓ Screening complete! Scroll down to see ranked results.
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 14, color: "#64748b" }}>
                {selected.length > 0 ? (
                  <>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {selected.length}
                    </span>{" "}
                    candidate{selected.length > 1 ? "s" : ""} selected for
                    screening
                  </>
                ) : (
                  "Select candidates above to screen them"
                )}
              </div>
              <button
                onClick={runScreening}
                disabled={screening || selected.length === 0}
                style={{
                  background:
                    screening || selected.length === 0
                      ? "#93c5fd"
                      : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor:
                    screening || selected.length === 0
                      ? "not-allowed"
                      : "pointer",
                  boxShadow: screening
                    ? "none"
                    : "0 4px 16px rgba(29,78,216,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {screening ? (
                  <>
                    <span style={{ fontSize: 18 }}>⏳</span> Screening{" "}
                    {progress}%...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 18 }}>◆</span> Run AI Screening
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                🏆 Ranked Results
                <span
                  style={{
                    marginLeft: 10,
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontSize: 13,
                    padding: "3px 12px",
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  {results.length} screened
                </span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map((r, i) => {
                const sc = SCORE_COLOR(r.aiScore || 0);
                const isExpanded = expandedId === r._id;
                return (
                  <div
                    key={r._id}
                    style={{
                      border: `1px solid ${i === 0 ? "#fbbf24" : "#f1f5f9"}`,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: i === 0 ? "#fffbeb" : "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 22px",
                        cursor: "pointer",
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : r._id)}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background:
                            i === 0
                              ? "#fbbf24"
                              : i === 1
                                ? "#94a3b8"
                                : i === 2
                                  ? "#cd7c3a"
                                  : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          color: i < 3 ? "white" : "#64748b",
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        {i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : `#${i + 1}`}
                      </div>
                      {/* Avatar */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "#1d4ed8",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {r.fullName?.charAt(0)}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: 15,
                          }}
                        >
                          {r.fullName}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>
                          {r.currentTitle || r.email}
                        </div>
                      </div>
                      {/* Score */}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: sc.color,
                          }}
                        >
                          {r.aiScore}%
                        </div>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: 12,
                          }}
                        >
                          {sc.label}
                        </span>
                      </div>
                      {/* Expand */}
                      <div style={{ color: "#94a3b8", fontSize: 18 }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </div>

                    {/* Expanded AI Feedback */}
                    {isExpanded && r.aiFeedback && (
                      <div
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          padding: "20px 22px",
                          background: "#f8faff",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#374151",
                            marginBottom: 12,
                            fontSize: 14,
                          }}
                        >
                          ◆ AI Analysis
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 16,
                          }}
                        >
                          {r.aiFeedback.strengths?.length > 0 && (
                            <div
                              style={{
                                background: "#dcfce7",
                                borderRadius: 12,
                                padding: 16,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#15803d",
                                  marginBottom: 8,
                                  fontSize: 13,
                                }}
                              >
                                ✓ Strengths
                              </div>
                              {r.aiFeedback.strengths.map(
                                (s: string, i: number) => (
                                  <div
                                    key={i}
                                    style={{
                                      fontSize: 13,
                                      color: "#166534",
                                      marginBottom: 4,
                                    }}
                                  >
                                    • {s}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                          {r.aiFeedback.weaknesses?.length > 0 && (
                            <div
                              style={{
                                background: "#fee2e2",
                                borderRadius: 12,
                                padding: 16,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#dc2626",
                                  marginBottom: 8,
                                  fontSize: 13,
                                }}
                              >
                                ✗ Weaknesses
                              </div>
                              {r.aiFeedback.weaknesses.map(
                                (s: string, i: number) => (
                                  <div
                                    key={i}
                                    style={{
                                      fontSize: 13,
                                      color: "#991b1b",
                                      marginBottom: 4,
                                    }}
                                  >
                                    • {s}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                        {r.aiFeedback.recommendation && (
                          <div
                            style={{
                              marginTop: 12,
                              background: "#eff6ff",
                              borderRadius: 10,
                              padding: "12px 16px",
                              fontSize: 13,
                              color: "#1d4ed8",
                              fontWeight: 500,
                            }}
                          >
                            💡 <strong>Recommendation:</strong>{" "}
                            {r.aiFeedback.recommendation}
                          </div>
                        )}
                        <div
                          style={{ marginTop: 12, display: "flex", gap: 10 }}
                        >
                          <button
                            onClick={async () => {
                              await axios.put(API + "/applicants/" + r._id, {
                                status: "shortlisted",
                              });
                              alert(r.fullName + " has been shortlisted!");
                            }}
                            style={{
                              background: "#dcfce7",
                              color: "#16a34a",
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 18px",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            ✓ Shortlist
                          </button>
                          <button
                            onClick={async () => {
                              await axios.put(API + "/applicants/" + r._id, {
                                status: "rejected",
                              });
                              alert(r.fullName + " has been rejected.");
                            }}
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 18px",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

