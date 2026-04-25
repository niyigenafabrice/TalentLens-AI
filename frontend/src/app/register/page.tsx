"use client";
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all required fields!");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(API + "/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/apply";
    } catch (e: any) {
      setError(e.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: string,
    type = "text",
    placeholder = "",
  ) => (
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
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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
  );

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
          Start Your
          <br />
          Career Journey
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 15,
            margin: "0 0 44px",
            lineHeight: 1.7,
          }}
        >
          Create an account to apply for jobs, track your application status,
          and get notified about updates.
        </p>
        {[
          {
            title: "Apply for Open Positions",
            desc: "Browse and apply for jobs that match your skills",
          },
          {
            title: "Track Your Application",
            desc: "See real-time status updates on your applications",
          },
          {
            title: "Save Your Progress",
            desc: "Start an application and finish it later",
          },
          {
            title: "Get Notified",
            desc: "Know immediately when your status changes",
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
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 8px",
            }}
          >
            Create Account
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Join TalentLens to apply for jobs
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

        {field("Full Name *", "name", "text", "John Doe")}
        {field("Email Address *", "email", "email", "john@email.com")}
        {field("Phone Number", "phone", "tel", "+250 7XX XXX XXX")}
        {field("Password *", "password", "password", "Min. 6 characters")}
        {field(
          "Confirm Password *",
          "confirm",
          "password",
          "Repeat your password",
        )}

        <button
          onClick={handleRegister}
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
            margin: 0,
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#1d4ed8",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
