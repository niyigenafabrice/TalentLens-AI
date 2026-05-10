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

const STAGES = ["pending", "screening", "shortlisted", "interviewed", "hired", "rejected"];

const STAGE_COLORS: any = {
  pending:     { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
  screening:   { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  shortlisted: { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
  interviewed: { bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd" },
  hired:       { bg: "#d1fae5", color: "#059669", border: "#6ee7b7" },
  rejected:    { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
};

export default function PipelinePage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("");
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [autoMoveLog, setAutoMoveLog] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: string, name: string) => {
    try {
      await axios.put(API + "/applicants/" + id, { status });
      setApplicants((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const autoMoveByScore = async () => {
    const screened = filtered.filter((a) => a.aiScore);
    const log: string[] = [];
    for (const a of screened) {
      let newStatus = a.status;
      if (a.aiScore >= 85 && a.status === "pending") newStatus = "shortlisted";
      else if (a.aiScore >= 85 && a.status === "screening") newStatus = "shortlisted";
      else if (a.aiScore < 50 && a.status === "pending") newStatus = "rejected";
      else if (a.aiScore < 50 && a.status === "screening") newStatus = "rejected";
      if (newStatus !== a.status) {
        await updateStatus(a._id, newStatus, a.fullName || a.name);
        log.push(`${a.fullName || a.name} ? ${newStatus} (score: ${a.aiScore}%)`);
      }
    }
    setAutoMoveLog(log);
    if (log.length === 0) alert("No candidates to auto-move. All already in correct stages.");
  };

  const saveNote = async (id: string) => {
    try {
      await axios.put(API + "/applicants/" + id, { notes: noteText });
      setNotes((prev) => ({ ...prev, [id]: noteText }));
      setApplicants((prev) => prev.map((a) => a._id === id ? { ...a, notes: noteText } : a));
      setEditingNote(null);
      setNoteText("");
    } catch (e) {
      alert("Failed to save note");
    }
  };

  const getJobTitle = (jobId: string) => jobs.find((j) => j._id === jobId)?.title || "Unknown";

  const filtered = selectedJob ? applicants.filter((a) => a.jobId === selectedJob) : applicants;

  const onDragStart = (id: string) => setDraggingId(id);
  const onDrop = (stage: string) => {
    if (!draggingId) return;
    const a = applicants.find((x) => x._id === draggingId);
    if (a && a.status !== stage) updateStatus(draggingId, stage, a.fullName || a.name);
    setDraggingId(null);
  };

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
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "Pipeline" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Pipeline" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Pipeline" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Pipeline" ? "3px solid white" : "3px solid transparent" }}>
              {item.name}
            </a>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{user?.name || "Admin User"}</div>
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
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Pipeline</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Drag candidates between stages or auto-move by AI score</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "white" }}>
              <option value="">All Jobs</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <button onClick={autoMoveByScore} style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Auto-Move by AI Score
            </button>
          </div>
        </div>

        {/* Auto Move Log */}
        {autoMoveLog.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", marginBottom: 24, border: "1px solid #86efac", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 10, fontSize: 14 }}>Auto-Move Results:</div>
            {autoMoveLog.map((line, i) => (
              <div key={i} style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}>? {line}</div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading pipeline...</div>
        ) : (
          /* Kanban Board */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, overflowX: "auto", minWidth: 0 }}>
            {STAGES.map((stage) => {
              const sc = STAGE_COLORS[stage];
              const stageApplicants = filtered.filter((a) => (a.status || "pending") === stage);
              return (
                <div key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(stage)}
                  style={{ background: sc.bg, borderRadius: 14, border: `1.5px solid ${sc.border}`, minHeight: 400, display: "flex", flexDirection: "column" }}>
                  {/* Stage Header */}
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${sc.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: sc.color, fontSize: 13, textTransform: "capitalize" }}>{stage}</span>
                      <span style={{ background: "white", color: sc.color, fontWeight: 800, fontSize: 12, padding: "2px 8px", borderRadius: 20, border: `1px solid ${sc.border}` }}>{stageApplicants.length}</span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
                    {stageApplicants.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 8px", color: sc.color, fontSize: 12, opacity: 0.5 }}>Drop here</div>
                    ) : stageApplicants.map((a) => (
                      <div key={a._id}
                        draggable
                        onDragStart={() => onDragStart(a._id)}
                        style={{ background: "white", borderRadius: 10, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", cursor: "grab", border: "1px solid #f1f5f9" }}>
                        {/* Avatar + Name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: sc.color, fontSize: 12, flexShrink: 0 }}>
                            {(a.fullName || a.name)?.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.fullName || a.name}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getJobTitle(a.jobId)}</div>
                          </div>
                        </div>

                        {/* AI Score */}
                        {a.aiScore && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 10, color: "#64748b" }}>AI Score</span>
                            <span style={{ fontWeight: 800, fontSize: 13, color: a.aiScore >= 85 ? "#16a34a" : a.aiScore >= 70 ? "#1d4ed8" : a.aiScore >= 50 ? "#ca8a04" : "#dc2626" }}>{a.aiScore}%</span>
                          </div>
                        )}

                        {/* Note */}
                        {(a.notes || notes[a._id]) && editingNote !== a._id && (
                          <div style={{ background: "#fef9c3", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "#92400e", marginBottom: 8 }}>
                            ?? {a.notes || notes[a._id]}
                          </div>
                        )}

                        {/* Edit Note */}
                        {editingNote === a._id ? (
                          <div style={{ marginBottom: 8 }}>
                            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." rows={2} style={{ width: "100%", fontSize: 11, padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", outline: "none", resize: "none", boxSizing: "border-box" }} />
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                              <button onClick={() => saveNote(a._id)} style={{ flex: 1, background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, padding: "4px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Save</button>
                              <button onClick={() => { setEditingNote(null); setNoteText(""); }} style={{ flex: 1, background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 6, padding: "4px", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingNote(a._id); setNoteText(a.notes || notes[a._id] || ""); }} style={{ width: "100%", background: "#f8faff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px", fontSize: 10, cursor: "pointer", marginBottom: 6 }}>
                            {a.notes || notes[a._id] ? "Edit Note" : "+ Add Note"}
                          </button>
                        )}

                        {/* Move Stage Buttons */}
                        <div style={{ display: "flex", gap: 4 }}>
                          {stage !== "hired" && stage !== "rejected" && (
                            <button onClick={() => {
                              const next = STAGES[STAGES.indexOf(stage) + 1];
                              if (next) updateStatus(a._id, next, a.fullName || a.name);
                            }} style={{ flex: 1, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "4px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                              ? Move Up
                            </button>
                          )}
                          {stage !== "rejected" && (
                            <button onClick={() => updateStatus(a._id, "rejected", a.fullName || a.name)} style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 6px", fontSize: 10, cursor: "pointer" }}>
                              ?
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
