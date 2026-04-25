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

const STATUS_COLORS: any = {
  scheduled: { bg: "#dbeafe", color: "#1d4ed8" },
  completed: { bg: "#dcfce7", color: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
  pending: { bg: "#fef9c3", color: "#ca8a04" },
};

const TYPE_ICONS: any = {
  technical: "💻",
  hr: "🤝",
  behavioral: "🧠",
  final: "🏁",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [form, setForm] = useState({
    applicantId: "",
    jobId: "",
    interviewType: "technical",
    scheduledAt: "",
    duration: "60",
    interviewerName: "",
    meetingLink: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [intRes, appRes, jobRes] = await Promise.all([
        axios.get(API + "/interviews"),
        axios.get(API + "/applicants"),
        axios.get(API + "/jobs"),
      ]);
      setInterviews(intRes.data.data || []);
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

  const handleSubmit = async () => {
    if (
      !form.applicantId ||
      !form.jobId ||
      !form.scheduledAt ||
      !form.interviewerName
    ) {
      alert("Please fill all required fields!");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(API + "/interviews", {
        ...form,
        duration: parseInt(form.duration),
      });
      setSuccess("Interview scheduled successfully!");
      setShowForm(false);
      setForm({
        applicantId: "",
        jobId: "",
        interviewType: "technical",
        scheduledAt: "",
        duration: "60",
        interviewerName: "",
        meetingLink: "",
        notes: "",
      });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(API + "/interviews/" + id, { status });
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const getName = (id: string) =>
    applicants.find((a) => a._id === id)?.fullName || "Unknown";
  const getJob = (id: string) =>
    jobs.find((j) => j._id === id)?.title || "Unknown";

  const filtered = interviews.filter((i) => {
    const matchStatus = statusFilter ? i.status === statusFilter : true;
    const matchType = typeFilter ? i.interviewType === typeFilter : true;
    return matchStatus && matchType;
  });

  const counts = {
    scheduled: interviews.filter((i) => i.status === "scheduled").length,
    completed: interviews.filter((i) => i.status === "completed").length,
    cancelled: interviews.filter((i) => i.status === "cancelled").length,
    pending: interviews.filter((i) => i.status === "pending").length,
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    return (
      dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " · " +
      dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

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
                  item.name === "Interviews"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color:
                  item.name === "Interviews"
                    ? "white"
                    : "rgba(255,255,255,0.65)",
                fontWeight: item.name === "Interviews" ? 600 : 400,
                fontSize: 14,
                borderLeft:
                  item.name === "Interviews"
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

      {/* Main Content */}
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
              ◷ Interviews
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              {filtered.length} interview{filtered.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
            }}
          >
            + Schedule Interview
          </button>
        </div>

        {/* Success */}
        {success && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 24,
              color: "#15803d",
              fontWeight: 600,
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {Object.entries(counts).map(([status, count]) => {
            const sc = STATUS_COLORS[status];
            return (
              <div
                key={status}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? "" : status)
                }
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 12,
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: `2px solid ${statusFilter === status ? sc.color : "#f1f5f9"}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: sc.color }}>
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
                  {status}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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
            <option value="">All Types</option>
            {Object.keys(TYPE_ICONS).map((t) => (
              <option key={t} value={t}>
                {TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Interviews List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            Loading interviews...
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>◷</div>
            <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>
              No interviews found
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Schedule your first interview to get started
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((interview) => {
              const sc =
                STATUS_COLORS[interview.status] || STATUS_COLORS.pending;
              return (
                <div
                  key={interview._id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "22px 26px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  {/* Type Icon */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "#f0f7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_ICONS[interview.interviewType] || "📋"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: 15,
                        }}
                      >
                        {getName(interview.applicantId)}
                      </span>
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#64748b",
                          fontSize: 11,
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {interview.interviewType}
                      </span>
                    </div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      📋 {getJob(interview.jobId)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        fontSize: 12,
                        color: "#94a3b8",
                      }}
                    >
                      <span>📅 {formatDate(interview.scheduledAt)}</span>
                      <span>⏱ {interview.duration} min</span>
                      <span>👤 {interview.interviewerName}</span>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          🔗 Join Meeting
                        </a>
                      )}
                    </div>
                    {interview.notes && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: "#64748b",
                          background: "#f8faff",
                          borderRadius: 8,
                          padding: "6px 12px",
                        }}
                      >
                        📝 {interview.notes}
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 10,
                    }}
                  >
                    <select
                      value={interview.status}
                      onChange={(e) =>
                        updateStatus(interview._id, e.target.value)
                      }
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        border: "none",
                        borderRadius: 20,
                        padding: "6px 14px",
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 36,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Schedule Interview
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Applicant *
                </label>
                <select
                  value={form.applicantId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, applicantId: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                  }}
                >
                  <option value="">Select applicant</option>
                  {applicants.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.fullName} — {a.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Job Position *
                </label>
                <select
                  value={form.jobId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jobId: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                  }}
                >
                  <option value="">Select job</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Interview Type
                  </label>
                  <select
                    value={form.interviewType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, interviewType: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                      outline: "none",
                      background: "#f8faff",
                    }}
                  >
                    <option value="technical">💻 Technical</option>
                    <option value="hr">🤝 HR</option>
                    <option value="behavioral">🧠 Behavioral</option>
                    <option value="final">🏁 Final</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Duration (minutes)
                  </label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duration: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                      outline: "none",
                      background: "#f8faff",
                    }}
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Interviewer Name *
                </label>
                <input
                  placeholder="e.g. John Mugisha"
                  value={form.interviewerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, interviewerName: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Meeting Link (optional)
                </label>
                <input
                  placeholder="https://meet.google.com/..."
                  value={form.meetingLink}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, meetingLink: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Any special instructions or notes..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    background: "#f8faff",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: submitting ? "#93c5fd" : "#1d4ed8",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
                  }}
                >
                  {submitting ? "Scheduling..." : "Schedule Interview"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
