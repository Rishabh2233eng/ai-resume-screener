import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/login", { email, password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/app")
    } catch (err) { setError(err.response?.data?.detail || "Login failed.") } finally { setLoading(false) }
  }

  return (
    <div style={{ background: "#fafaf9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "920px", display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: "20px", overflow: "hidden", border: "1px solid #e7e5e4", minHeight: "540px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
        <div style={{ background: "linear-gradient(150deg, #0f172a 0%, #1e293b 100%)", padding: "44px 38px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>ResumeIQ</span>
            </div>
          </Link>
          <div>
            <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 12px" }}>Know exactly where<br />you stand</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.7, maxWidth: "300px" }}>AI-powered semantic matching tells you your real fit score before you apply.</p>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[{n:"73%",l:"avg score"},{n:"2.4k",l:"analyzed"},{n:"94%",l:"accuracy"}].map(s => (
              <div key={s.l}><span style={{ color: "white", fontSize: "22px", fontWeight: 700, display: "block" }}>{s.n}</span><span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{s.l}</span></div>
            ))}
          </div>
        </div>
        <div style={{ background: "white", padding: "52px 42px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 28px" }}>Sign in to continue to your dashboard</p>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>Email address</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", background: "#fafaf9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", background: "#fafaf9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}><p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p></div>}
          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: "#0f172a", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}>{loading ? "Signing in..." : "Sign in"}</button>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>Don't have an account? <Link to="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link></p>
        </div>
      </div>
    </div>
  )
}