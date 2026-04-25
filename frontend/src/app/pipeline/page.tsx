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

const STAGES = [
  {
    key: "applied",
    label: "Applied",
    color: "#0ea5e9",
    light: "#e0f2fe",
    border: "#bae6fd",
  },
  {
    key: "screening",
    label: "Screening",
    color: "#8b5cf6",
    light: "#ede9fe",
    border: "#c4b5fd",
  },
  {
    key: "interview",
    label: "Interview",
    color: "#f59e0b",
    light: "#fef3c7",
    border: "#fde68a",
  },
  {
    key: "offer",
    label: "Offer",
    color: "#10b981",
    light: "#d1fae5",
    border: "#6ee7b7",
  },
  {
    key: "hired",
    label: "Hired",
    color: "#0369a1",
    light: "#e0f2fe",
    border: "#7dd3fc",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "#ef4444",
    light: "#fee2e2",
    border: "#fca5a5",
  },
];

export default function PipelinePage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        axios.get(API + "/applicants"),
        axios.get(API + "/jobs"),
      ]);
      setApplicants(appRes.data.data || []);
      setJobs(jobRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = jobFilter
    ? applicants.filter((a) => a.jobId === jobFilter)
    : applicants;

  const getStageApplicants = (stageKey: string) =>
    filtered.filter((a) => (a.status || "applied") === stageKey);

  const getJob = (id: string) => jobs.find((j) => j._id === id)?.title || "";

  const moveApplicant = async (applicantId: string, newStage: string) => {
    setMoving(applicantId);
    try {
      await axios.put(API + "/applicants/" + applicantId, { status: newStage });
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === applicantId ? { ...a, status: newStage } : a,
        ),
      );
    } catch (e) {
      alert("Failed to move applicant");
    } finally {
      setMoving(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    if (dragId) moveApplicant(dragId, stageKey);
    setDragId(null);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return { bg: "#d1fae5", color: "#065f46" };
    if (score >= 60) return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#fee2e2", color: "#991b1b" };
  };

  const totalByStage = (key: string) =>
    applicants.filter((a) => (a.status || "applied") === key).length;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f0f7ff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #075985 0%, #0369a1 50%, #0284c7 100%)",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          boxShadow: "4px 0 30px rgba(3,105,161,0.25)",
        }}
      >
        <div
          style={{
            padding: "30px 22px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}
            >
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>
                T
              </span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 17 }}>
                TalentLens
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
                HR Intelligence Platform
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "18px 10px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              padding: "0 14px",
              marginBottom: 10,
            }}
          >
            Main Menu
          </div>
          {navItems.map((item) => {
            const active = item.name === "Pipeline";
            return (
              <a
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 11,
                  marginBottom: 3,
                  textDecoration: "none",
                  background: active ? "rgba(255,255,255,0.22)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.62)",
                  fontWeight: active ? 700 : 400,
                  fontSize: 14,
                  borderLeft: active
                    ? "3px solid white"
                    : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.name}</span>
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#7dd3fc",
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>
        <div style={{ padding: "0 12px 20px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 13,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              A
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
                Admin User
              </div>
              <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 11 }}>
                HR Manager
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 6px #4ade80",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          marginLeft: 260,
          flex: 1,
          padding: "36px 32px 48px",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                color: "#0369a1",
                fontSize: 13,
                fontWeight: 600,
                margin: "0 0 4px",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Recruitment
            </p>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: "#0c1a2e",
                margin: 0,
              }}
            >
              Pipeline Board
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              Drag and drop candidates across hiring stages
            </p>
          </div>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            style={{
              padding: "11px 18px",
              borderRadius: 10,
              border: "1.5px solid #bae6fd",
              fontSize: 14,
              outline: "none",
              background: "white",
              color: "#0369a1",
              fontWeight: 600,
              minWidth: 220,
              boxShadow: "0 1px 6px rgba(14,165,233,0.08)",
            }}
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Stage Summary Bar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              style={{
                background: "white",
                borderRadius: 10,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1.5px solid ${stage.border}`,
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: stage.color,
                }}
              />
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                {stage.label}
              </span>
              <span
                style={{
                  background: stage.light,
                  color: stage.color,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                {totalByStage(stage.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              color: "#94a3b8",
              fontSize: 15,
            }}
          >
            Loading pipeline...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 14,
              overflowX: "auto",
            }}
          >
            {STAGES.map((stage) => {
              const cards = getStageApplicants(stage.key);
              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  style={{
                    background: stage.light,
                    borderRadius: 16,
                    border: `1.5px solid ${stage.border}`,
                    minHeight: 480,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: "14px 14px 12px",
                      borderBottom: `2px solid ${stage.border}`,
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: stage.color,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#0c1a2e",
                          }}
                        >
                          {stage.label}
                        </span>
                      </div>
                      <span
                        style={{
                          background: stage.light,
                          color: stage.color,
                          fontSize: 12,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 20,
                          border: `1px solid ${stage.border}`,
                        }}
                      >
                        {cards.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div
                    style={{
                      flex: 1,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {cards.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stage.color,
                          opacity: 0.4,
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: "center",
                          padding: 20,
                        }}
                      >
                        Drop candidates here
                      </div>
                    ) : (
                      cards.map((app) => {
                        const sc = app.aiScore ? scoreColor(app.aiScore) : null;
                        const isMoving = moving === app._id;
                        return (
                          <div
                            key={app._id}
                            draggable
                            onDragStart={() => setDragId(app._id)}
                            onDragEnd={() => setDragId(null)}
                            style={{
                              background: "white",
                              borderRadius: 12,
                              padding: "14px",
                              border: `1px solid ${stage.border}`,
                              boxShadow:
                                dragId === app._id
                                  ? "0 8px 24px rgba(0,0,0,0.15)"
                                  : "0 1px 6px rgba(0,0,0,0.05)",
                              cursor: "grab",
                              opacity: isMoving
                                ? 0.5
                                : dragId === app._id
                                  ? 0.7
                                  : 1,
                              transition: "box-shadow 0.2s, opacity 0.2s",
                              transform:
                                dragId === app._id ? "rotate(2deg)" : "none",
                            }}
                          >
                            {/* Avatar + Name */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${stage.light}, ${stage.border})`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: stage.color,
                                  fontWeight: 800,
                                  fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {(app.fullName || "U").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "#0c1a2e",
                                    fontSize: 13,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {app.fullName || "Unknown"}
                                </div>
                                <div
                                  style={{
                                    color: "#94a3b8",
                                    fontSize: 11,
                                    marginTop: 1,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {app.email || ""}
                                </div>
                              </div>
                            </div>

                            {/* Job */}
                            {app.jobId && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#0369a1",
                                  fontWeight: 600,
                                  background: "#e0f2fe",
                                  borderRadius: 6,
                                  padding: "3px 8px",
                                  marginBottom: 8,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {getJob(app.jobId)}
                              </div>
                            )}

                            {/* AI Score */}
                            {app.aiScore != null && sc && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "#64748b",
                                    fontWeight: 600,
                                  }}
                                >
                                  AI Score
                                </span>
                                <span
                                  style={{
                                    background: sc.bg,
                                    color: sc.color,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    padding: "2px 10px",
                                    borderRadius: 20,
                                  }}
                                >
                                  {app.aiScore}/100
                                </span>
                              </div>
                            )}

                            {/* Experience */}
                            {app.experienceYears != null && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#64748b",
                                  marginBottom: 10,
                                }}
                              >
                                {app.experienceYears}y experience
                              </div>
                            )}

                            {/* Move Buttons */}
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                marginTop: 4,
                              }}
                            >
                              {STAGES.filter((s) => s.key !== stage.key)
                                .slice(0, 3)
                                .map((s) => (
                                  <button
                                    key={s.key}
                                    onClick={() =>
                                      moveApplicant(app._id, s.key)
                                    }
                                    disabled={!!moving}
                                    style={{
                                      background: s.light,
                                      color: s.color,
                                      border: `1px solid ${s.border}`,
                                      borderRadius: 6,
                                      padding: "3px 8px",
                                      fontSize: 10,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
