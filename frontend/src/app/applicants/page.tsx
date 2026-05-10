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
  pending:     { bg: "#fef9c3", color: "#ca8a04" },
  screening:   { bg: "#dbeafe", color: "#1d4ed8" },
  shortlisted: { bg: "#dcfce7", color: "#16a34a" },
  interviewed: { bg: "#ede9fe", color: "#7c3aed" },
  hired:       { bg: "#d1fae5", color: "#059669" },
  rejected:    { bg: "#fee2e2", color: "#dc2626" },
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [search, setSearch] = useState("");
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
    const matchScore = scoreFilter
      ? scoreFilter === "high" ? a.aiScore >= 85
      : scoreFilter === "mid" ? a.aiScore >= 50 && a.aiScore < 85
      : scoreFilter === "low" ? a.aiScore > 0 && a.aiScore < 50
      : scoreFilter === "unscreened" ? !a.aiScore
      : true
      : true;
    return matchJob && matchStatus && matchSearch && matchScore;
  });

  const getJobTitle = (jobId: string) => jobs.find((j) => j._id === jobId)?.title || "Unknown Job";

  const exportCSV = () => {
    const headers = ["Name","Email","Job","Experience","Education","Skills","AI Score","Status"];
    const rows = filtered.map((a) => [
      a.fullName || a.name || "",
      a.email || "",
      getJobTitle(a.jobId),
      (a.yearsOfExperience || 0) + " years",
      a.educationLevel || "",
      (a.skills || []).join("; "),
      a.aiScore ? a.aiScore + "%" : "Not screened",
      a.status || "pending",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "applicants.csv";
    el.click();
  };

  const screened = applicants.filter((a) => a.aiScore);
  const avgScore = screened.length > 0 ? Math.round(screened.reduce((s, a) => s + a.aiScore, 0) / screened.length) : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
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
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "Applicants" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Applicants" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Applicants" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Applicants" ? "3px solid white" : "3px solid transparent" }}>
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

      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Applicants</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>{filtered.length} candidates found · Avg AI Score: {avgScore}%</p>
          </div>
          <button onClick={exportCSV} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Export CSV
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {Object.keys(STATUS_COLORS).map((s) => {
            const count = applicants.filter((a) => a.status === s).length;
            const st = STATUS_COLORS[s];
            return (
              <div key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)} style={{ flex: 1, minWidth: 80, background: "white", borderRadius: 12, padding: "14px 16px", textAlign: "center", cursor: "pointer", border: `2px solid ${statusFilter === s ? st.color : "#f1f5f9"}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: st.color }}>{count}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "capitalize", marginTop: 2 }}>{s}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "11px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white" }} />
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white", minWidth: 180 }}>
            <option value="">All Jobs</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white", minWidth: 160 }}>
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white", minWidth: 180 }}>
            <option value="">All AI Scores</option>
            <option value="high">High Score (85+)</option>
            <option value="mid">Mid Score (50-84)</option>
            <option value="low">Low Score (below 50)</option>
            <option value="unscreened">Not Screened Yet</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading applicants...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "white", borderRadius: 16, border: "1px solid #f1f5f9" }}>
            <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>No applicants found</h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>Try changing your filters.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8faff", borderBottom: "1px solid #f1f5f9" }}>
                  {["Candidate","Applied For","Experience","Skills","AI Score","Status","Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                  const name = a.fullName || a.name || "Unknown";
                  const scoreColor = a.aiScore >= 85 ? "#16a34a" : a.aiScore >= 70 ? "#1d4ed8" : a.aiScore >= 50 ? "#ca8a04" : "#dc2626";
                  const scoreBg = a.aiScore >= 85 ? "#dcfce7" : a.aiScore >= 70 ? "#dbeafe" : a.aiScore >= 50 ? "#fef9c3" : "#fee2e2";
                  return (
                    <tr key={a._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f8faff" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 15 }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{name}</div>
                            <div style={{ color: "#94a3b8", fontSize: 12 }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#374151", fontWeight: 500 }}>{getJobTitle(a.jobId)}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 13, color: "#374151" }}>{a.yearsOfExperience || 0} years</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.educationLevel}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 180 }}>
                          {(a.skills || []).slice(0, 3).map((s: string) => (
                            <span key={s} style={{ background: "#eff6ff", color: "#2563eb", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>{s}</span>
                          ))}
                          {(a.skills || []).length > 3 && (
                            <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, padding: "2px 8px", borderRadius: 12 }}>+{a.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {a.aiScore ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ background: scoreBg, color: scoreColor, fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 20 }}>{a.aiScore}%</span>
                            {a.skillMatch !== undefined && (
                              <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Skills: {a.skillMatch}%</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ background: "#f1f5f9", color: "#94a3b8", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>Not screened</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <select value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} style={{ background: sc.bg, color: sc.color, border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                          {Object.keys(STATUS_COLORS).map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <a href={"/screening?jobId=" + a.jobId} style={{ background: "#1d4ed8", color: "white", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Screen</a>
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