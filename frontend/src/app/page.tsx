"use client";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.role === "applicant") {
        window.location.href = "/my-application";
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28, color: "white", fontWeight: 900 }}>T</span>
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 900, fontSize: 24 }}>TalentLens</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>HR Intelligence Platform</div>
        </div>
      </div>

      <h1 style={{ color: "white", fontSize: 38, fontWeight: 900, textAlign: "center", margin: "0 0 14px", lineHeight: 1.2 }}>Welcome to TalentLens</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, textAlign: "center", margin: "0 0 52px", maxWidth: 420, lineHeight: 1.7 }}>
        The AI-powered recruitment platform connecting great talent with great companies.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 700 }}>
        <div style={{ flex: 1, minWidth: 280, background: "white", borderRadius: 20, padding: "36px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>I am a Job Seeker</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
            Browse open positions, submit your application, and track your hiring status in real time.
          </p>
          <a href="/register" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#1d4ed8", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none", marginBottom: 12 }}>
            Apply for a Job
          </a>
          <a href="/login" style={{ display: "block", padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Already applied? Sign in
          </a>
        </div>

        <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 32px", border: "1.5px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", margin: "0 0 10px" }}>I am HR / Admin</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
            Manage job postings, review applications, shortlist candidates, and make hiring decisions.
          </p>
          <a href="/hr-login" style={{ display: "block", padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.4)" }}>
            HR Login
          </a>
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 48 }}>
        2025 TalentLens - Powered by AI
      </p>
    </div>
  );
}
