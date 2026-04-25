"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const navItems = [
  { name: "Dashboard", href: "/", icon: "▣" },
  { name: "Jobs", href: "/jobs", icon: "◈" },
  { name: "Applicants", href: "/applicants", icon: "◉" },
  { name: "AI Screening", href: "/screening", icon: "◆" },
  { name: "Interviews", href: "/interviews", icon: "◷" },
  { name: "Pipeline", href: "/pipeline", icon: "⇄" },
  { name: "Reports", href: "/reports", icon: "▦" },
  { name: "Users", href: "/users", icon: "◈" },
];

const ROLES = ["admin", "hr_manager", "recruiter", "interviewer", "viewer"];
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  hr_manager: "HR Manager",
  recruiter: "Recruiter",
  interviewer: "Interviewer",
  viewer: "Viewer",
};
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#fde8e8", color: "#b91c1c" },
  hr_manager: { bg: "#e0f2fe", color: "#0369a1" },
  recruiter: { bg: "#d1fae5", color: "#065f46" },
  interviewer: { bg: "#fef3c7", color: "#92400e" },
  viewer: { bg: "#f1f5f9", color: "#475569" },
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt?: string;
};

type ModalMode = "add" | "edit" | null;
const emptyForm = {
  name: "",
  email: "",
  role: "recruiter",
  status: "active" as const,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API + "/users");
      setUsers(res.data.data || res.data || []);
    } catch {
      setUsers([
        {
          _id: "1",
          name: "Alice Johnson",
          email: "alice@company.com",
          role: "admin",
          status: "active",
          createdAt: "2024-01-10",
        },
        {
          _id: "2",
          name: "Bob Smith",
          email: "bob@company.com",
          role: "hr_manager",
          status: "active",
          createdAt: "2024-02-15",
        },
        {
          _id: "3",
          name: "Carol Williams",
          email: "carol@company.com",
          role: "recruiter",
          status: "active",
          createdAt: "2024-03-01",
        },
        {
          _id: "4",
          name: "David Brown",
          email: "david@company.com",
          role: "interviewer",
          status: "inactive",
          createdAt: "2024-03-20",
        },
        {
          _id: "5",
          name: "Eva Martinez",
          email: "eva@company.com",
          role: "recruiter",
          status: "active",
          createdAt: "2024-04-05",
        },
        {
          _id: "6",
          name: "Frank Lee",
          email: "frank@company.com",
          role: "viewer",
          status: "active",
          createdAt: "2024-04-18",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setModalMode("add");
  };
  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setEditId(u._id);
    setError("");
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode(null);
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "add") {
        const res = await axios.post(API + "/users", form);
        setUsers((prev) => [...prev, res.data.data || res.data]);
      } else if (editId) {
        const res = await axios.put(API + "/users/" + editId, form);
        const updated = res.data.data || res.data;
        setUsers((prev) =>
          prev.map((u) => (u._id === editId ? { ...u, ...updated } : u)),
        );
      }
      closeModal();
    } catch {
      if (modalMode === "add") {
        const newUser: User = {
          _id: Date.now().toString(),
          ...form,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
      } else if (editId) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editId ? { ...u, ...form } : u)),
        );
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(API + "/users/" + deleteId);
    } catch {}
    setUsers((prev) => prev.filter((u) => u._id !== deleteId));
    setDeleteId(null);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const avatarColors = ["#0369a1", "#0284c7", "#0ea5e9", "#075985", "#38bdf8"];
  const getAvatarColor = (id: string) =>
    avatarColors[id.charCodeAt(0) % avatarColors.length];

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const newThisMonth = users.filter((u) => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #bae6fd",
    borderRadius: 10,
    fontSize: 14,
    color: "#0c1a2e",
    background: "#f0f9ff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "#0369a1",
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f0f7ff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #075985 0%, #0369a1 50%, #0284c7 100%)",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          boxShadow: "4px 0 30px rgba(3,105,161,0.25)",
        }}
      >
        <div
          style={{
            padding: "30px 22px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}
            >
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>
                T
              </span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 17 }}>
                TalentLens
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
                HR Intelligence Platform
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "18px 10px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              padding: "0 14px",
              marginBottom: 10,
            }}
          >
            Main Menu
          </div>
          {navItems.map((item) => {
            const active = item.name === "Users";
            return (
              <a
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 11,
                  marginBottom: 3,
                  textDecoration: "none",
                  background: active ? "rgba(255,255,255,0.22)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.62)",
                  fontWeight: active ? 700 : 400,
                  fontSize: 14,
                  borderLeft: active
                    ? "3px solid white"
                    : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.name}</span>
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#7dd3fc",
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>
        <div style={{ padding: "0 12px 20px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 13,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              A
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
                Admin User
              </div>
              <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 11 }}>
                HR Manager
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 6px #4ade80",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 260, flex: 1, padding: "36px 36px 48px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 34,
          }}
        >
          <div>
            <p
              style={{
                color: "#0369a1",
                fontSize: 13,
                fontWeight: 600,
                margin: "0 0 4px",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Administration
            </p>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: "#0c1a2e",
                margin: 0,
              }}
            >
              Users
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              Manage platform users and their access roles
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(3,105,161,0.35)",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add User
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total Users",
              value: totalUsers,
              icon: "◉",
              sub: "All accounts",
            },
            {
              label: "Active",
              value: activeUsers,
              icon: "▲",
              sub: "Currently active",
            },
            {
              label: "Admins",
              value: adminCount,
              icon: "◆",
              sub: "Full access",
            },
            {
              label: "New This Month",
              value: newThisMonth,
              icon: "⇄",
              sub: "Recently added",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "20px",
                border: "1px solid #e0f2fe",
                boxShadow: "0 2px 14px rgba(14,165,233,0.07)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -18,
                  right: -18,
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#0ea5e9",
                  opacity: 0.07,
                }}
              />
              <div style={{ fontSize: 18, color: "#0369a1", marginBottom: 12 }}>
                {card.icon}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#0c1a2e",
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  color: "#0369a1",
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 6,
                }}
              >
                {card.label}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "18px 22px",
            border: "1px solid #e0f2fe",
            boxShadow: "0 2px 14px rgba(14,165,233,0.07)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 15,
              }}
            >
              🔍
            </span>
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ ...inputStyle, width: 180, cursor: "pointer" }}
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <div style={{ color: "#94a3b8", fontSize: 13, whiteSpace: "nowrap" }}>
            {filtered.length} of {users.length} users
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            border: "1px solid #e0f2fe",
            boxShadow: "0 2px 16px rgba(14,165,233,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 2fr 1.4fr 1fr 120px",
              padding: "14px 24px",
              background: "#f0f9ff",
              borderBottom: "1px solid #e0f2fe",
            }}
          >
            {["User", "Email", "Role", "Status", "Actions"].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0369a1",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              No users found.
            </div>
          ) : (
            filtered.map((user, idx) => {
              const rc = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;
              return (
                <div
                  key={user._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.5fr 2fr 1.4fr 1fr 120px",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom:
                      idx < filtered.length - 1 ? "1px solid #f0f9ff" : "none",
                    background: "white",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fbff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 13 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: getAvatarColor(user._id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0c1a2e",
                          fontSize: 14,
                        }}
                      >
                        {user.name}
                      </div>
                      {user.createdAt && (
                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          Joined{" "}
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ color: "#475569", fontSize: 13 }}>
                    {user.email}
                  </div>
                  <div>
                    <span
                      style={{
                        background: rc.bg,
                        color: rc.color,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          user.status === "active" ? "#4ade80" : "#cbd5e1",
                        boxShadow:
                          user.status === "active" ? "0 0 5px #4ade80" : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: user.status === "active" ? "#065f46" : "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(user)}
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(user._id)}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,89,133,0.35)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: 22,
              padding: "36px",
              width: 460,
              maxWidth: "95vw",
              boxShadow: "0 24px 60px rgba(3,105,161,0.25)",
              border: "1px solid #bae6fd",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0c1a2e",
                  }}
                >
                  {modalMode === "add" ? "Add New User" : "Edit User"}
                </h2>
                <p
                  style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}
                >
                  {modalMode === "add"
                    ? "Create a new platform account"
                    : "Update user details"}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 18,
                }}
              >
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  placeholder="e.g. Alice Johnson"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alice@company.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: 10,
                        border: "2px solid",
                        borderColor: form.status === s ? "#0369a1" : "#e0f2fe",
                        background: form.status === s ? "#e0f2fe" : "white",
                        color: form.status === s ? "#0369a1" : "#94a3b8",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {s === "active" ? "● Active" : "○ Inactive"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: "12px 0",
                  background: saving
                    ? "#93c5fd"
                    : "linear-gradient(135deg, #0369a1, #0ea5e9)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(3,105,161,0.3)",
                }}
              >
                {saving
                  ? "Saving..."
                  : modalMode === "add"
                    ? "Add User"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,89,133,0.35)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteId(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "34px 32px",
              width: 380,
              maxWidth: "95vw",
              boxShadow: "0 24px 60px rgba(3,105,161,0.25)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#fee2e2",
                margin: "0 auto 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              🗑️
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: 18,
                fontWeight: 900,
                color: "#0c1a2e",
              }}
            >
              Remove User
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 26px" }}>
              Are you sure you want to remove this user? This action cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  background: "linear-gradient(135deg, #b91c1c, #ef4444)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
