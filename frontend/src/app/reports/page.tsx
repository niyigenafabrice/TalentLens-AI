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

export default function ReportsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    Promise.all([
      axios.get(API + "/applicants"),
      axios.get(API + "/jobs"),
    ]).then(([appRes, jobRes]) => {
      setApplicants(appRes.data.data || []);
      setJobs(jobRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const screened = applicants.filter((a) => a.aiScore);
  const avgScore = screened.length > 0 ? Math.round(screened.reduce((s, a) => s + a.aiScore, 0) / screened.length) : 0;
  const shortlisted = applicants.filter((a) => a.status === "shortlisted");
  const rejected = applicants.filter((a) => a.status === "rejected");
  const hired = applicants.filter((a) => a.status === "hired");

  const jobQuality = jobs.map((j) => {
    const jobApps = applicants.filter((a) => a.jobId === j._id);
    const qualified = jobApps.filter((a) => a.aiScore >= 70);
    const scoredApps = jobApps.filter((a) => a.aiScore);
    const avgJobScore = scoredApps.length > 0 ? Math.round(scoredApps.reduce((s, a) => s + a.aiScore, 0) / scoredApps.length) : 0;
    return { ...j, total: jobApps.length, qualified: qualified.length, avgScore: avgJobScore };
  }).filter((j) => j.total > 0).sort((a, b) => b.qualified - a.qualified);

  const rejectionReasons: { [key: string]: number } = {};
  rejected.forEach((a) => {
    const gaps = a.aiFeedback?.gaps || a.gaps || [];
    gaps.forEach((g: string) => {
      const key = g.length > 40 ? g.substring(0, 40) + "..." : g;
      rejectionReasons[key] = (rejectionReasons[key] || 0) + 1;
    });
  });
  const topReasons = Object.entries(rejectionReasons).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const scoreBands = [
    { label: "Excellent (85-100)", count: screened.filter((a) => a.aiScore >= 85).length, color: "#16a34a", bg: "#dcfce7" },
    { label: "Good (70-84)", count: screened.filter((a) => a.aiScore >= 70 && a.aiScore < 85).length, color: "#1d4ed8", bg: "#dbeafe" },
    { label: "Average (50-69)", count: screened.filter((a) => a.aiScore >= 50 && a.aiScore < 70).length, color: "#ca8a04", bg: "#fef9c3" },
    { label: "Poor (below 50)", count: screened.filter((a) => a.aiScore < 50).length, color: "#dc2626", bg: "#fee2e2" },
  ];

  const avgTimeToHire = hired.length > 0
    ? Math.round(hired.reduce((s, a) => {
        const created = new Date(a.createdAt || Date.now()).getTime();
        const updated = new Date(a.updatedAt || Date.now()).getTime();
        return s + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0) / hired.length)
    : null;

  const exportReport = () => {
    const lines = [
      "TalentLens AI Screening Report",
      "Generated: " + new Date().toLocaleDateString(),
      "",
      "SUMMARY",
      "Total Applicants," + applicants.length,
      "Total Screened," + screened.length,
      "Average AI Score," + avgScore + "%",
      "Shortlisted," + shortlisted.length,
      "Rejected," + rejected.length,
      "Hired," + hired.length,
      "",
      "JOBS WITH MOST QUALIFIED CANDIDATES",
      "Job Title,Total Applicants,Qualified (70+),Avg Score",
      ...jobQuality.map((j) => '"' + j.title + '",' + j.total + "," + j.qualified + "," + j.avgScore + "%"),
      "",
      "SCORE DISTRIBUTION",
      ...scoreBands.map((b) => '"' + b.label + '",' + b.count),
    ];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "talentlens-report.csv";
    el.click();
  };

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
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "Reports" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Reports" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Reports" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Reports" ? "3px solid white" : "3px solid transparent" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Reports</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>AI screening analytics and hiring insights</p>
          </div>
          <button onClick={exportReport} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Export Report CSV
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading report data...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Screened", value: screened.length, color: "#1d4ed8", bg: "#eff6ff" },
                { label: "Avg AI Score", value: avgScore + "%", color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Shortlisted", value: shortlisted.length, color: "#16a34a", bg: "#dcfce7" },
                { label: avgTimeToHire !== null ? "Avg Days to Hire" : "Hired", value: avgTimeToHire !== null ? avgTimeToHire + " days" : hired.length, color: "#ca8a04", bg: "#fef9c3" },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "22px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 20 }}>AI Score Distribution</div>
                {screened.length === 0 ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No screened candidates yet</div>
                ) : scoreBands.map((b) => {
                  const pct = screened.length > 0 ? Math.round((b.count / screened.length) * 100) : 0;
                  return (
                    <div key={b.label} style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{b.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.count} ({pct}%)</span>
                      </div>
                      <div style={{ background: "#f1f5f9", borderRadius: 99, height: 10 }}>
                        <div style={{ width: pct + "%", height: "100%", background: b.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 20 }}>Top Rejection Reasons</div>
                {topReasons.length === 0 ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No rejection data yet</div>
                ) : topReasons.map(([reason, count], i) => {
                  const maxCount = topReasons[0][1];
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500, flex: 1, paddingRight: 8 }}>{reason}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", flexShrink: 0 }}>{count}x</span>
                      </div>
                      <div style={{ background: "#fee2e2", borderRadius: 99, height: 8 }}>
                        <div style={{ width: pct + "%", height: "100%", background: "#dc2626", borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 20 }}>Jobs — Qualified Candidates (Score 70+)</div>
              {jobQuality.length === 0 ? (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No data yet</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8faff" }}>
                      {["Job Title", "Location", "Total", "Qualified (70+)", "Avg Score", "Quality Rate"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobQuality.map((j, i) => {
                      const qualityRate = j.total > 0 ? Math.round((j.qualified / j.total) * 100) : 0;
                      return (
                        <tr key={j._id} style={{ borderTop: "1px solid #f1f5f9" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{j.title}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{j.educationLevel} · {j.experienceYears}+ yrs</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{j.location}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1d4ed8", fontSize: 15 }}>{j.total}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ background: "#dcfce7", color: "#16a34a", fontWeight: 700, fontSize: 13, padding: "3px 12px", borderRadius: 20 }}>{j.qualified}</span>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: j.avgScore >= 70 ? "#16a34a" : j.avgScore >= 50 ? "#ca8a04" : "#dc2626", fontSize: 15 }}>
                            {j.avgScore > 0 ? j.avgScore + "%" : "-"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 99, height: 8, maxWidth: 80 }}>
                                <div style={{ width: qualityRate + "%", height: "100%", background: qualityRate >= 50 ? "#16a34a" : qualityRate >= 25 ? "#ca8a04" : "#dc2626", borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{qualityRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}