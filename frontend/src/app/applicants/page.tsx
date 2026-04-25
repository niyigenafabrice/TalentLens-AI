"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "▣" },
  { name: "Jobs", href: "/jobs", icon: "◈" },
  { name: "Applicants", href: "/applicants", icon: "◉" },
  { name: "AI Screening", href: "/screening", icon: "◆" },
  { name: "Interviews", href: "/interviews", icon: "◷" },
  { name: "Pipeline", href: "/pipeline", icon: "⇄" },
  { name: "Reports", href: "/reports", icon: "▦" },
  { name: "Users", href: "/users", icon: "◈" },
  { name: "Apply", href: "/apply", icon: "🌐" },
];

const STATUS_COLORS: any = {
  pending: { bg: "#fef9c3", color: "#ca8a04" },
  screening: { bg: "#dbeafe", color: "#1d4ed8" },
  shortlisted: { bg: "#dcfce7", color: "#16a34a" },
  interviewed: { bg: "#ede9fe", color: "#7c3aed" },
  hired: { bg: "#d1fae5", color: "#059669" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

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

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(API + "/applicants/" + id, { status });
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const filtered = applicants.filter((a) => {
    const matchJob = selectedJob ? a.jobId === selectedJob : true;
    const matchStatus = statusFilter ? a.status === statusFilter : true;
    const matchSearch = search
      ? a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchJob && matchStatus && matchSearch;
  });

  const getJobTitle = (jobId: string) =>
    jobs.find((j) => j._id === jobId)?.title || "Unknown Job";

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
                  item.name === "Applicants"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color:
                  item.name === "Applicants"
                    ? "white"
                    : "rgba(255,255,255,0.65)",
                fontWeight: item.name === "Applicants" ? 600 : 400,
                fontSize: 14,
                borderLeft:
                  item.name === "Applicants"
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
                marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }}></div></div></div>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10 }}>Logout</button></div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Applicants
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder=" Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "11px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              background: "white",
            }}
          />
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{
              padding: "11px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              background: "white",
              minWidth: 180,
            }}
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "11px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              background: "white",
              minWidth: 160,
            }}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[
            "pending",
            "screening",
            "shortlisted",
            "interviewed",
            "hired",
            "rejected",
          ].map((s) => {
            const count = applicants.filter((a) => a.status === s).length;
            const st = STATUS_COLORS[s];
            return (
              <div
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: `2px solid ${statusFilter === s ? st.color : "#f1f5f9"}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: st.color }}>
                  {count}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    marginTop: 2,
                  }}
                >
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            Loading applicants...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              background: "white",
              borderRadius: 16,
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>◉</div>
            <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>
              No applicants yet
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              No applicants have applied yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f1f5f9",
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f8faff",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  {[
                    "Candidate",
                    "Applied For",
                    "Experience",
                    "Skills",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                  const name = a.fullName || a.name || "Unknown";
                  return (
                    <tr
                      key={a._id}
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid #f8faff"
                            : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8faff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
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
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#0f172a",
                                fontSize: 14,
                              }}
                            >
                              {name}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: 12 }}>
                              {a.email}
                            </div>
                            {a.currentTitle && (
                              <div style={{ color: "#64748b", fontSize: 11 }}>
                                {a.currentTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: 13,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {getJobTitle(a.jobId)}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 13, color: "#374151" }}>
                          {a.yearsOfExperience} years
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {a.educationLevel}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            maxWidth: 200,
                          }}
                        >
                          {a.skills?.slice(0, 3).map((s: string) => (
                            <span
                              key={s}
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 12,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                          {a.skills?.length > 3 && (
                            <span
                              style={{
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 12,
                              }}
                            >
                              +{a.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <select
                          value={a.status}
                          onChange={(e) => updateStatus(a._id, e.target.value)}
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            border: "none",
                            borderRadius: 20,
                            padding: "5px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {Object.keys(STATUS_COLORS).map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a
                            href={"/screening?jobId=" + a.jobId}
                            style={{
                              background: "#1d4ed8",
                              color: "white",
                              padding: "6px 14px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Screen
                          </a>
                          {a.aiScore && (
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#16a34a",
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {a.aiScore}%
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



