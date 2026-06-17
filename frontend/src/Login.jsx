import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/login", { email, password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>Sign in to your ResumeIQ account</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "14px" }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#475569", margin: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#38bdf8", textDecoration: "none" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}