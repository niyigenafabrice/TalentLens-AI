"use client";
// @ts-ignore
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
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

const SCORE_COLOR = (score: number) => {
  if (score >= 85) return { bg: "#dcfce7", color: "#16a34a", label: "Excellent" };
  if (score >= 70) return { bg: "#dbeafe", color: "#1d4ed8", label: "Good" };
  if (score >= 50) return { bg: "#fef9c3", color: "#ca8a04", label: "Average" };
  return { bg: "#fee2e2", color: "#dc2626", label: "Poor" };
};

export default function ScreeningPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [biasWarning, setBiasWarning] = useState<string | null>(null);
  const [autoActions, setAutoActions] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [interviewDates, setInterviewDates] = useState<{ [key: string]: string }>({});
  const [interviewTimes, setInterviewTimes] = useState<{ [key: string]: string }>({});
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [interviewTypes, setInterviewTypes] = useState<{ [key: string]: string }>({});
  const [meetingLinks, setMeetingLinks] = useState<{ [key: string]: string }>({});
  const [interviewerNames, setInterviewerNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    axios.get(API + "/jobs").then((r) => setJobs(r.data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedJob) { setApplicants([]); setResults([]); return; }
    setLoading(true);
    axios.get(API + "/applicants?jobId=" + selectedJob)
      .then((r) => {
        const list = r.data.data || [];
        setApplicants(list);
        const screened = list.filter((a: any) => a.aiScore);
        setResults(screened.sort((a: any, b: any) => b.aiScore - a.aiScore).slice(0, 10));
        setSelected([]);
        setDone(false);
        setBiasWarning(null);
        setAutoActions([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const unscreened = applicants.filter((a) => !a.aiScore);
  const toggleSelect = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const selectAll = () => setSelected(unscreened.map((a) => a._id));
  const clearAll = () => setSelected([]);

  const scheduleInterview = async (candidate: any) => {
    const date = interviewDates[candidate._id];
    const time = interviewTimes[candidate._id] || "09:00";
    if (!date) { alert("Please pick an interview date for " + (candidate.fullName || candidate.name)); return; }
    setSchedulingId(candidate._id);
    try {
      await axios.post(API + "/interviews", {
        applicantId: candidate._id,
        jobId: selectedJob,
        scheduledDate: date,
        scheduledTime: time,
        interviewType: "online",
        status: "scheduled",
        notes: "Auto-scheduled after AI screening. Score: " + candidate.aiScore + "%",
      });
      await axios.put(API + "/applicants/" + candidate._id, { status: "shortlisted" });
      setScheduledIds((prev) => [...prev, candidate._id]);
      alert("Interview scheduled for " + (candidate.fullName || candidate.name) + " on " + date + " at " + time);
    } catch (e) {
      alert("Failed to schedule interview. Please try again.");
    } finally {
      setSchedulingId(null);
    }
  };

  const runScreening = async () => {
    if (!selectedJob || selected.length === 0) { alert("Please select a job and at least one applicant!"); return; }
    setScreening(true);
    setProgress(0);
    setDone(false);
    setBiasWarning(null);
    setAutoActions([]);
    const newResults: any[] = [...results];
    const actions: string[] = [];

    for (let i = 0; i < selected.length; i++) {
      const applicantId = selected[i];
      try {
        const res = await axios.post(API + "/screening/screen", { jobId: selectedJob, applicantId });
        const data = res.data.data || res.data;
        const applicant = applicants.find((a) => a._id === applicantId);
        const merged = { ...applicant, ...data };
        newResults.push(merged);
        newResults.sort((a, b) => b.aiScore - a.aiScore);
        setResults([...newResults].slice(0, 10));

        if (data.aiScore < 50) {
          await axios.put(API + "/applicants/" + applicantId, { status: "rejected" });
          actions.push("Auto rejected: " + (data.name || applicant?.fullName) + " (" + data.aiScore + "%)");
        }
        setAutoActions([...actions]);
      } catch (e) {
        console.error("Screening failed for", applicantId);
      }
      setProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    try {
      const r = await axios.get(API + "/applicants?jobId=" + selectedJob);
      const allApplicants = r.data.data || [];
      setApplicants(allApplicants);
      const locations = newResults.map((c: any) => c.location).filter(Boolean);
      if (locations.length > 0) {
        const locationCounts: { [key: string]: number } = {};
        locations.forEach((loc: string) => { locationCounts[loc] = (locationCounts[loc] || 0) + 1; });
        for (const loc in locationCounts) {
          const pct = (locationCounts[loc] / newResults.length) * 100;
          if (pct >= 80) setBiasWarning("Location Bias Warning: " + pct.toFixed(0) + "% of candidates are from " + loc);
        }
      }
    } catch (e) {}

    setScreening(false);
    setDone(true);
    setSelected([]);
  };

  const job = jobs.find((j) => j._id === selectedJob);
  const highScorers = results.filter((r) => r.aiScore >= 85).length;
  const midScorers = results.filter((r) => r.aiScore >= 50 && r.aiScore < 85).length;
  const lowScorers = results.filter((r) => r.aiScore < 50).length;
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.aiScore, 0) / results.length) : 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    const jobTitle = job?.title || "All Positions";

    // Header
    doc.setFillColor(29, 78, 216);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TalentLens AI - Top Candidates Report", 14, 12);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Position: " + jobTitle + "   |   Generated: " + new Date().toLocaleDateString(), 14, 22);

    // Summary stats
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Total Ranked: " + results.length + "   |   Excellent (85+): " + highScorers + "   |   Average Score: " + avgScore + "%", 14, 46);

    // Table
    autoTable(doc, {
      startY: 54,
      head: [["#", "Name", "Email", "Score", "Rating", "Status"]],
      body: results.map((r, i) => [
        i + 1,
        r.fullName || r.name || "-",
        r.email || "-",
        (r.aiScore || 0) + "%",
        r.aiScore >= 85 ? "Excellent" : r.aiScore >= 70 ? "Good" : r.aiScore >= 50 ? "Average" : "Poor",
        scheduledIds.includes(r._id) ? "Interview Scheduled" : r.aiScore >= 85 ? "Auto Shortlisted" : r.status === "rejected" ? "Rejected" : "Pending"
      ]),
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 247, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    doc.save("TalentLens-Top10-" + jobTitle.replace(/\s+/g, "-") + ".pdf");
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/"; };

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
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "AI Screening" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "AI Screening" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "AI Screening" ? 600 : 400, fontSize: 14, borderLeft: item.name === "AI Screening" ? "3px solid white" : "3px solid transparent" }}>
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

      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>AI Screening</h1>
          <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Screen candidates and schedule interviews for the top 10</p>
        </div>

        {biasWarning && (
          <div style={{ background: "#fef9c3", border: "1px solid #fbbf24", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "#92400e", fontWeight: 600, fontSize: 14 }}>
            {biasWarning}
          </div>
        )}

        {autoActions.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", marginBottom: 24, border: "1px solid #f1f5f9" }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 10, fontSize: 14 }}>Automatic Actions Taken:</div>
            {autoActions.map((a, i) => (
              <div key={i} style={{ fontSize: 13, color: a.includes("shortlisted") ? "#16a34a" : "#dc2626", marginBottom: 4, fontWeight: 500 }}>{a}</div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Top 10 Ranked", value: results.length, color: "#1d4ed8", bg: "#eff6ff" },
              { label: "Excellent (85+)", value: highScorers, color: "#16a34a", bg: "#dcfce7" },
              { label: "Good (50-84)", value: midScorers, color: "#ca8a04", bg: "#fef9c3" },
              { label: "Poor (below 50)", value: lowScorers, color: "#dc2626", bg: "#fee2e2" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "white", borderRadius: 16, padding: 28, marginBottom: 24, border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1d4ed8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>1</div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Select a Job Position</h2>
          </div>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, outline: "none", background: "#f8faff", color: "#0f172a" }}>
            <option value="">-- Choose a job to screen applicants for --</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title} ({j.location})</option>)}
          </select>
          {job && (
            <div style={{ marginTop: 16, background: "#f0f7ff", borderRadius: 12, padding: "16px 20px", border: "1px solid #dbeafe" }}>
              <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>{job.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>{job.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {job.requiredSkills?.map((s: string) => (
                  <span key={s} style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{s}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{job.experienceYears}+ years experience - {job.educationLevel}</div>
            </div>
          )}
        </div>

        {selectedJob && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, marginBottom: 24, border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1d4ed8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>2</div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Select Applicants to Screen</h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={selectAll} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Select All</button>
                <button onClick={clearAll} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Clear</button>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading applicants...</div>
            ) : unscreened.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, background: "#f8faff", borderRadius: 12, color: "#64748b" }}>
                {applicants.length === 0 ? "No applicants for this job yet." : "All applicants have been screened!"}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unscreened.map((a) => (
                  <div key={a._id} onClick={() => toggleSelect(a._id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 12, border: "2px solid " + (selected.includes(a._id) ? "#1d4ed8" : "#f1f5f9"), background: selected.includes(a._id) ? "#eff6ff" : "#fafafa", cursor: "pointer" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (selected.includes(a._id) ? "#1d4ed8" : "#cbd5e1"), background: selected.includes(a._id) ? "#1d4ed8" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected.includes(a._id) && <span style={{ color: "white", fontSize: 13, fontWeight: 900 }}>ok</span>}
                    </div>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 15, flexShrink: 0 }}>
                      {(a.fullName || a.name)?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{a.fullName || a.name}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>{a.email} - {a.yearsOfExperience || 0} yrs exp</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(a.skills || []).slice(0, 3).map((s: string) => (
                        <span key={s} style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, padding: "2px 8px", borderRadius: 10 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedJob && unscreened.length > 0 && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, marginBottom: 24, border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1d4ed8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>3</div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Run AI Screening</h2>
            </div>
            {screening && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Screening candidates with AI...</span>
                  <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 99, height: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(90deg, #1d4ed8, #7c3aed)", borderRadius: 99, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}
            {done && (
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10, padding: "14px 20px", marginBottom: 20, color: "#15803d", fontWeight: 600 }}>
                Screening complete! Top 10 candidates are ranked below. Pick interview dates for each one.
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                {selected.length > 0 ? <span><span style={{ fontWeight: 700, color: "#0f172a" }}>{selected.length}</span> candidate{selected.length > 1 ? "s" : ""} selected</span> : "Select candidates above to screen them"}
              </div>
              <button onClick={runScreening} disabled={screening || selected.length === 0} style={{ background: screening || selected.length === 0 ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: screening || selected.length === 0 ? "not-allowed" : "pointer" }}>
                {screening ? "Screening " + progress + "%..." : "Run AI Screening"}
              </button>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                Top {results.length} Ranked Candidates
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {avgScore > 0 && <div style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: 14, padding: "8px 16px", borderRadius: 10 }}>Avg Score: {avgScore}%</div>}
                <button onClick={exportPDF} style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Export Top 10 PDF
                </button>
                {compareIds.length === 2 && (
                  <button onClick={() => setShowCompare(true)} style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Compare Selected (2)
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>Pick an interview date and time for each candidate then click Schedule Interview. <strong>Tip:</strong> Select 2 candidates to compare them side by side.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {results.map((r, i) => {
                const sc = SCORE_COLOR(r.aiScore || 0);
                const isExpanded = expandedId === r._id;
                const isScheduled = scheduledIds.includes(r._id);
                const isScheduling = schedulingId === r._id;
                return (
                  <div key={r._id} style={{ border: "2px solid " + (isScheduled ? "#86efac" : i === 0 ? "#fbbf24" : "#f1f5f9"), borderRadius: 14, overflow: "hidden", background: isScheduled ? "#f0fdf4" : i === 0 ? "#fffbeb" : "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : r._id)}>
                      <input type="checkbox" checked={compareIds.includes(r._id)} onChange={(e) => { if (e.target.checked) { if (compareIds.length < 2) setCompareIds(prev => [...prev, r._id]); } else { setCompareIds(prev => prev.filter(x => x !== r._id)); } }} onClick={ev => ev.stopPropagation()} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1d4ed8" }} />
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: i < 3 ? "white" : "#64748b", fontSize: 15, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1d4ed8", fontSize: 16, flexShrink: 0 }}>
                        {(r.fullName || r.name)?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{r.fullName || r.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>{r.email}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: sc.color }}>{r.aiScore}%</div>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 12 }}>{sc.label}</span>
                      </div>
                      {isScheduled ? (
                        <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Interview Scheduled</span>
                      ) : (
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                          {r.aiScore >= 85 ? "Auto Shortlisted" : r.status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      )}
                      <div style={{ color: "#94a3b8", fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px 22px", background: "#f8faff" }}>

                        {r.aiFeedback && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                            {r.aiFeedback.strengths?.length > 0 && (
                              <div style={{ background: "#dcfce7", borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 8, fontSize: 13 }}>Strengths</div>
                                {r.aiFeedback.strengths.map((s: string, idx: number) => (
                                  <div key={idx} style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}>- {s}</div>
                                ))}
                              </div>
                            )}
                            {r.aiFeedback.weaknesses?.length > 0 && (
                              <div style={{ background: "#fee2e2", borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: 8, fontSize: 13 }}>Weaknesses</div>
                                {r.aiFeedback.weaknesses.map((s: string, idx: number) => (
                                  <div key={idx} style={{ fontSize: 13, color: "#991b1b", marginBottom: 4 }}>- {s}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {!isScheduled ? (
                          <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 16 }}>Schedule Interview for {r.fullName || r.name}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interview Date *</label>
                                <input
                                  type="date"
                                  min={new Date().toISOString().split("T")[0]}
                                  value={interviewDates[r._id] || ""}
                                  onChange={(e) => setInterviewDates((prev) => ({ ...prev, [r._id]: e.target.value }))}
                                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interview Time *</label>
                                <input
                                  type="time"
                                  value={interviewTimes[r._id] || "09:00"}
                                  onChange={(e) => setInterviewTimes((prev) => ({ ...prev, [r._id]: e.target.value }))}
                                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }}
                                />
                              </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interview Type</label>
                                <select
                                  value={interviewTypes[r._id] || "online"}
                                  onChange={(e) => setInterviewTypes((prev) => ({ ...prev, [r._id]: e.target.value }))}
                                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff" }}
                                >
                                  <option value="online">Video Call (Online)</option>
                                  <option value="onsite">On-site</option>
                                  <option value="phone">Phone Call</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Interviewers</label>
                                <input
                                  type="text"
                                  placeholder="e.g. John Smith, Alice Manager"
                                  value={interviewerNames[r._id] || ""}
                                  onChange={(e) => setInterviewerNames((prev) => ({ ...prev, [r._id]: e.target.value }))}
                                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Meeting Link / Location</label>
                              <input
                                type="text"
                                placeholder="e.g. https://meet.google.com/xxx or Office Room 3"
                                value={meetingLinks[r._id] || ""}
                                onChange={(e) => setMeetingLinks((prev) => ({ ...prev, [r._id]: e.target.value }))}
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                onClick={() => scheduleInterview(r)}
                                disabled={isScheduling || !interviewDates[r._id]}
                                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: isScheduling || !interviewDates[r._id] ? "#93c5fd" : "#1d4ed8", color: "white", fontSize: 14, fontWeight: 700, cursor: isScheduling || !interviewDates[r._id] ? "not-allowed" : "pointer" }}
                              >
                                {isScheduling ? "Scheduling..." : "Schedule Interview + Send Email"}
                              </button>
                              <button
                                onClick={async () => { await axios.post(API + "/interviews/reject", { applicantId: r._id, jobId: selectedJob }); alert((r.fullName || r.name) + " has been rejected and notified by email."); }}
                                style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ background: "#dcfce7", borderRadius: 12, padding: 16, border: "1px solid #86efac", textAlign: "center" }}>
                            <div style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>Interview scheduled on {interviewDates[r._id]} at {interviewTimes[r._id] || "09:00"}</div>
                            <div style={{ color: "#16a34a", fontSize: 13, marginTop: 4 }}>Candidate has been shortlisted and email notification sent</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      {showCompare && compareIds.length === 2 && (() => {
        const c1 = results.find(r => r._id === compareIds[0]);
        const c2 = results.find(r => r._id === compareIds[1]);
        if (!c1 || !c2) return null;
        const sc1 = SCORE_COLOR(c1.aiScore || 0);
        const sc2 = SCORE_COLOR(c2.aiScore || 0);
        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "white", borderRadius: 20, padding: 32, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Candidate Comparison</h2>
                <button onClick={() => setShowCompare(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Close</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[{ c: c1, sc: sc1 }, { c: c2, sc: sc2 }].map(({ c, sc }) => (
                  <div key={c._id} style={{ border: "2px solid " + sc.color, borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ background: sc.color, padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: 20, margin: "0 auto 8px" }}>{(c.fullName || c.name)?.charAt(0)}</div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{c.fullName || c.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{c.email}</div>
                      <div style={{ color: "white", fontSize: 32, fontWeight: 900, marginTop: 8 }}>{c.aiScore}%</div>
                      <div style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 12, display: "inline-block" }}>{sc.label}</div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Experience</div>
                        <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{c.yearsOfExperience || 0} years</div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Skills</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {(c.skills || []).map((s: string) => (
                            <span key={s} style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 10 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      {c.aiFeedback?.strengths?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#16a34a", marginBottom: 6, textTransform: "uppercase" }}>Strengths</div>
                          {c.aiFeedback.strengths.map((s: string, i: number) => (
                            <div key={i} style={{ fontSize: 13, color: "#166534", marginBottom: 3 }}>✓ {s}</div>
                          ))}
                        </div>
                      )}
                      {c.aiFeedback?.weaknesses?.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#dc2626", marginBottom: 6, textTransform: "uppercase" }}>Weaknesses</div>
                          {c.aiFeedback.weaknesses.map((s: string, i: number) => (
                            <div key={i} style={{ fontSize: 13, color: "#991b1b", marginBottom: 3 }}>✗ {s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}











