"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + "/api" : "http://localhost:8080/api";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Applicants", href: "/applicants" },
  { name: "AI Screening", href: "/screening" },
  { name: "Interviews", href: "/interviews" },
  { name: "Pipeline", href: "/pipeline" },
  { name: "Reports", href: "/reports" },
  { name: "Users", href: "/users" },
];

const STATUS_COLORS: any = {
  scheduled:  { bg: "#dbeafe", color: "#1d4ed8" },
  completed:  { bg: "#dcfce7", color: "#16a34a" },
  cancelled:  { bg: "#fee2e2", color: "#dc2626" },
  rescheduled:{ bg: "#fef9c3", color: "#ca8a04" },
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editInterview, setEditInterview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [form, setForm] = useState({
    applicantId: "",
    jobId: "",
    date: "",
    time: "",
    type: "video",
    location: "",
    notes: "",
    interviewers: "",
    status: "scheduled",
  });

  const fetchAll = async () => {
    try {
      const [ivRes, appRes, jobRes] = await Promise.all([
        axios.get(API + "/interviews"),
        axios.get(API + "/applicants"),
        axios.get(API + "/jobs"),
      ]);
      setInterviews(ivRes.data.data || []);
      setApplicants(appRes.data.data || []);
      setJobs(jobRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchAll();
  }, []);

  const getApplicant = (iv: any) => {
    // Handle both populated object and string ID
    if (iv?.applicantId?._id) return iv.applicantId;
    return applicants.find((a) => a._id === iv?.applicantId);
  };
  const getJob = (iv: any) => {
    if (iv?.jobId?._id) return iv.jobId;
    return jobs.find((j) => j._id === iv?.jobId);
  };

  const shortlisted = applicants
    .filter((a) => a.aiScore && a.status !== "rejected" && (form.jobId ? a.jobId === form.jobId : true))
    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
    .slice(0, 10);

  const openSchedule = (iv?: any) => {
    if (iv) {
      setEditInterview(iv);
      setForm({
        applicantId: iv.applicantId || "",
        jobId: iv.jobId || "",
        date: iv.date ? iv.date.substring(0, 10) : "",
        time: iv.time || "",
        type: iv.type || "video",
        location: iv.location || "",
        notes: iv.notes || "",
        interviewers: iv.interviewers || "",
        status: iv.status || "scheduled",
      });
    } else {
      setEditInterview(null);
      setForm({ applicantId: "", jobId: "", date: "", time: "", type: "video", location: "", notes: "", interviewers: "", status: "scheduled" });
    }
    setShowModal(true);
  };

  const saveInterview = async () => {
    if (!form.applicantId || !form.jobId || !form.date || !form.time) {
      alert("Please fill in candidate, job, date, and time.");
      return;
    }
    setSaving(true);
    try {
      if (editInterview) {
        await axios.put(API + "/interviews/" + editInterview._id, form);
      } else {
        await axios.post(API + "/interviews", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to save interview");
    } finally {
      setSaving(false);
    }
  };

  const deleteInterview = async (id: string) => {
    if (!confirm("Delete this interview?")) return;
    await axios.delete(API + "/interviews/" + id);
    fetchAll();
  };

  const updateStatus = async (id: string, status: string) => {
    await axios.put(API + "/interviews/" + id, { status });
    fetchAll();
  };

  const filtered = interviews.filter((iv) => filterStatus ? iv.status === filterStatus : true);

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const getInterviewsForDay = (day: number) => {
    const dateStr = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    return interviews.filter((iv) => iv.date && iv.date.substring(0, 10) === dateStr);
  };

  const todayInterviews = interviews.filter((iv) => {
    const today = new Date().toISOString().substring(0, 10);
    return iv.date && iv.date.substring(0, 10) === today;
  });
  const upcomingCount = interviews.filter((iv) => iv.status === "scheduled").length;
  const completedCount = interviews.filter((iv) => iv.status === "completed").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 260, minHeight: "100vh", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "4px 0 24px rgba(29,78,216,0.15)" }}>
        <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>T</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>TalentLens</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>HR Intelligence Platform</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => (
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "Interviews" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Interviews" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Interviews" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Interviews" ? "3px solid white" : "3px solid transparent" }}>
              {item.name}
            </a>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{user?.name || "Admin"}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{user?.role || "HR Manager"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Interviews</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Schedule, track, and manage candidate interviews</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <button onClick={() => setViewMode("list")} style={{ padding: "9px 18px", border: "none", background: viewMode === "list" ? "#1d4ed8" : "transparent", color: viewMode === "list" ? "white" : "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>List</button>
              <button onClick={() => setViewMode("calendar")} style={{ padding: "9px 18px", border: "none", background: viewMode === "calendar" ? "#1d4ed8" : "transparent", color: viewMode === "calendar" ? "white" : "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Calendar</button>
            </div>
            <button onClick={() => openSchedule()} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              + Schedule Interview
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Interviews", value: interviews.length, color: "#1d4ed8", bg: "#eff6ff" },
            { label: "Today", value: todayInterviews.length, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Upcoming", value: upcomingCount, color: "#ca8a04", bg: "#fef9c3" },
            { label: "Completed", value: completedCount, color: "#16a34a", bg: "#dcfce7" },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, color: "#374151" }}>{"<"}</button>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{monthNames[month]} {year}</h2>
              <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, color: "#374151" }}>{">"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "6px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={"empty" + i} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayIvs = getInterviewsForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                return (
                  <div key={day} style={{ minHeight: 80, borderRadius: 10, border: isToday ? "2px solid #1d4ed8" : "1px solid #f1f5f9", padding: 6, background: isToday ? "#eff6ff" : "white" }}>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? "#1d4ed8" : "#374151", marginBottom: 4 }}>{day}</div>
                    {dayIvs.map((iv, idx) => {
                      const sc = STATUS_COLORS[iv.status] || STATUS_COLORS.scheduled;
                      const app = getApplicant(iv.applicantId);
                      return (
                        <div key={idx} onClick={() => openSchedule(iv)} style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 6, marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {iv.time} {app?.fullName || app?.name || "Candidate"}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {["", "scheduled", "completed", "cancelled", "rescheduled"].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", background: filterStatus === s ? "#1d4ed8" : "white", color: filterStatus === s ? "white" : "#64748b", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading interviews...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, background: "white", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>No interviews yet</h3>
                <p style={{ color: "#94a3b8", margin: "0 0 20px" }}>Schedule your first interview using the button above</p>
                <button onClick={() => openSchedule()} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Schedule Interview</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((iv) => {
                  const sc = STATUS_COLORS[iv.status] || STATUS_COLORS.scheduled;
                  const app = getApplicant(iv);
                  const job = getJob(iv);
                  const isPast = new Date(iv.date) < new Date() && iv.status === "scheduled";
                  return (
                    <div key={iv._id} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid " + (isPast ? "#fca5a5" : "#f1f5f9"), boxShadow: "0 1px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 20 }}>
                      {/* Date block */}
                      <div style={{ textAlign: "center", background: "#f8faff", borderRadius: 12, padding: "12px 16px", minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#1d4ed8", lineHeight: 1 }}>
                          {iv.date ? new Date(iv.date).getUTCDate() : "--"}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>
                          {iv.date ? monthNames[new Date(iv.date).getUTCMonth()]?.substring(0, 3).toUpperCase() : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#374151", fontWeight: 700, marginTop: 4 }}>{iv.time || "--:--"}</div>
                      </div>

                      {/* Candidate info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 15 }}>
                            {(app?.fullName || app?.name || "?").charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{app?.fullName || app?.name || "Unknown Candidate"}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{app?.email}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ background: "#f1f5f9", color: "#374151", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                            {job?.title || "Unknown Job"}
                          </span>
                          <span style={{ background: iv.type === "video" ? "#ede9fe" : "#fef9c3", color: iv.type === "video" ? "#7c3aed" : "#92400e", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                            {iv.type === "video" ? "Video Call" : iv.type === "onsite" ? "On-site" : "Phone"}
                          </span>
                          {iv.location && <span style={{ background: "#f0fdf4", color: "#166534", fontSize: 12, padding: "3px 10px", borderRadius: 12 }}>{iv.location}</span>}
                          {iv.interviewers && <span style={{ background: "#f8faff", color: "#64748b", fontSize: 12, padding: "3px 10px", borderRadius: 12 }}>Interviewers: {iv.interviewers}</span>}
                          {isPast && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>Overdue</span>}
                        </div>
                        {iv.notes && <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", background: "#f8faff", padding: "6px 10px", borderRadius: 8 }}>Notes: {iv.notes}</div>}
                      </div>

                      {/* Status + Actions */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                        <select value={iv.status} onChange={(e) => updateStatus(iv._id, e.target.value)}
                          style={{ background: sc.bg, color: sc.color, border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openSchedule(iv)} style={{ background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => deleteInterview(iv._id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
              {editInterview ? "Edit Interview" : "Schedule Interview"}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Candidate *</label>
              <select value={form.applicantId} onChange={(e) => {
                const app = applicants.find((a) => a._id === e.target.value);
                setForm((f) => ({ ...f, applicantId: e.target.value, jobId: app?.jobId || f.jobId }));
              }} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                <option value="">-- Select candidate --</option>
                {shortlisted.length === 0 ? (
                  <option disabled>No shortlisted candidates yet — run AI screening first</option>
                ) : shortlisted.map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName || a.name} ({a.email})</option>
                ))}
              </select>
              {shortlisted.length > 0 && <div style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>Shortlisted candidates shown first</div>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Job Position *</label>
              <select value={form.jobId} onChange={(e) => setForm((f) => ({ ...f, jobId: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                <option value="">-- Select job --</option>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Date *</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Time *</label>
                <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interview Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}>
                  <option value="video">Video Call</option>
                  <option value="onsite">On-site</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Location / Meeting Link</label>
              <input type="text" placeholder="e.g. Google Meet link or Office Room 3" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interviewers</label>
              <input type="text" placeholder="e.g. John Smith, Alice Manager" value={form.interviewers} onChange={(e) => setForm((f) => ({ ...f, interviewers: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notes</label>
              <textarea placeholder="Interview agenda, topics to cover, special instructions..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveInterview} disabled={saving} style={{ flex: 1, padding: 13, borderRadius: 10, border: "none", background: "#1d4ed8", color: "white", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : editInterview ? "Update Interview" : "Schedule Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





