"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + "/api" : "http://localhost:8080/api";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await axios.post(API + "/auth/accept-invite", { token, password });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center", maxWidth: 440, width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>OK</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Account Activated!</h2>
          <p style={{ color: "#64748b", margin: "0 0 24px" }}>Your account is ready. You can now log in.</p>
          <a href="/hr-login" style={{ display: "inline-block", background: "#1d4ed8", color: "white", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 48, maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 24 }}>T</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Accept Invitation</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Set your password to activate your account</p>
        </div>
        {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>New Password</label>
          <input type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm Password</label>
          <input type="password" placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading ? "#93c5fd" : "#1d4ed8", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Activating..." : "Activate Account"}
        </button>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 600 }}>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
