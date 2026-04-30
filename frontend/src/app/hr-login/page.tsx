"use client";
import { useState } from "react";
import axios from "axios";

const API = "https://talentlens-ai-production.up.railway.app/api";

export default function HRLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please fill all fields!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(API + "/auth/login", form);
      const { token, user } = res.data;
      if (user.role === "applicant") {
        setError("This login is for HR and Admin only.");
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.response?.data?.message || "Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ flex: 1, background: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 52 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 24, color: "white", fontWeight: 900 }}>T</span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>TalentLens</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>HR Intelligence Platform</div>
          </div>
        </div>
        <h1 style={{ color: "white", fontSize: 34, fontWeight: 900, margin: "0 0 14px" }}>HR & Admin Portal</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, margin: "0 0 44px", lineHeight: 1.7 }}>Manage job postings, screen candidates with AI, and make smarter hiring decisions.</p>
        {[
          { title: "AI Candidate Screening", desc: "Automatically score and rank candidates using AI" },
          { title: "Smart Analytics", desc: "Real-time hiring funnel and performance insights" },
          { title: "Pipeline Management", desc: "Track candidates through every hiring stage" },
          { title: "Interview Scheduling", desc: "Schedule and manage interviews efficiently" },
        ].map((f) => (
          <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 22 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.6)", marginTop: 6, flexShrink: 0 }} />
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ width: 480, background: "white", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>HR Login</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Sign in to your HR account</p>
        </div>
        {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{error}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Email Address</label>
          <input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8faff", color: "#0f172a" }} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "13px 48px 13px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8faff", color: "#0f172a" }} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>{showPassword ? "Hide" : "Show"}</button>
          </div>
        </div>
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "#93c5fd" : "#1d4ed8", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 24 }}>{loading ? "Signing in..." : "Sign In"}</button>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: 0 }}>Not HR? <a href="/" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Go back home</a></p>
      </div>
    </div>
  );
}
