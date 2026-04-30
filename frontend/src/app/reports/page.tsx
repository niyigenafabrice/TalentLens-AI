"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://talentlens-ai-production.up.railway.app/api";

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

export default function ReportsPage() {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appRes] = await Promise.all([
          axios.get(API + "/jobs"),
          axios.get(API + "/applicants"),
        ]);
        setJobs(jobsRes.data.data || []);
        setApplicants(appRes.data.data || []);

        const stages = [
          "applied",
          "screening",
          "interview",
          "offer",
          "hired",
          "rejected",
        ];
        const apps = appRes.data.data || [];
        setFunnel(
          stages.map((s) => ({
            stage: s.charAt(0).toUpperCase() + s.slice(1),
            count: apps.filter((a: any) => (a.status || "applied") === s)
              .length,
          })),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApplicants = applicants.length;
  const hired = applicants.filter((a) => a.status === "hired").length;
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const avgScore = applicants.filter((a) => a.aiScore).length
    ? Math.round(
        applicants.filter((a) => a.aiScore).reduce((s, a) => s + a.aiScore, 0) /
          applicants.filter((a) => a.aiScore).length,
      )
    : 0;
  const hireRate = totalApplicants
    ? Math.round((hired / totalApplicants) * 100)
    : 0;

  const summaryCards = [
    { label: "Total Jobs", value: jobs.length, sub: "All postings", icon: "◈" },
    {
      label: "Active Jobs",
      value: activeJobs,
      sub: "Open positions",
      icon: "◉",
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      sub: "All candidates",
      icon: "▦",
    },
    { label: "Hired", value: hired, sub: "Successfully placed", icon: "▲" },
    { label: "Avg AI Score", value: avgScore, sub: "Out of 100", icon: "◆" },
    {
      label: "Hire Rate",
      value: hireRate + "%",
      sub: "Conversion rate",
      icon: "⇄",
    },
  ];

  const statusBreakdown = [
    { label: "Applied", key: "applied", color: "#0ea5e9" },
    { label: "Screening", key: "screening", color: "#0284c7" },
    { label: "Interview", key: "interview", color: "#0369a1" },
    { label: "Offer", key: "offer", color: "#075985" },
    { label: "Hired", key: "hired", color: "#38bdf8" },
    { label: "Rejected", key: "rejected", color: "#7dd3fc" },
  ];

  const topScored = [...applicants]
    .filter((a) => a.aiScore != null)
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 6);

  const getJobTitle = (id: string) =>
    jobs.find((j) => j._id === id)?.title || "N/A";

  const scoreColor = (score: number) => {
    if (score >= 80) return { bg: "#d1fae5", color: "#065f46" };
    if (score >= 60) return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#fee2e2", color: "#991b1b" };
  };

  const funnelMax = Math.max(...funnel.map((f) => f.count), 1);

  const sidebarStyle: React.CSSProperties = {
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
  };

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
      <div style={sidebarStyle}>
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
            const active = item.name === "Reports";
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

      {/* Main Content */}
      <div style={{ marginLeft: 260, flex: 1, padding: "36px 36px 48px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 34,
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
              Analytics
            </p>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: "#0c1a2e",
                margin: 0,
              }}
            >
              Reports
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              Full overview of your recruitment performance
            </p>
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid #bae6fd",
              borderRadius: 10,
              padding: "10px 18px",
              color: "#0369a1",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 1px 6px rgba(14,165,233,0.08)",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              color: "#94a3b8",
              fontSize: 15,
            }}
          >
            Loading reports...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 18,
                marginBottom: 28,
              }}
            >
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    padding: "24px 22px",
                    border: "1px solid #e0f2fe",
                    boxShadow: "0 2px 16px rgba(14,165,233,0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "#0ea5e9",
                      opacity: 0.07,
                    }}
                  />
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      fontSize: 18,
                      color: "#0369a1",
                      fontWeight: 800,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "#0c1a2e",
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      color: "#0369a1",
                      fontSize: 13,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    {card.label}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                    {card.sub}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background:
                        "linear-gradient(90deg, #0ea5e9, transparent)",
                      borderRadius: "0 0 18px 18px",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Middle Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: 22,
                marginBottom: 24,
              }}
            >
              {/* Hiring Funnel */}
              <div
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: "26px 24px",
                  border: "1px solid #e0f2fe",
                  boxShadow: "0 2px 16px rgba(14,165,233,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0c1a2e",
                    }}
                  >
                    Hiring Funnel
                  </h3>
                  <span
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    Live
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {funnel.map((stage, i) => {
                    const pct = Math.max(
                      6,
                      Math.round((stage.count / funnelMax) * 100),
                    );
                    const blues = [
                      "#0369a1",
                      "#0284c7",
                      "#0ea5e9",
                      "#38bdf8",
                      "#7dd3fc",
                      "#bae6fd",
                    ];
                    return (
                      <div key={stage.stage}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          >
                            {stage.stage}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#0369a1",
                            }}
                          >
                            {stage.count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 9,
                            background: "#f0f9ff",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: pct + "%",
                              background: blues[i % blues.length],
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Applicant Breakdown */}
              <div
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: "26px 24px",
                  border: "1px solid #e0f2fe",
                  boxShadow: "0 2px 16px rgba(14,165,233,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0c1a2e",
                    }}
                  >
                    Applicant Breakdown
                  </h3>
                  <span
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {totalApplicants} Total
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 13 }}
                >
                  {statusBreakdown.map((s) => {
                    const count = applicants.filter(
                      (a) => (a.status || "applied") === s.key,
                    ).length;
                    const pct = totalApplicants
                      ? Math.round((count / totalApplicants) * 100)
                      : 0;
                    return (
                      <div key={s.key}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
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
                                background: s.color,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                color: "#475569",
                                fontWeight: 600,
                              }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              {pct}%
                            </span>
                            <span
                              style={{
                                background: "#e0f2fe",
                                color: s.color,
                                fontSize: 12,
                                fontWeight: 800,
                                padding: "2px 10px",
                                borderRadius: 20,
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            height: 7,
                            background: "#f0f9ff",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: pct + "%",
                              background: s.color,
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Scored Candidates */}
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: "26px 24px",
                border: "1px solid #e0f2fe",
                boxShadow: "0 2px 16px rgba(14,165,233,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0c1a2e",
                  }}
                >
                  Top Scored Candidates
                </h3>
                <a
                  href="/applicants"
                  style={{
                    color: "#0369a1",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    padding: "6px 14px",
                    background: "#e0f2fe",
                    borderRadius: 8,
                  }}
                >
                  View All
                </a>
              </div>
              {topScored.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  No AI scores available yet
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                  }}
                >
                  {topScored.map((app, idx) => {
                    const sc = scoreColor(app.aiScore);
                    return (
                      <div
                        key={app._id}
                        style={{
                          background: "#f0f9ff",
                          borderRadius: 14,
                          padding: "16px 18px",
                          border: "1px solid #bae6fd",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #38bdf8, #0369a1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 900,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
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
                              color: "#64748b",
                              fontSize: 11,
                              marginTop: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {getJobTitle(app.jobId)}
                          </div>
                        </div>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            fontSize: 13,
                            fontWeight: 900,
                            padding: "4px 12px",
                            borderRadius: 20,
                            flexShrink: 0,
                          }}
                        >
                          {app.aiScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}




