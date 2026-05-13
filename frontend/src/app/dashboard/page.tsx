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

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const fetchData = async () => {
      try {
        const [jobsRes, applicantsRes, interviewsRes, activitiesRes] = await Promise.all([
          axios.get(API + "/jobs"),
          axios.get(API + "/applicants"),
          axios.get(API + "/interviews"),
          axios.get(API + "/activities/recent?limit=10"),
        ]);
        setJobs(jobsRes.data.data || []);
        setApplicants(applicantsRes.data.data || []);
        setInterviews(interviewsRes.data.data || []);
        setActivities(activitiesRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const filteredApplicants = selectedJobId ? applicants.filter((a) => String(a.jobId) === selectedJobId) : applicants;
  const screened = filteredApplicants.filter((a) => a.aiScore);
  const shortlisted = filteredApplicants.filter((a) => a.status === "shortlisted").length;
  const rejected = filteredApplicants.filter((a) => a.status === "rejected").length;
  const hired = filteredApplicants.filter((a) => a.status === "hired" || a.status === "accepted").length;
  const avgScore = screened.length > 0 ? Math.round(screened.reduce((s: number, a: any) => s + a.aiScore, 0) / screened.length) : 0;
  const topCandidates = [...screened].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
  const recentApplicants = [...filteredApplicants].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

  // Applications per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const appsByDay = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
    count: filteredApplicants.filter((a) => (a.createdAt || "").startsWith(day)).length,
  }));
  const maxDayCount = Math.max(...appsByDay.map((d) => d.count), 1);

  // Status donut chart
  const statusData = [
    { label: "Submitted", count: filteredApplicants.filter((a) => a.status === "submitted").length, color: "#1d4ed8" },
    { label: "Screening", count: filteredApplicants.filter((a) => a.status === "screening").length, color: "#0891b2" },
    { label: "Shortlisted", count: shortlisted, color: "#16a34a" },
    { label: "Rejected", count: rejected, color: "#dc2626" },
    { label: "Hired", count: hired, color: "#7c3aed" },
  ].filter((s) => s.count > 0);
  const totalStatus = statusData.reduce((s, d) => s + d.count, 0) || 1;

  // Donut chart segments
  let cumulative = 0;
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;
  const donutSegments = statusData.map((s) => {
    const pct = s.count / totalStatus;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...s, offset, dash };
  });

  // Top skills
  const skillCounts: { [key: string]: number } = {};
  filteredApplicants.forEach((a) => {
    (a.skills || []).forEach((skill: string) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));
  const maxSkillCount = Math.max(...topSkills.map((s) => s.count), 1);

  // Funnel data
  const funnelStages = [
    { label: "Applied", count: filteredApplicants.length, color: "#1d4ed8" },
    { label: "Screened", count: screened.length, color: "#7c3aed" },
    { label: "Shortlisted", count: shortlisted, color: "#0891b2" },
    { label: "Interviewed", count: interviews.length, color: "#ca8a04" },
    { label: "Hired", count: hired, color: "#16a34a" },
  ];
  const maxFunnel = funnelStages[0].count || 1;

  const statCards = [
    { label: "Total Jobs", value: jobs.length, color: "#1d4ed8", bg: "#eff6ff" },
    { label: "Total Applicants", value: filteredApplicants.length, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "AI Screened", value: screened.length, color: "#0891b2", bg: "#ecfeff" },
    { label: "Shortlisted", value: shortlisted, color: "#16a34a", bg: "#dcfce7" },
    { label: "Interviews", value: interviews.length, color: "#ca8a04", bg: "#fef9c3" },
    { label: "Avg AI Score", value: avgScore + "%", color: "#dc2626", bg: "#fee2e2" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 260, minHeight: "100vh", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, color: "white", fontWeight: 900 }}>T</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>TalentLens</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>HR Intelligence Platform</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map((item) => (
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, marginBottom: 2, textDecoration: "none", background: item.name === "Dashboard" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Dashboard" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Dashboard" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Dashboard" ? "3px solid white" : "3px solid transparent" }}>
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
            <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.15)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: 28 }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>Welcome back, {user?.name || "Admin"}!</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "white", borderRadius: 10, padding: "9px 16px", border: "1px solid #e2e8f0", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Job Filter Cards */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedJobId("")}
            style={{ padding: "10px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: selectedJobId === "" ? "#1d4ed8" : "white",
              color: selectedJobId === "" ? "white" : "#64748b",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          >
            All Jobs ({applicants.length})
          </button>
          {jobs.map((j) => {
            const count = applicants.filter((a) => {
              const id = a.jobId?.$oid || a.jobId?._id || String(a.jobId);
              return id === j._id;
            }).length;
            return (
              <button
                key={j._id}
                onClick={() => setSelectedJobId(j._id)}
                style={{ padding: "10px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  background: selectedJobId === j._id ? "#1d4ed8" : "white",
                  color: selectedJobId === j._id ? "white" : "#64748b",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              >
                {j.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "18px 16px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Applications Over Time Bar Chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Applications This Week</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Daily application volume over the last 7 days</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
              {appsByDay.map((d, i) => {
                const barH = maxDayCount > 0 ? Math.max((d.count / maxDayCount) * 120, d.count > 0 ? 8 : 0) : 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>{d.count > 0 ? d.count : ""}</div>
                    <div style={{ width: "100%", height: 120, display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", height: barH, background: "linear-gradient(180deg, #1d4ed8, #7c3aed)", borderRadius: "6px 6px 0 0", transition: "height 0.5s ease", minHeight: d.count > 0 ? 8 : 0 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
            {applicants.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 8 }}>No applications yet — seed data to see charts</div>
            )}
          </div>

          {/* Status Donut Chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Application Status</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Breakdown by current status</div>
            {applicants.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 40 }}>No data yet</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="24" />
                    {donutSegments.map((seg, i) => (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="24"
                        strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                        strokeDashoffset={seg.offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    ))}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="900" fill="#0f172a">{filteredApplicants.length}</text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">Total</text>
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {statusData.map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Hiring Funnel */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Hiring Funnel</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Candidates at each stage</div>
            {funnelStages.map((stage, i) => {
              const pct = Math.round((stage.count / maxFunnel) * 100);
              return (
                <div key={stage.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{stage.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: stage.color }}>{stage.count}</span>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: 99, height: 10, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: stage.color, borderRadius: 99, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Skills */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Top Skills Among Applicants</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Most common skills in the talent pool</div>
            {topSkills.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>No skill data yet</div>
            ) : topSkills.map((s, i) => {
              const colors = ["#1d4ed8", "#7c3aed", "#0891b2", "#16a34a", "#ca8a04", "#dc2626"];
              const pct = Math.round((s.count / maxSkillCount) * 100);
              return (
                <div key={s.skill} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{s.skill}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{s.count} candidate{s.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: colors[i], borderRadius: 99, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Top Candidates */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Top AI Scored Candidates</div>
              <a href="/screening" style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>Screen More</a>
            </div>
            {topCandidates.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 24 }}>No screened candidates yet</div>
            ) : topCandidates.map((a, i) => (
              <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < topCandidates.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i < 3 ? "white" : "#64748b" }}>{i + 1}</div>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 13 }}>{(a.fullName || a.name)?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.fullName || a.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.email}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: a.aiScore >= 85 ? "#16a34a" : "#1d4ed8" }}>{a.aiScore}%</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>AI Score</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Applicants + Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Recent Applicants</div>
                <a href="/applicants" style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>View All</a>
              </div>
              {recentApplicants.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>No applicants yet</div>
              ) : recentApplicants.map((a, i) => (
                <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < recentApplicants.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 12 }}>{(a.fullName || a.name)?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{a.fullName || a.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.email}</div>
                  </div>
                  <span style={{ background: a.status === "shortlisted" ? "#dcfce7" : a.status === "rejected" ? "#fee2e2" : "#f1f5f9", color: a.status === "shortlisted" ? "#16a34a" : a.status === "rejected" ? "#dc2626" : "#64748b", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    {a.status === "shortlisted" ? "Shortlisted" : a.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Post a Job", href: "/jobs", color: "#1d4ed8", bg: "#eff6ff" },
                  { label: "Screen Candidates", href: "/screening", color: "#7c3aed", bg: "#f5f3ff" },
                  { label: "View Pipeline", href: "/pipeline", color: "#0891b2", bg: "#ecfeff" },
                  { label: "Reports", href: "/reports", color: "#16a34a", bg: "#dcfce7" },
                ].map((action) => (
                  <a key={action.label} href={action.href} style={{ display: "block", padding: "12px", borderRadius: 10, textDecoration: "none", background: action.bg, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: action.color }}>{action.label}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











