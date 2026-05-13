"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + "/api" : "http://localhost:8080/api";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Applicants", href: "/applicants" },
  { name: "AI Screening", href: "/screening" },
  { name: "Interviews", href: "/interviews" },
  { name: "Pipeline", href: "/pipeline" },
  { name: "Reports", href: "/reports" },
  { name: "Users", href: "/users" },
];

const ROLES = ["admin", "hr_manager", "viewer"];
const ROLE_COLORS: any = {
  admin:      { bg: "#fee2e2", color: "#dc2626" },
  hr_manager: { bg: "#dbeafe", color: "#1d4ed8" },
  hr_manager2: { bg: "#dbeafe", color: "#1d4ed8" },
  viewer:     { bg: "#f1f5f9", color: "#64748b" },
  applicant:  { bg: "#f5f3ff", color: "#7c3aed" },
};
const ROLE_PERMISSIONS: any = {
  admin:      ["View all", "Create jobs", "Edit jobs", "Delete jobs", "Screen candidates", "Shortlist", "Reject", "Manage users"],
  hr_manager: ["View all", "Create jobs", "Screen candidates", "Shortlist", "Move pipeline"],
  viewer:     ["View all"],
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityUser, setActivityUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "hr_manager" });
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "hr_manager" });
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  
  const [activities, setActivities] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("hr");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API + "/users");
      setUsers(res.data.data || []);
    } catch (e) {
      const stored = localStorage.getItem("user");
      if (stored) setUsers([JSON.parse(stored)]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async (userId: string) => {
    try {
      const res = await axios.get(API + "/users/" + userId + "/activity");
      setActivities(res.data.data || []);
    } catch (e) {
      setActivities([]);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      await axios.put(API + "/users/" + userId, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(API + "/users/" + userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(API + "/users", newUser);
      setUsers((prev) => [...prev, res.data.data]);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "hr_manager" });
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const sendInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) { alert("Please fill in name and email"); return; }
    setInviting(true);
    try {
      await axios.post(API + "/invite", inviteForm);
      setInviteSent(true);
      setTimeout(() => { setShowInviteModal(false); setInviteSent(false); setInviteForm({ name: "", email: "", role: "hr_manager" }); }, 2000);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Filter only HR team (non-applicants)
  const hrUsers = users.filter((u) => u.role !== "applicant");
  const displayUsers = hrUsers;

  const adminCount = hrUsers.filter((u) => u.role === "admin").length;
  const hrCount = hrUsers.filter((u) => u.role === "hr_manager").length;
  const viewerCount = hrUsers.filter((u) => u.role === "viewer").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: 260, minHeight: "100vh", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, color: "white", fontWeight: 900 }}>T</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>TalentLens</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>HR Intelligence Platform</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => (
            <a key={item.name} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: item.name === "Users" ? "rgba(255,255,255,0.2)" : "transparent", color: item.name === "Users" ? "white" : "rgba(255,255,255,0.65)", fontWeight: item.name === "Users" ? 600 : 400, fontSize: 14, borderLeft: item.name === "Users" ? "3px solid white" : "3px solid transparent" }}>
              {item.name}
            </a>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{currentUser?.name || "Admin User"}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{currentUser?.role || "admin"}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 260, flex: 1, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Users</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Manage HR team members, roles and permissions</p>
          </div>
          {isAdmin && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowInviteModal(true)} style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Invite by Email
              </button>
              <button onClick={() => setShowAddModal(true)} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Add HR User
              </button>
            </div>
          )}
        </div>

        {/* Role Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { role: "Admin", count: adminCount, color: "#dc2626", bg: "#fee2e2", permissions: ROLE_PERMISSIONS.admin },
            { role: "HR Manager", count: hrCount, color: "#1d4ed8", bg: "#dbeafe", permissions: ROLE_PERMISSIONS.hr_manager },
            { role: "Viewer", count: viewerCount, color: "#64748b", bg: "#f1f5f9", permissions: ROLE_PERMISSIONS.viewer },
          ].map((r) => (
            <div key={r.role} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ background: r.bg, color: r.color, fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>{r.role}</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: r.color }}>{r.count}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {r.permissions.map((p: string) => (
                  <div key={p} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#16a34a", fontWeight: 900, fontSize: 13 }}>+</span> {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>



        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading users...</div>
        ) : displayUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>No users found</div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8faff", borderBottom: "1px solid #f1f5f9" }}>
                  {["User", "Role", "Last Login", "Permissions", "Activity", isAdmin ? "Actions" : ""].filter(Boolean).map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((u, i) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.viewer;
                  return (
                    <tr key={u._id || i} style={{ borderBottom: i < displayUsers.length - 1 ? "1px solid #f8faff" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: rc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: rc.color, fontSize: 16 }}>
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                              {u.name}
                              {u._id === currentUser?._id && (
                                <span style={{ marginLeft: 8, background: "#dbeafe", color: "#1d4ed8", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>You</span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {isAdmin && u._id !== currentUser?._id && u.role !== "applicant" ? (
                          <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}
                            style={{ background: rc.bg, color: rc.color, border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                          </select>
                        ) : (
                          <span style={{ background: rc.bg, color: rc.color, fontWeight: 700, fontSize: 12, padding: "5px 12px", borderRadius: 20 }}>
                            {(u.role || "viewer").replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{formatDate(u.lastLogin)}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
                          {(ROLE_PERMISSIONS[u.role] || ROLE_PERMISSIONS.viewer).slice(0, 3).map((p: string) => (
                            <span key={p} style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, padding: "2px 8px", borderRadius: 12 }}>{p}</span>
                          ))}
                          {(ROLE_PERMISSIONS[u.role] || []).length > 3 && (
                            <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, padding: "2px 8px", borderRadius: 12 }}>+{ROLE_PERMISSIONS[u.role].length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <button onClick={() => { setActivityUser(u); fetchActivity(u._id); }}
                          style={{ background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          View Log
                        </button>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: "16px 20px" }}>
                          {u._id !== currentUser?._id && (
                            <button onClick={() => deleteUser(u._id)}
                              style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Add New HR User</h2>
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "e.g. Jane Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "e.g. jane@company.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Minimum 6 characters" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(newUser as any)[f.key]}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}>
                {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
              <div style={{ marginTop: 8, background: "#f8faff", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Permissions for this role:</div>
                {ROLE_PERMISSIONS[newUser.role].map((p: string) => (
                  <div key={p} style={{ fontSize: 11, color: "#374151", marginBottom: 2 }}>+ {p}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={addUser} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#1d4ed8", color: "white", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Invite Team Member</h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>Send an email invitation to join TalentLens</p>
            {inviteSent ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>OK</div>
                <div style={{ fontWeight: 700, color: "#15803d", fontSize: 16 }}>Invitation sent!</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Check {inviteForm.email} for the invite link</div>
              </div>
            ) : (
              <>
                {[
                  { label: "Full Name", key: "name", type: "text", placeholder: "e.g. Jane Smith" },
                  { label: "Email Address", key: "email", type: "email", placeholder: "e.g. jane@company.com" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(inviteForm as any)[f.key]}
                      onChange={(e) => setInviteForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Role</label>
                  <select value={inviteForm.role} onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}>
                    <option value="hr_manager">HR Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={sendInvite} disabled={inviting} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#7c3aed", color: "white", fontSize: 14, fontWeight: 700, cursor: inviting ? "not-allowed" : "pointer" }}>
                    {inviting ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {activityUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: 500, maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Activity Log - {activityUser.name}</h2>
              <button onClick={() => setActivityUser(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#64748b", fontWeight: 700, fontSize: 16 }}>X</button>
            </div>
            {activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 600 }}>No activity recorded yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Actions will appear here once the user starts working</div>
              </div>
            ) : activities.map((act: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < activities.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1d4ed8", marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{act.action}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{formatDate(act.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}






