"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://talentlens-ai-production.up.railway.app/api";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "▣" },
  { name: "Jobs", href: "/jobs", icon: "◈" },
  { name: "Applicants", href: "/applicants", icon: "◉" },
  { name: "AI Screening", href: "/screening", icon: "◆" },
  { name: "Interviews", href: "/interviews", icon: "◷" },
  { name: "Pipeline", href: "/pipeline", icon: "⇄" },
  { name: "Reports", href: "/reports", icon: "▦" },
  { name: "Users", href: "/users", icon: "◈" },
];

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    experienceYears: "",
    educationLevel: "",
    location: "",
  });
  const [customSkill, setCustomSkill] = useState("");
  const [customEducation, setCustomEducation] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await axios.get(API + "/jobs");
      setJobs(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(skill)
        ? f.requiredSkills.filter((s) => s !== skill)
        : [...f.requiredSkills, skill],
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.location ||
      !form.experienceYears ||
      !form.educationLevel
    ) {
      alert("Please fill all fields!");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(API + "/jobs", {
        ...form,
        educationLevel:
          form.educationLevel === "other"
            ? customEducation
            : form.educationLevel,
        experienceYears: parseInt(form.experienceYears),
      });
      setSuccess("Job created successfully!");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        requiredSkills: [],
        experienceYears: "",
        educationLevel: "",
        location: "",
      });
      fetchJobs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      await axios.delete(API + "/jobs/" + id);
      fetchJobs();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8faff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          boxShadow: "4px 0 24px rgba(29,78,216,0.15)",
        }}
      >
        <div
          style={{
            padding: "32px 24px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>
                T
              </span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>
                TalentLens
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                HR Intelligence Platform
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "0 12px",
              marginBottom: 8,
            }}
          >
            Navigation
          </div>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: "none",
                background:
                  item.name === "Jobs"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color:
                  item.name === "Jobs" ? "white" : "rgba(255,255,255,0.65)",
                fontWeight: item.name === "Jobs" ? 600 : 400,
                fontSize: 14,
                borderLeft:
                  item.name === "Jobs"
                    ? "3px solid white"
                    : "3px solid transparent",
              }}
            >
              
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              A
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                Admin User
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                HR Manager
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
              }}
            ></div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Job Postings
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              {jobs.length} active position{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
            }}
          >
            + Post New Job
          </button>
        </div>

        {/* Success */}
        {success && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 24,
              color: "#15803d",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        {/* Job Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              background: "white",
              borderRadius: 16,
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>◈</div>
            <h3 style={{ color: "#0f172a", margin: "0 0 8px" }}>No jobs yet</h3>
            <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>
              Create your first job posting to start screening candidates
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1d4ed8",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Post First Job
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "24px 28px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    ◈
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        fontSize: 17,
                      }}
                    >
                      {job.title}
                    </div>
                    <div
                      style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}
                    >
                      {job.location} · {job.experienceYears}+ years ·{" "}
                      {job.educationLevel}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {job.requiredSkills?.slice(0, 5).map((s: string, i: number) => (
                        <span
                          key={`${s}-${i}`}
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 20,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {job.requiredSkills?.length > 5 && (
                        <span
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 20,
                          }}
                        >
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "5px 14px",
                      borderRadius: 20,
                    }}
                  >
                    Active
                  </span>
                  <a
                    href={"/applicants?jobId=" + job._id}
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View Applicants
                  </a>
                  <a
                    href={"/screening?jobId=" + job._id}
                    style={{
                      background: "#1d4ed8",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Run AI Screening
                  </a>
                  <button
                    onClick={() => handleDelete(job._id)}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 36,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Post New Job
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            {[
              {
                label: "Job Title *",
                key: "title",
                placeholder: "e.g. Senior Software Engineer",
              },
              {
                label: "Location *",
                key: "location",
                placeholder: "e.g. Kigali, Rwanda",
              },
              {
                label: "Years of Experience *",
                key: "experienceYears",
                placeholder: "e.g. 3",
                type: "number",
              },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={(form as any)[field.key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#f8faff",
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
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
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  outline: "none",
                  background: "#f8faff",
                }}
              >
                <option value="">Select education level</option>
                <option>High School</option>
                <option>BSc Computer Science</option>
                <option>BSc Software Engineering</option>
                <option>BSc Information Technology</option>
                <option>MSc Computer Science</option>
                <option>MSc Software Engineering</option>
                <option>PhD</option>

                <option value="other">Other (type below)</option>
              </select>
              {form.educationLevel === "other" && (
                <input
                  placeholder="Type your education level..."
                  value={customEducation}
                  onChange={(e) => setCustomEducation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#f8faff",
                    marginTop: 10,
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Job Description *
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and what you are looking for..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  background: "#f8faff",
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Required Skills
              </label>
              {/* Custom skill input */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  placeholder="Type a custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customSkill.trim()) {
                      setForm((f) => ({
                        ...f,
                        requiredSkills: [
                          ...f.requiredSkills,
                          customSkill.trim(),
                        ],
                      }));
                      setCustomSkill("");
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
                  onClick={() => {
                    if (customSkill.trim()) {
                      setForm((f) => ({
                        ...f,
                        requiredSkills: [
                          ...f.requiredSkills,
                          customSkill.trim(),
                        ],
                      }));
                      setCustomSkill("");
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "#1d4ed8",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  + Add
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SKILLS_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: form.requiredSkills.includes(skill)
                        ? "#1d4ed8"
                        : "#e2e8f0",
                      background: form.requiredSkills.includes(skill)
                        ? "#1d4ed8"
                        : "white",
                      color: form.requiredSkills.includes(skill)
                        ? "white"
                        : "#64748b",
                      transition: "all 0.15s",
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 10,
                  border: "none",
                  background: submitting ? "#93c5fd" : "#1d4ed8",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
                }}
              >
                {submitting ? "Creating..." : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




