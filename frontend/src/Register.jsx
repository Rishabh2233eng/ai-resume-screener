import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/register", { name, email, password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/app")
    } catch (err) { setError(err.response?.data?.detail || "Registration failed.") } finally { setLoading(false) }
  }

  return (
    <div style={{ background: "#fafaf9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "920px", display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: "20px", overflow: "hidden", border: "1px solid #e7e5e4", minHeight: "580px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
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
            <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 12px" }}>Start matching<br />smarter today</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 20px", maxWidth: "300px" }}>Join thousands using AI to understand their real fit before applying.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Semantic AI matching", "Skill gap analysis", "3 free analyses/month"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="14" height="14" fill="none" stroke="#60a5fa" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Free forever, no credit card required</span>
        </div>
        <div style={{ background: "white", padding: "44px 42px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px" }}>Create your account</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>Start screening your resume with AI</p>
          {[{ label: "Full name", type: "text", val: name, set: setName, ph: "Rishabh Jadaun" }, { label: "Email address", type: "email", val: email, set: setEmail, ph: "you@email.com" }, { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" }].map(({ label, type, val, set, ph }) => (
            <div key={label} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>{label}</label>
              <input type={type} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                style={{ width: "100%", background: "#fafaf9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}><p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p></div>}
          <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: "#0f172a", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}>{loading ? "Creating account..." : "Create account"}</button>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}