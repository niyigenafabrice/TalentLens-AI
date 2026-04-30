"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "https://talentlens-ai-production.up.railway.app/api";

const SKILLS_OPTIONS = [
  "React",
  "Node.js",
  "TypeScript",
  "MongoDB",
  "Python",
  "Django",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "Vue.js",
  "Angular",
  "Flutter",
  "Java",
  "Spring Boot",
  "PHP",
  "Laravel",
  "Redis",
  "Git",
];

export default function ApplyPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [otherDocs, setOtherDocs] = useState<File[]>([]);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [dragOverCv, setDragOverCv] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const otherDocsInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentTitle: "",
    yearsOfExperience: "",
    educationLevel: "",
    summary: "",
    skills: [] as string[],
  });

  useEffect(() => {
    axios.get(API + "/jobs").then((r) => setJobs(r.data.data || []));
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setCustomSkill("");
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const handleCvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCv(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type.includes("word") ||
        file.name.endsWith(".docx"))
    ) {
      setCvFile(file);
    } else {
      alert("Please upload a PDF or Word document.");
    }
  };

  const handleOtherDocsSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setOtherDocs((prev) => {
      const existing = prev.map((f) => f.name);
      const newFiles = files.filter((f) => !existing.includes(f.name));
      return [...prev, ...newFiles];
    });
  };

  const removeOtherDoc = (name: string) => {
    setOtherDocs((prev) => prev.filter((f) => f.name !== name));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCover(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type.includes("word") ||
        file.name.endsWith(".docx"))
    ) {
      setCoverLetterFile(file);
    } else {
      alert("Please upload a PDF or Word document.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverLetterFile(file);
  };

  const handleApply = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.yearsOfExperience ||
      !form.educationLevel
    ) {
      alert("Please fill all required fields!");
      return;
    }
    if (!cvFile) {
      alert("Please upload your CV/Resume!");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const loggedUser = storedUser ? JSON.parse(storedUser) : null;

      await axios.post(
        API + "/applicants",
        {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          currentPosition: form.currentTitle,
          experienceYears: parseInt(form.yearsOfExperience),
          educationLevel: form.educationLevel,
          summary: form.summary,
          skills: form.skills,
          jobId: selectedJob._id,
          source: "external",
          userId: loggedUser?._id || undefined,
          cvFile: cvFile ? cvFile.name : "",
          otherDocuments: otherDocs.map((f) => f.name),
          coverLetter: coverLetterFile ? coverLetterFile.name : "",
          location: "Not specified",
          status: "submitted",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSubmitted(true);
    } catch (e: any) {
      console.error("Submit error:", e.response?.data);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Upload Box helper ──────────────────────────────────────────────────────
  const UploadBox = ({
    label,
    sublabel,
    icon,
    file,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onClick,
    inputRef,
    accept,
    onChange,
    required,
  }: any) => (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
        {sublabel && (
          <span style={{ color: "#94a3b8", fontWeight: 400 }}> {sublabel}</span>
        )}
      </label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        style={{
          border: `2px dashed ${dragOver ? "#1d4ed8" : file ? "#16a34a" : "#cbd5e1"}`,
          borderRadius: 12,
          padding: "20px",
          textAlign: "center" as const,
          cursor: "pointer",
          background: dragOver ? "#eff6ff" : file ? "#f0fdf4" : "#f8faff",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={onChange}
        />
        {file ? (
          <div>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
              {file.name}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
              {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Drop file here or click to browse
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
              PDF or Word (.docx)
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: "52px 48px",
            textAlign: "center",
            maxWidth: 520,
            width: "100%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              border: "3px solid #86efac",
            }}
          >
            <span style={{ fontSize: 32 }}>✓</span>
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 10px",
            }}
          >
            Application Received!
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 6px" }}>
            Thank you,{" "}
            <strong style={{ color: "#0f172a" }}>{form.fullName}</strong>.
          </p>
          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            Your application for{" "}
            <strong style={{ color: "#1d4ed8" }}>{selectedJob?.title}</strong>{" "}
            has been successfully submitted.
          </p>
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 28 }} />
          <div style={{ textAlign: "left", marginBottom: 28 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#374151",
                textTransform: "uppercase" as const,
                letterSpacing: 0.8,
                marginBottom: 18,
              }}
            >
              What happens next
            </div>
            {[
              {
                step: "01",
                title: "Application Review",
                desc: "Our HR team will review your application within 3–5 business days.",
              },
              {
                step: "02",
                title: "Shortlisting",
                desc: "Candidates who meet our requirements will be shortlisted.",
              },
              {
                step: "03",
                title: "You Will Be Contacted",
                desc: "If selected, we'll reach out via email or phone to schedule an interview.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{ display: "flex", gap: 16, marginBottom: 16 }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    border: "1.5px solid #dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#1d4ed8",
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/my-application"
            style={{
              display: "inline-block",
              padding: "13px 32px",
              borderRadius: 10,
              background: "#1d4ed8",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Track My Application →
          </a>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div style={{ padding: "48px 24px 32px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <span style={{ fontSize: 24, color: "white", fontWeight: 900 }}>
                T
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>
              TalentLens
            </span>
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "white",
              margin: "0 0 12px",
            }}
          >
            Join Our Team
          </h1>
          <p
            style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, margin: 0 }}
          >
            Find your perfect role and apply in minutes
          </p>
        </div>
        <div
          style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}
        >
          {jobs.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: 48,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>
                No open positions right now
              </h3>
              <p style={{ color: "#94a3b8", margin: 0 }}>Check back soon!</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: "28px 32px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: "0 0 8px",
                          }}
                        >
                          {job.title}
                        </h3>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 14,
                            marginBottom: 12,
                          }}
                        >
                          📍 {job.location} · 🎓 {job.educationLevel} · ⏱{" "}
                          {job.experienceYears}+ years
                        </div>
                        <p
                          style={{
                            color: "#374151",
                            fontSize: 14,
                            margin: "0 0 16px",
                            lineHeight: 1.6,
                          }}
                        >
                          {job.description?.slice(0, 120)}...
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap" as const,
                          }}
                        >
                          {job.requiredSkills?.slice(0, 5).map((s: string) => (
                            <span
                              key={s}
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: 12,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJob(job)}
                        style={{
                          marginLeft: 24,
                          background: "#1d4ed8",
                          color: "white",
                          border: "none",
                          borderRadius: 12,
                          padding: "12px 24px",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap" as const,
                          flexShrink: 0,
                        }}
                      >
                        Apply Now →
                      </button>
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => setSelectedJob(null)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>
            {selectedJob.title}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            📍 {selectedJob.location} · {selectedJob.experienceYears}+ years
            experience
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 680, margin: "32px auto", padding: "0 24px 48px" }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 36,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 28px",
            }}
          >
            Your Application
          </h2>

          {/* Personal Info */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              Personal Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Full Name *",
                  key: "fullName",
                  placeholder: "e.g. Alice Uwimana",
                },
                {
                  label: "Email Address *",
                  key: "email",
                  placeholder: "alice@email.com",
                },
                {
                  label: "Phone Number",
                  key: "phone",
                  placeholder: "+250 7xx xxx xxx",
                },
                {
                  label: "Current Job Title",
                  key: "currentTitle",
                  placeholder: "e.g. Software Engineer",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.key]: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box" as const,
                      background: "#f8faff",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Experience & Education */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              Experience & Education
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
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
                  Years of Experience *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={form.yearsOfExperience}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      yearsOfExperience: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box" as const,
                    background: "#f8faff",
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
                  Education Level *
                </label>
                <select
                  value={form.educationLevel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, educationLevel: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    background: "#f8faff",
                  }}
                >
                  <option value="">Select level</option>
                  <option>High School</option>
                  <option>Diploma</option>
                  <option>Bachelor's Degree</option>
                  <option>BSc Computer Science</option>
                  <option>BSc Software Engineering</option>
                  <option>BSc Information Technology</option>
                  <option>MSc Computer Science</option>
                  <option>MSc Software Engineering</option>
                  <option>MBA</option>
                  <option>PhD</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Professional Summary
            </label>
            <textarea
              placeholder="Tell us about yourself, your experience and why you're a great fit..."
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              rows={4}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                outline: "none",
                resize: "vertical" as const,
                boxSizing: "border-box" as const,
                background: "#f8faff",
              }}
            />
          </div>

          {/* ── DOCUMENTS SECTION ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              Documents
            </div>

            {/* CV / Resume */}
            <UploadBox
              label="CV / Resume"
              sublabel="(PDF or Word)"
              icon="📄"
              file={cvFile}
              dragOver={dragOverCv}
              required={true}
              onDragOver={(e: any) => {
                e.preventDefault();
                setDragOverCv(true);
              }}
              onDragLeave={() => setDragOverCv(false)}
              onDrop={handleCvDrop}
              onClick={() => cvInputRef.current?.click()}
              inputRef={cvInputRef}
              accept=".pdf,.doc,.docx"
              onChange={(e: any) => {
                const f = e.target.files?.[0];
                if (f) setCvFile(f);
              }}
            />
            {cvFile && (
              <div
                style={{ marginTop: -12, marginBottom: 14, textAlign: "right" }}
              >
                <span
                  onClick={() => setCvFile(null)}
                  style={{
                    fontSize: 12,
                    color: "#dc2626",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Remove
                </span>
              </div>
            )}

            {/* Other Documents */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Other Documents{" "}
                <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                  (Certificates, National ID, Passport, etc.)
                </span>
              </label>
              <div
                onClick={() => otherDocsInputRef.current?.click()}
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: "18px 20px",
                  textAlign: "center" as const,
                  cursor: "pointer",
                  background: "#f8faff",
                }}
              >
                <input
                  ref={otherDocsInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleOtherDocsSelect}
                />
                <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Click to add documents
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                  PDF, Word, or Image · Multiple files allowed
                </div>
              </div>
              {otherDocs.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 8,
                  }}
                >
                  {otherDocs.map((f) => (
                    <div
                      key={f.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>📎</span>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {f.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {(f.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>
                      <span
                        onClick={() => removeOtherDoc(f.name)}
                        style={{
                          fontSize: 18,
                          color: "#dc2626",
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <UploadBox
              label="Cover Letter"
              sublabel="(PDF or Word)"
              icon="📝"
              file={coverLetterFile}
              dragOver={dragOverCover}
              required={false}
              onDragOver={(e: any) => {
                e.preventDefault();
                setDragOverCover(true);
              }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              inputRef={fileInputRef}
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            {coverLetterFile && (
              <div
                style={{ marginTop: -12, marginBottom: 14, textAlign: "right" }}
              >
                <span
                  onClick={() => setCoverLetterFile(null)}
                  style={{
                    fontSize: 12,
                    color: "#dc2626",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Remove
                </span>
              </div>
            )}
          </div>

          {/* Skills */}
          <div style={{ marginBottom: 28 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 10,
              }}
            >
              Your Skills{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                ({form.skills.length} selected)
              </span>
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                placeholder="Add a skill not listed below..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  background: "#f8faff",
                }}
              />
              <button
                onClick={addCustomSkill}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1d4ed8",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                + Add
              </button>
            </div>
            {form.skills.filter((s) => !SKILLS_OPTIONS.includes(s)).length >
              0 && (
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  CUSTOM SKILLS
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}
                >
                  {form.skills
                    .filter((s) => !SKILLS_OPTIONS.includes(s))
                    .map((skill) => (
                      <span
                        key={skill}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "#1d4ed8",
                          color: "white",
                        }}
                      >
                        {skill}
                        <span
                          onClick={() => removeSkill(skill)}
                          style={{ cursor: "pointer", fontSize: 14 }}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {SKILLS_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: form.skills.includes(skill)
                      ? "#1d4ed8"
                      : "#e2e8f0",
                    background: form.skills.includes(skill)
                      ? "#1d4ed8"
                      : "white",
                    color: form.skills.includes(skill) ? "white" : "#64748b",
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 12,
              border: "none",
              background: submitting
                ? "#93c5fd"
                : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(29,78,216,0.35)",
            }}
          >
            {submitting ? "Submitting..." : "🚀 Submit Application"}
          </button>
          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 12,
              marginTop: 16,
            }}
          >
            By submitting, you agree to our screening process powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}




