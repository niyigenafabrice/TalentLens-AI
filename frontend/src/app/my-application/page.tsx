"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://talentlens-ai-production.up.railway.app/api";

const STEPS = [
  { key: "submitted", label: "Submitted", icon: "1" },
  { key: "under_review", label: "Under Review", icon: "2" },
  { key: "shortlisted", label: "Shortlisted", icon: "3" },
  { key: "accepted", label: "Accepted", icon: "4" },
];

const statusColors: any = {
  draft: { bg: "#f1f5f9", color: "#64748b" },
  submitted: { bg: "#dbeafe", color: "#1d4ed8" },
  under_review: { bg: "#fef9c3", color: "#b45309" },
  shortlisted: { bg: "#dcfce7", color: "#16a34a" },
  accepted: { bg: "#bbf7d0", color: "#15803d" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

const statusLabels: any = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Not Selected",
};

export default function MyApplicationPage() {
  const [application, setApplication] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      window.location.href = "/";
      return;
    }
    const u = JSON.parse(stored);
    if (u.role !== "applicant") {
      window.location.href = "/dashboard";
      return;
    }
    setUser(u);
    fetchApplication(token);
  }, []);

  const fetchApplication = async (token: string) => {
    try {
      const res = await axios.get(API + "/applicants/my-application", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplication(res.data.data);
    } catch (e: any) {
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

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8faff",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid #dbeafe",
              borderTopColor: "#1d4ed8",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#64748b", fontWeight: 600 }}>
            Loading your application...
          </p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Nav */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>
              T
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>
              TalentLens
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              Applicant Portal
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>
            Hi, {user?.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 13,
              color: "#64748b",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#0f172a",
            margin: "0 0 6px",
          }}
        >
          My Application
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px" }}>
          Track the status of your job application below.
        </p>

        {/* Progress Timeline - Always Visible */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 32,
            marginBottom: 20,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Application Progress
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {STEPS.map((step, i) => {
              const isCompleted = currentStepIndex >= i && application;
              const isCurrent = currentStepIndex === i && application;
              const isRejected = status === "rejected";

              return (
                <div
                  key={step.key}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {i > 0 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          background:
                            isCompleted && !isRejected ? "#1d4ed8" : "#e2e8f0",
                          transition: "background 0.3s",
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          isRejected && isCurrent
                            ? "#dc2626"
                            : isCompleted && !isRejected
                              ? "#1d4ed8"
                              : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: isCurrent
                          ? "3px solid #93c5fd"
                          : "3px solid transparent",
                        transition: "all 0.3s",
                      }}
                    >
                      <span
                        style={{
                          color: isCompleted ? "white" : "#94a3b8",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {isCompleted && !isRejected ? "✓" : step.icon}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          background:
                            currentStepIndex > i && application && !isRejected
                              ? "#1d4ed8"
                              : "#e2e8f0",
                          transition: "background 0.3s",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isCompleted && !isRejected ? "#1d4ed8" : "#94a3b8",
                      marginTop: 8,
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status badge */}
          {application && (
            <div
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Applied for
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}
                >
                  {application.jobId?.title || "Position"}
                </div>
              </div>
              <span
                style={{
                  background: statusColors[status]?.bg || "#dbeafe",
                  color: statusColors[status]?.color || "#1d4ed8",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "8px 18px",
                  borderRadius: 20,
                }}
              >
                {statusLabels[status] || status}
              </span>
            </div>
          )}

          {/* Rejected message */}
          {status === "rejected" && (
            <div
              style={{
                marginTop: 16,
                background: "#fee2e2",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#dc2626",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Unfortunately your application was not selected this time. Keep
              applying!
            </div>
          )}

          {/* No application yet */}
          {!application && (
            <div
              style={{ marginTop: 24, textAlign: "center", padding: "20px 0" }}
            >
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
                You have not applied yet. Submit your application to start
                tracking progress!
              </p>
              <a
                href="/apply"
                style={{
                  display: "inline-block",
                  background: "#1d4ed8",
                  color: "white",
                  borderRadius: 10,
                  padding: "13px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Apply Now
              </a>
            </div>
          )}
        </div>

        {/* Details Card - only if application exists */}
        {application && (
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 32,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              Your Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                { label: "Full Name", value: application.name },
                { label: "Email", value: application.email },
                { label: "Phone", value: application.phone || "-" },
                { label: "Location", value: application.location || "-" },
                {
                  label: "Experience",
                  value: application.experienceYears
                    ? application.experienceYears + " years"
                    : "-",
                },
                {
                  label: "Education",
                  value: application.educationLevel || "-",
                },
                {
                  label: "Current Role",
                  value: application.currentPosition || "-",
                },
                {
                  label: "Applied On",
                  value: new Date(application.createdAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#f8faff",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {application.skills?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                  }}
                >
                  Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {application.skills.map((s: string) => (
                    <span
                      key={s}
                      style={{
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        borderRadius: 20,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}





