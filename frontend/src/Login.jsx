import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState("")
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

  const inputStyle = (field) => ({
    width: "100%", background: "#0f172a",
    border: `1px solid ${focused === field ? "#38bdf8" : "#1e293b"}`,
    borderRadius: "10px", padding: "12px 14px", fontSize: "14px", color: "#e2e8f0",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(56,189,248,0.12)" : "none"
  })

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "920px", display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", minHeight: "560px", animation: "fadeUp 0.5s ease" }}>

        {/* LEFT - Brand panel */}
        <div style={{ background: "linear-gradient(155deg, #1e3a8a 0%, #0c4a6e 55%, #042c53 100%)", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)", top: "-110px", right: "-110px" }} />
          <div style={{ position: "absolute", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.28), transparent 70%)", bottom: "-70px", left: "-70px" }} />

          <Link to="/" style={{ textDecoration: "none", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                <svg width="19" height="19" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <span style={{ color: "white", fontSize: "17px", fontWeight: 700 }}>ResumeIQ</span>
            </div>
          </Link>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ color: "white", fontSize: "30px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 14px", letterSpacing: "-0.5px" }}>
              Know exactly where<br />you stand
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7, margin: 0, maxWidth: "320px" }}>
              AI-powered semantic matching tells you your real fit score before you ever hit apply.
            </p>
          </div>

          <div style={{ display: "flex", gap: "28px", position: "relative", zIndex: 1 }}>
            {[
              { num: "73%", lbl: "avg fit score" },
              { num: "2.1k", lbl: "resumes analyzed" },
              { num: "94%", lbl: "accuracy" }
            ].map(s => (
              <div key={s.lbl}>
                <span style={{ color: "white", fontSize: "24px", fontWeight: 700, display: "block" }}>{s.num}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px" }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - Form */}
        <div style={{ background: "#0a0f1f", padding: "56px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px" }}>Sign in to continue to your dashboard</p>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "7px", fontWeight: 500 }}>Email address</label>
            <input type="email" placeholder="you@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
              style={inputStyle("email")} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "7px", fontWeight: 500 }}>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={inputStyle("password")} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: "4px", transition: "transform 0.15s, opacity 0.15s", opacity: loading ? 0.7 : 1 }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#1e293b" }} />
            <span style={{ fontSize: "11px", color: "#475569" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {["Google", "GitHub"].map(p => (
              <button key={p} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #1e293b", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                {p}
              </button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#475569", marginTop: "24px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #334155; }
        @media (max-width: 800px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}