"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    const u = JSON.parse(stored);
    if (u.role === "applicant") {
      window.location.href = "/my-application";
      return;
    }

    const fetchData = async () => {
      try {
        const [analyticsRes, funnelRes, jobsRes] = await Promise.all([
          axios.get(API + "/analytics/dashboard"),
          axios.get(API + "/job-stats/funnel"),
          axios.get(API + "/jobs"),
        ]);
        setStats(analyticsRes.data.data);
        setFunnel(funnelRes.data.data.funnel);
        setJobs(jobsRes.data.data?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: "?" },
    { name: "Jobs", href: "/jobs", icon: "?" },
    { name: "Applicants", href: "/applicants", icon: "?" },
    { name: "AI Screening", href: "/screening", icon: "?" },
    { name: "Interviews", href: "/interviews", icon: "?" },
    { name: "Pipeline", href: "/pipeline", icon: "?" },
    { name: "Reports", href: "/reports", icon: "?" },
    { name: "Users", href: "/users", icon: "?" },
  ];

  const statCards = [
    {
      label: "Total Jobs",
      value: stats?.overview?.totalJobs || 0,
      sub: "Active positions",
      color: "#2563eb",
    },
    {
      label: "Applicants",
      value: stats?.overview?.totalApplicants || 0,
      sub: "Total candidates",
      color: "#0ea5e9",
    },
    {
      label: "Screenings",
      value: stats?.overview?.totalScreenings || 0,
      sub: "AI processed",
      color: "#6366f1",
    },
    {
      label: "Avg Score",
      value: stats?.overview?.averageScore || 0,
      sub: "Out of 100",
      color: "#0284c7",
    },
  ];

  const funnelColors = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e40af",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: "4px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>
            Loading TalentLens...
          </p>
        </div>
      </div>
    );

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
              <div
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                TalentLens
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
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
                  item.name === "Dashboard"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color:
                  item.name === "Dashboard"
                    ? "white"
                    : "rgba(255,255,255,0.65)",
                fontWeight: item.name === "Dashboard" ? 600 : 400,
                fontSize: 14,
                borderLeft:
                  item.name === "Dashboard"
                    ? "3px solid white"
                    : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.name}</span>
              {item.name === "Dashboard" && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "white",
                  }}
                ></span>
              )}
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
              marginBottom: 10,
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
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              Dashboard Overview
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              Monitor your recruitment pipeline in real time
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 18px",
                color: "#475569",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <a
              href="/jobs"
              style={{
                background: "#1d4ed8",
                color: "white",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
              }}
            >
              + Post Job
            </a>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {statCards.map((card, i) => (
            <div
              key={card.label}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f1f5f9",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: card.color,
                  opacity: 0.08,
                }}
              ></div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: card.color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  fontSize: 18,
                }}
              >
                {["??", "??", "?", "?"][i]}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  color: "#475569",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {card.label}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
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
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Hiring Funnel
              </h3>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                }}
              >
                Live
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {funnel.map((stage, i) => {
                const max = funnel[0]?.count || 1;
                const pct = Math.max(6, Math.round((stage.count / max) * 100));
                return (
                  <div key={stage.stage}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          fontWeight: 500,
                        }}
                      >
                        {stage.stage}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {stage.count}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#f1f5f9",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: pct + "%",
                          background: funnelColors[i],
                          borderRadius: 99,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
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
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Recent Job Postings
              </h3>
              <a
                href="/jobs"
                style={{
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View All ?
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.map((job) => (
                <div
                  key={job._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "#f8faff",
                    border: "1px solid #e8f0fe",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      ?
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: 14,
                        }}
                      >
                        {job.title}
                      </div>
                      <div
                        style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}
                      >
                        {job.location} � {job.experienceYears}y exp
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          job.status === "active" ? "#dcfce7" : "#f1f5f9",
                        color: job.status === "active" ? "#16a34a" : "#64748b",
                      }}
                    >
                      {job.status || "active"}
                    </span>
                    <a
                      href={"/applicants?jobId=" + job._id}
                      style={{
                        color: "#2563eb",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        padding: "6px 14px",
                        background: "#eff6ff",
                        borderRadius: 8,
                      }}
                    >
                      View ?
                    </a>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 8 }}>?</div>
                  <p style={{ fontWeight: 600 }}>No jobs posted yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
