"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

const SKILLS_OPTIONS = ["React","Node.js","TypeScript","MongoDB","Python","Django","PostgreSQL","AWS","Docker","Kubernetes","GraphQL","Vue.js","Angular","Flutter","Java","Spring Boot","PHP","Laravel","Redis","Git"];

export default function ApplyPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragOverCv, setDragOverCv] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", currentTitle: "", yearsOfExperience: "",
    educationLevel: "", summary: "", skills: [] as string[],
    githubUrl: "", portfolioUrl: "", certifications: [] as string[],
    projects: [] as string[], customEducation: "",
  });
  const [certInput, setCertInput] = useState("");
  const [parsedSuccess, setParsedSuccess] = useState(false);
  const [projectInput, setProjectInput] = useState("");

  useEffect(() => {
    axios.get(API + "/jobs").then((r) => setJobs(r.data.data || []));
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill] }));
  };
  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setCustomSkill("");
  };
  const removeSkill = (skill: string) => setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  const addCertification = () => {
    const val = certInput.trim();
    if (val && !form.certifications.includes(val)) { setForm((f) => ({ ...f, certifications: [...f.certifications, val] })); setCertInput(""); }
  };
  const addProject = () => {
    const val = projectInput.trim();
    if (val && !form.projects.includes(val)) { setForm((f) => ({ ...f, projects: [...f.projects, val] })); setProjectInput(""); }
  };

  const handleApply = async () => {
    if (!form.fullName || !form.email || !form.yearsOfExperience || !form.educationLevel) {
      alert("Please fill all required fields: Full Name, Email, Years of Experience, Education Level!");
      return;
    }
    if (!cvFile) { alert("Please upload your CV/Resume!"); return; }
    setSubmitting(true);
    try {
      // 1. Submit the application
      await axios.post(API + "/applicants", {
        name: form.fullName, fullName: form.fullName, email: form.email, phone: form.phone,
        currentPosition: form.currentTitle, jobTitle: form.currentTitle,
        yearsOfExperience: parseInt(form.yearsOfExperience),
        experienceYears: parseInt(form.yearsOfExperience),
        educationLevel: form.educationLevel === "Other" ? form.customEducation : form.educationLevel,
        summary: form.summary, skills: form.skills, githubUrl: form.githubUrl,
        portfolioUrl: form.portfolioUrl, certifications: form.certifications,
        projects: form.projects, jobId: selectedJob._id, source: "external",
        cvFile: cvFile ? cvFile.name : "", location: "Not specified", status: "submitted",
      });

      // 2. Auto-login as applicant so Track My Application works
      try {
        const loginRes = await axios.post(API + "/applicants/login", { email: form.email });
        if (loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.data));
        }
      } catch (e) {
        // login failed silently — they can still see the success screen
      }

      setSubmitted(true);
    } catch (e: any) {
      console.error("Submit error:", e.response?.data);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 24, padding: "52px 48px", textAlign: "center", maxWidth: 520, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "3px solid #86efac" }}>
            <span style={{ fontSize: 32, color: "#16a34a" }}>✓</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Application Received!</h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 6px" }}>Thank you, <strong style={{ color: "#0f172a" }}>{form.fullName}</strong>.</p>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
            Your application for <strong style={{ color: "#1d4ed8" }}>{selectedJob?.title}</strong> has been successfully submitted.
          </p>
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 28 }} />
          <div style={{ textAlign: "left", marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 18 }}>What happens next</div>
            {[
              { step: "01", title: "Application Review", desc: "Our HR team will review your application within 3-5 business days." },
              { step: "02", title: "AI Screening", desc: "Your profile will be scored by our AI based on skills, experience and projects." },
              { step: "03", title: "You Will Be Contacted", desc: "If selected, we will reach out via email or phone to schedule an interview." },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", border: "1.5px solid #dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#1d4ed8", flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="/my-application" style={{ display: "inline-block", padding: "13px 32px", borderRadius: 10, background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Track My Application →
          </a>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ padding: "48px 24px 32px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, color: "white", fontWeight: 900 }}>T</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>TalentLens</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "white", margin: "0 0 12px" }}>Join Our Team</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, margin: 0 }}>Find your perfect role and apply in minutes</p>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
          {jobs.length === 0 ? (
            <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center" }}>
              <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>No open positions right now</h3>
              <p style={{ color: "#94a3b8", margin: 0 }}>Check back soon!</p>
            </div>
          ) : (
            <>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 16, fontWeight: 600 }}>{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {jobs.map((job) => (
                  <div key={job._id} style={{ background: "white", borderRadius: 20, padding: "28px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>{job.title}</h3>
                        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>{job.location} - {job.educationLevel} - {job.experienceYears}+ years</div>
                        <p style={{ color: "#374151", fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>{job.description?.slice(0, 120)}...</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {job.requiredSkills?.slice(0, 5).map((s: string) => (
                            <span key={s} style={{ background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setSelectedJob(job)} style={{ marginLeft: 24, background: "#1d4ed8", color: "white", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Apply Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setSelectedJob(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "8px 16px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Back</button>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{selectedJob.title}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{selectedJob.location} - {selectedJob.experienceYears}+ years experience</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "32px auto", padding: "0 24px 48px" }}>
        <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 28px" }}>Your Application</h2>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Personal Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Full Name *", key: "fullName", placeholder: "e.g. Alice Uwimana" },
                { label: "Email Address *", key: "email", placeholder: "alice@email.com" },
                { label: "Phone Number", key: "phone", placeholder: "+250 7xx xxx xxx" },
                { label: "Current Job Title", key: "currentTitle", placeholder: "e.g. Software Engineer" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{field.label}</label>
                  <input placeholder={field.placeholder} value={(form as any)[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Experience & Education</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Years of Experience *</label>
                <input type="number" placeholder="e.g. 3" value={form.yearsOfExperience} onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Education Level *</label>
                <select value={form.educationLevel} onChange={(e) => setForm((f) => ({ ...f, educationLevel: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff" }}>
                  <option value="">Select level</option>
                  <option>High School</option><option>Diploma</option><option>Bachelor Degree</option>
                  <option>BSc Computer Science</option><option>BSc Software Engineering</option>
                  <option>BSc Information Technology</option><option>MSc Computer Science</option>
                  <option>MSc Software Engineering</option><option>MBA</option><option>PhD</option><option>Other</option>
                </select>
              </div>
            </div>
            {form.educationLevel === "Other" && (
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Please specify your education *</label>
                <input placeholder="e.g. BEng Electrical Engineering" value={form.customEducation} onChange={(e) => setForm((f) => ({ ...f, customEducation: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Professional Summary</label>
            <textarea placeholder="Tell us about yourself..." value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} rows={4}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: "#f8faff" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Documents</div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>CV / Resume * <span style={{ color: "#dc2626" }}>required</span></label>
            <div onDragOver={(e) => { e.preventDefault(); setDragOverCv(true); }} onDragLeave={() => setDragOverCv(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverCv(false); const file = e.dataTransfer.files[0]; if (file) setCvFile(file); }}
              onClick={() => cvInputRef.current?.click()}
              style={{ border: `2px dashed ${dragOverCv ? "#1d4ed8" : cvFile ? "#16a34a" : "#cbd5e1"}`, borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", background: dragOverCv ? "#eff6ff" : cvFile ? "#f0fdf4" : "#f8faff" }}>
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setCvFile(f); }} />
              {cvFile ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{cvFile.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{(cvFile.size / 1024).toFixed(0)} KB</div>
                  <span onClick={(e) => { e.stopPropagation(); setCvFile(null); }} style={{ fontSize: 12, color: "#dc2626", cursor: "pointer", textDecoration: "underline" }}>Remove</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Drop file here or click to browse</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>PDF or Word (.docx)</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Skills</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input placeholder="Add a custom skill..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff" }} />
              <button onClick={addCustomSkill} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#1d4ed8", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SKILLS_OPTIONS.map((skill) => (
                <button key={skill} onClick={() => toggleSkill(skill)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "2px solid", borderColor: form.skills.includes(skill) ? "#1d4ed8" : "#e2e8f0", background: form.skills.includes(skill) ? "#1d4ed8" : "white", color: form.skills.includes(skill) ? "white" : "#64748b" }}>{skill}</button>
              ))}
              {form.skills.filter((s) => !SKILLS_OPTIONS.includes(s)).map((skill) => (
                <span key={skill} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#1d4ed8", color: "white" }}>
                  {skill}<span onClick={() => removeSkill(skill)} style={{ cursor: "pointer", fontSize: 14 }}>x</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Online Presence</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>GitHub Profile URL</label>
                <input placeholder="https://github.com/username" value={form.githubUrl} onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Portfolio / Website URL</label>
                <input placeholder="https://yourportfolio.com" value={form.portfolioUrl} onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8faff" }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Projects <span style={{ color: "#16a34a", fontSize: 10 }}>(OPTIONAL)</span></div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input placeholder="e.g. E-commerce platform built with React and Node.js" value={projectInput} onChange={(e) => setProjectInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProject(); } }}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff" }} />
              <button onClick={addProject} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#1d4ed8", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
            </div>
            {form.projects.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.projects.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600 }}>{p}</span>
                    <span onClick={() => setForm((f) => ({ ...f, projects: f.projects.filter((_, j) => j !== i) }))} style={{ fontSize: 18, color: "#dc2626", cursor: "pointer" }}>x</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "12px", background: "#f8faff", borderRadius: 10, border: "1px dashed #e2e8f0" }}>Add any projects you have worked on</div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Certifications <span style={{ color: "#16a34a", fontSize: 10 }}>(OPTIONAL)</span></div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input placeholder="e.g. AWS Certified Developer, Google Cloud, PMP" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCertification(); } }}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff" }} />
              <button onClick={addCertification} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#7c3aed", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
            </div>
            {form.certifications.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {form.certifications.map((c, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#7c3aed", color: "white" }}>
                    {c}<span onClick={() => setForm((f) => ({ ...f, certifications: f.certifications.filter((_, j) => j !== i) }))} style={{ cursor: "pointer", fontSize: 14 }}>x</span>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "12px", background: "#f8faff", borderRadius: 10, border: "1px dashed #e2e8f0" }}>Add any certifications you have earned</div>
            )}
          </div>

          <button onClick={handleApply} disabled={submitting} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: submitting ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", fontSize: 16, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 16 }}>By submitting, you agree that your information will be reviewed by our HR team</p>
        </div>
      </div>
    </div>
  );
}
