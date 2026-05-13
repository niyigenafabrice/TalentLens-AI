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

const STAGES = [
  { key: "submitted", label: "Applied", color: "#0ea5e9", light: "#e0f2fe", border: "#bae6fd" },
  { key: "screening", label: "Screening", color: "#8b5cf6", light: "#ede9fe", border: "#c4b5fd" },
  { key: "shortlisted", label: "Shortlisted", color: "#10b981", light: "#d1fae5", border: "#6ee7b7" },
  { key: "interviewed", label: "Interviewed", color: "#f59e0b", light: "#fef3c7", border: "#fde68a" },
  { key: "hired", label: "Hired", color: "#0369a1", light: "#e0f2fe", border: "#7dd3fc" },
  { key: "rejected", label: "Rejected", color: "#ef4444", light: "#fee2e2", border: "#fca5a5" },
];

export default function PipelinePage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [autoMoveResults, setAutoMoveResults] = useState<any[]>([]);
  const [autoMoving, setAutoMoving] = useState(false);
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

  const filtered = jobFilter ? applicants.filter((a) => a.jobId === jobFilter) : applicants;

  const getStageApplicants = (stageKey: string) =>
    filtered.filter((a) => (a.status || "submitted") === stageKey);

  const getJob = (id: string) => jobs.find((j) => j._id === id)?.title || "";

  const moveApplicant = async (applicantId: string, newStage: string) => {
    setMoving(applicantId);
    try {
      await axios.put(API + "/applicants/" + applicantId, { status: newStage });
      setApplicants((prev) => prev.map((a) => a._id === applicantId ? { ...a, status: newStage } : a));
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

  const autoMove = async () => {
    setAutoMoving(true);
    setAutoMoveResults([]);
    const results: any[] = [];
    const toProcess = jobFilter ? applicants.filter((a) => a.jobId === jobFilter) : applicants;
    
    for (const app of toProcess) {
      if (!app.aiScore) continue;
      if (app.status === "hired" || app.status === "interviewed") continue;
      
      let newStatus = app.status;
      if (app.aiScore >= 85 && app.status !== "shortlisted") newStatus = "shortlisted";
      else if (app.aiScore < 50 && app.status !== "rejected") newStatus = "rejected";
      
      if (newStatus !== app.status) {
        try {
          await axios.put(API + "/applicants/" + app._id, { status: newStatus });
          setApplicants((prev) => prev.map((a) => a._id === app._id ? { ...a, status: newStatus } : a));
          results.push({ name: app.fullName || app.name, score: app.aiScore, from: app.status, to: newStatus });
        } catch (e) {}
      }
    }
    setAutoMoveResults(results);
    setAutoMoving(false);
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return { bg: "#dcfce7", color: "#16a34a" };
    if (score >= 50) return { bg: "#fef9c3", color: "#ca8a04" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 260, minHeight: "100vh", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
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
        <div style={{ padding: "12px 14px 16px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.15)", marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{user?.name || "Admin"}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{user?.role || "HR Manager"}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.15)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: "32px 28px 48px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0 }}>Pipeline</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Drag candidates between stages or auto-move by AI score</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white", minWidth: 200 }}>
              <option value="">All Jobs</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <button onClick={autoMove} disabled={autoMoving} style={{ background: autoMoving ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: autoMoving ? "not-allowed" : "pointer" }}>
              {autoMoving ? "Moving..." : "Auto-Move by AI Score"}
            </button>
          </div>
        </div>

        {/* Auto Move Results */}
        {autoMoveResults.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Auto-Move Complete</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{autoMoveResults.length} candidates moved</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {autoMoveResults.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: r.to === "shortlisted" ? "#dcfce7" : "#fee2e2", border: `1px solid ${r.to === "shortlisted" ? "#86efac" : "#fca5a5"}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: r.to === "shortlisted" ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {r.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {r.from} → {r.to} (Score: {r.score}%)
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.to === "shortlisted" ? "#16a34a" : "#dc2626" }}>
                    {r.to === "shortlisted" ? "Shortlisted" : "Rejected"}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setAutoMoveResults([])} style={{ marginTop: 12, background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Dismiss</button>
          </div>
        )}

        {/* Stage Summary */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {STAGES.map((stage) => (
            <div key={stage.key} style={{ background: "white", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${stage.border}` }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: stage.color }} />
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{stage.label}</span>
              <span style={{ background: stage.light, color: stage.color, fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>
                {filtered.filter((a) => (a.status || "submitted") === stage.key).length}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading pipeline...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, overflowX: "auto" }}>
            {STAGES.map((stage) => {
              const cards = getStageApplicants(stage.key);
              return (
                <div key={stage.key} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, stage.key)}
                  style={{ background: stage.light, borderRadius: 16, border: `1.5px solid ${stage.border}`, minHeight: 480, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Column Header */}
                  <div style={{ padding: "14px", borderBottom: `2px solid ${stage.border}`, background: "white" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: stage.color }} />
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>{stage.label}</span>
                      </div>
                      <span style={{ background: stage.light, color: stage.color, fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 20, border: `1px solid ${stage.border}` }}>
                        {cards.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {cards.length === 0 ? (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: stage.color, opacity: 0.4, fontSize: 12, fontWeight: 600, textAlign: "center", padding: 20, border: `2px dashed ${stage.border}`, borderRadius: 10, margin: 4 }}>
                        Drop here
                      </div>
                    ) : (
                      cards.map((app) => {
                        const sc = app.aiScore ? scoreColor(app.aiScore) : null;
                        const isMoving = moving === app._id;
                        const nextStages = STAGES.filter((s) => s.key !== stage.key).slice(0, 2);
                        return (
                          <div key={app._id} draggable onDragStart={() => setDragId(app._id)} onDragEnd={() => setDragId(null)}
                            style={{ background: "white", borderRadius: 12, padding: "12px", border: `1px solid ${stage.border}`, boxShadow: dragId === app._id ? "0 8px 24px rgba(0,0,0,0.15)" : "0 1px 6px rgba(0,0,0,0.05)", cursor: "grab", opacity: isMoving ? 0.5 : dragId === app._id ? 0.7 : 1, transition: "all 0.2s" }}>
                            {/* Name */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: stage.light, display: "flex", alignItems: "center", justifyContent: "center", color: stage.color, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                {(app.fullName || app.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {app.fullName || app.name}
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 1 }}>{app.experienceYears || 0}y exp</div>
                              </div>
                            </div>

                            {/* Job */}
                            <div style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 600, background: "#eff6ff", borderRadius: 6, padding: "2px 8px", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {getJob(app.jobId)}
                            </div>

                            {/* AI Score */}
                            {app.aiScore && sc && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>AI Score</span>
                                <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{app.aiScore}%</span>
                              </div>
                            )}

                            {/* Move Buttons */}
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {nextStages.map((s) => (
                                <button key={s.key} onClick={() => moveApplicant(app._id, s.key)} disabled={!!moving}
                                  style={{ background: s.light, color: s.color, border: `1px solid ${s.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", flex: 1 }}>
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
