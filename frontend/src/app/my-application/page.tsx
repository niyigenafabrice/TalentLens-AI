"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + "/api" : "http://localhost:8080/api";

const STEPS = [
  { key: "submitted", label: "Applied", desc: "Your application was received" },
  { key: "under_review", label: "Under Review", desc: "HR is reviewing your application" },
  { key: "shortlisted", label: "Shortlisted", desc: "You have been shortlisted for an interview" },
  { key: "accepted", label: "Hired", desc: "Congratulations! You got the job" },
];

const statusColors: any = {
  draft: { bg: "#f1f5f9", color: "#64748b" },
  submitted: { bg: "#dbeafe", color: "#1d4ed8" },
  under_review: { bg: "#fef9c3", color: "#b45309" },
  shortlisted: { bg: "#dcfce7", color: "#16a34a" },
  accepted: { bg: "#bbf7d0", color: "#15803d" },
  hired: { bg: "#bbf7d0", color: "#15803d" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

const statusLabels: any = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  accepted: "Hired",
  hired: "Hired",
  rejected: "Not Selected",
};

export default function MyApplicationPage() {
  const [application, setApplication] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { window.location.href = "/"; return; }
    const u = JSON.parse(stored);
    if (u.role !== "applicant") { window.location.href = "/dashboard"; return; }
    setUser(u);
    fetchApplication(token);
  }, []);

  const fetchApplication = async (token: string) => {
    try {
      const res = await axios.get(API + "/applicants/my-application", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const app = res.data.data;
      setApplication(app);
      if (app?._id) {
        try {
          const intRes = await axios.get(API + "/interviews?applicantId=" + app._id);
          const interviews = intRes.data.data || [];
          if (interviews.length > 0) setInterview(interviews[0]);
        } catch (e) {}
      }
    } catch (e) {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const status = application?.status || "";
  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const isRejected = status === "rejected";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading your application...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>T</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>TalentLens</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>Applicant Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>Hi, {user?.name}</span>
          <button onClick={handleLogout} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>My Application</h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px" }}>Track the status of your job application below.</p>

        {/* No application */}
        {!application && (
          <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>No Application Found</h2>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>You have not applied for any position yet. Browse open jobs and submit your application!</p>
            <a href="/apply" style={{ display: "inline-block", background: "#1d4ed8", color: "white", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Browse Open Jobs</a>
          </div>
        )}

        {application && (
          <>
            {/* Status Banner */}
            {isRejected ? (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 16, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "white", fontSize: 22, fontWeight: 900 }}>X</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#dc2626", fontSize: 16 }}>Application Not Selected</div>
                  <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 4 }}>Unfortunately your application was not selected this time. Keep applying — the right opportunity is out there!</div>
                </div>
              </div>
            ) : status === "shortlisted" || status === "accepted" || status === "hired" ? (
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 16, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "white", fontSize: 22, fontWeight: 900 }}>OK</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#15803d", fontSize: 16 }}>
                    {status === "shortlisted" ? "Congratulations! You have been shortlisted!" : "Congratulations! You got the job!"}
                  </div>
                  <div style={{ color: "#16a34a", fontSize: 13, marginTop: 4 }}>
                    {status === "shortlisted" ? "Our HR team will contact you soon to schedule an interview." : "Welcome to the team! HR will be in touch with next steps."}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Progress Timeline */}
            <div style={{ background: "white", borderRadius: 20, padding: 32, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>Application Progress</div>

              <div style={{ display: "flex", alignItems: "flex-start" }}>
                {STEPS.map((step, i) => {
                  const isCompleted = currentStepIndex >= i && !isRejected;
                  const isCurrent = currentStepIndex === i;
                  return (
                    <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        {i > 0 && <div style={{ flex: 1, height: 3, background: isCompleted ? "#1d4ed8" : "#e2e8f0", transition: "background 0.3s" }} />}
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: isRejected && isCurrent ? "#dc2626" : isCompleted ? "#1d4ed8" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: isCurrent && !isRejected ? "3px solid #93c5fd" : "3px solid transparent", transition: "all 0.3s" }}>
                          <span style={{ color: isCompleted || (isRejected && isCurrent) ? "white" : "#94a3b8", fontSize: 13, fontWeight: 800 }}>
                            {isCompleted ? "V" : (i + 1)}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 3, background: currentStepIndex > i && !isRejected ? "#1d4ed8" : "#e2e8f0", transition: "background 0.3s" }} />}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isCompleted ? "#1d4ed8" : "#94a3b8", marginTop: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>{step.label}</div>
                      {isCurrent && !isRejected && <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", marginTop: 4, maxWidth: 80 }}>{step.desc}</div>}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Applied for</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{application.jobId?.title || "Position"}</div>
                </div>
                <span style={{ background: statusColors[status]?.bg || "#dbeafe", color: statusColors[status]?.color || "#1d4ed8", fontWeight: 700, fontSize: 13, padding: "8px 18px", borderRadius: 20 }}>
                  {statusLabels[status] || status}
                </span>
              </div>
            </div>

            {/* Interview Card */}
            {interview && (
              <div style={{ background: "white", borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "2px solid #86efac" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Interview Scheduled</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Date</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                      {new Date(interview.scheduledDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Time</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{interview.scheduledTime || "To be confirmed"}</div>
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>{interview.interviewType || "Online"}</div>
                  </div>
                </div>
                {interview.notes && (
                  <div style={{ marginTop: 14, background: "#f8faff", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                    <span style={{ fontWeight: 700 }}>Notes: </span>{interview.notes}
                  </div>
                )}
                {interview.meetingLink && (
                  <div style={{ marginTop: 14 }}>
                    <a href={interview.meetingLink} target="_blank" style={{ display: "inline-block", background: "#1d4ed8", color: "white", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                      Join Interview
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* AI Score if available */}
            {application.aiScore && (
              <div style={{ background: "white", borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Your AI Screening Score</div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: application.aiScore >= 85 ? "#dcfce7" : application.aiScore >= 70 ? "#dbeafe" : "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: application.aiScore >= 85 ? "#16a34a" : application.aiScore >= 70 ? "#1d4ed8" : "#ca8a04" }}>{application.aiScore}%</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, marginBottom: 4 }}>
                      {application.aiScore >= 85 ? "Excellent Match" : application.aiScore >= 70 ? "Good Match" : application.aiScore >= 50 ? "Average Match" : "Below Requirements"}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>Your profile was evaluated based on skills, experience, education and projects</div>
                  </div>
                </div>
              </div>
            )}

            {/* Application Details */}
            <div style={{ background: "white", borderRadius: 20, padding: 32, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Your Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Full Name", value: application.name || application.fullName },
                  { label: "Email", value: application.email },
                  { label: "Phone", value: application.phone || "-" },
                  { label: "Location", value: application.location || "-" },
                  { label: "Experience", value: application.experienceYears ? application.experienceYears + " years" : "-" },
                  { label: "Education", value: application.educationLevel || "-" },
                  { label: "Current Role", value: application.currentPosition || "-" },
                  { label: "Applied On", value: new Date(application.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f8faff", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {application.skills?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {application.skills.map((s: string) => (
                      <span key={s} style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {application.projects?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Projects</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {application.projects.map((p: string, i: number) => (
                      <div key={i} style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#1e3a8a", fontWeight: 500 }}>{p}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {application.certifications?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Certifications</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {application.certifications.map((c: string, i: number) => (
                      <span key={i} style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(application.githubUrl || application.portfolioUrl) && (
                <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                  {application.githubUrl && (
                    <a href={application.githubUrl} target="_blank" style={{ display: "inline-block", background: "#0f172a", color: "white", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>GitHub Profile</a>
                  )}
                  {application.portfolioUrl && (
                    <a href={application.portfolioUrl} target="_blank" style={{ display: "inline-block", background: "#1d4ed8", color: "white", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Portfolio</a>
                  )}
                </div>
              )}
            </div>

            {/* What happens next */}
            {!isRejected && status !== "accepted" && status !== "hired" && (
              <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>What Happens Next</div>
                {[
                  { step: "01", title: "Application Review", desc: "Our HR team reviews your application and qualifications", done: currentStepIndex >= 1 },
                  { step: "02", title: "Shortlisting", desc: "Top candidates are shortlisted based on their profile match", done: currentStepIndex >= 2 },
                  { step: "03", title: "Interview", desc: "Shortlisted candidates are invited for an interview", done: !!interview },
                  { step: "04", title: "Final Decision", desc: "HR makes the final hiring decision after interviews", done: currentStepIndex >= 3 },
                ].map((item) => (
                  <div key={item.step} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.done ? "#dcfce7" : "#eff6ff", border: item.done ? "1.5px solid #86efac" : "1.5px solid #dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: item.done ? "#16a34a" : "#1d4ed8", flexShrink: 0 }}>
                      {item.done ? "V" : item.step}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
