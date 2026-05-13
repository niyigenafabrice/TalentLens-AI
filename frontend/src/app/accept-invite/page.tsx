"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + "/api" : "http://localhost:8080/api";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [tokenData, setTokenData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!token) { setTokenError("No invite token found in the link."); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) { setTokenError("This invite link has expired. Please ask your admin to send a new one."); return; }
      setTokenData(payload);
    } catch {
      setTokenError("Invalid invite link. Please check the link and try again.");
    }
  }, [token]);

  const handleActivate = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await axios.post(API + "/auth/accept-invite", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: "#dc2626", fontWeight: 800, fontSize: 20, margin: "0 0 12px" }}>Invalid Link</h2>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{tokenError}</p>
      </div>
    </div>
  );

  if (!tokenData) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "white", fontSize: 16 }}>Verifying your invite link...</div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#16a34a", fontWeight: 800, fontSize: 22, margin: "0 0 12px" }}>Account Activated!</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Your account is ready. Redirecting you to login...</p>
        <div style={{ marginTop: 20, height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #16a34a, #15803d)", width: "100%", animation: "progress 3s linear" }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 440, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🎯</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Welcome to TalentLens!</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "8px 0 0" }}>Set your password to activate your account</p>
        </div>

        {/* User Info Card */}
        <div style={{ background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Your Account Details</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{tokenData.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>📧</span>
            <span style={{ fontSize: 14, color: "#64748b" }}>{tokenData.email}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏷️</span>
            <span style={{ fontSize: 12, background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", padding: "3px 12px", borderRadius: 20, fontWeight: 700 }}>{tokenData.role?.replace("_", " ").toUpperCase()}</span>
          </div>
        </div>

        {/* Password Fields */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Create Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#1d4ed8"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleActivate()}
            style={{ width: "100%", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#1d4ed8"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Activate Button */}
        <button
          onClick={handleActivate}
          disabled={loading}
          style={{ width: "100%", background: loading ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.5 }}
        >
          {loading ? "Activating..." : "Activate My Account 🚀"}
        </button>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 20 }}>
          This invite link expires in 48 hours
        </p>
      </div>
    </div>
  );
}
