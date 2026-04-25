"use client";
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function LoginPage() {
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Role-based redirect
      if (user.role === "applicant") {
        window.location.href = "/my-application";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          flex: 1,
          background:
            "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 52,
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
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>
              TalentLens
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
              HR Intelligence Platform
            </div>
          </div>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: 34,
            fontWeight: 900,
            margin: "0 0 14px",
            lineHeight: 1.25,
          }}
        >
          Hire Smarter,
          <br />
          Not Harder
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 15,
            margin: "0 0 44px",
            lineHeight: 1.7,
          }}
        >
          A modern recruitment platform that helps HR teams screen, rank and
          manage candidates efficiently.
        </p>

        {[
          {
            title: "AI Candidate Screening",
            desc: "Automatically score and rank candidates using AI",
          },
          {
            title: "Smart Analytics & Reports",
            desc: "Real-time hiring funnel and performance insights",
          },
          {
            title: "Save Time on Hiring",
            desc: "Reduce manual CV review by up to 80%",
          },
          {
            title: "Public Job Application Portal",
            desc: "Candidates apply directly through a clean online form",
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.6)",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                {f.title}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {f.desc}
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 44,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
            Looking for a job?{" "}
          </span>
          <a
            href="/apply"
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.4)",
              paddingBottom: 1,
            }}
          >
            View Open Positions
          </a>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          width: 480,
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        <div style={{ marginBottom: 36 }}>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 8px",
            }}
          >
            Welcome back
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              background: "#f8faff",
              color: "#0f172a",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "13px 48px 13px 16px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                background: "#f8faff",
                color: "#0f172a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: loading ? "#93c5fd" : "#1d4ed8",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
            marginBottom: 24,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
            margin: "0 0 12px",
          }}
        >
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#1d4ed8",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Create one
          </a>
        </p>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 12,
            margin: 0,
          }}
        >
          HR staff?{" "}
          <a
            href="/apply"
            style={{
              color: "#1d4ed8",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Apply for a job instead
          </a>
        </p>
      </div>
    </div>
  );
}
