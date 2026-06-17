import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/register", { name, email, password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Create account</h1>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>Start screening your resume with AI</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>

          {[
            { label: "Full Name", type: "text", val: name, set: setName, ph: "Rishabh Jadaun" },
            { label: "Email", type: "email", val: email, set: setEmail, ph: "you@email.com" },
            { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={val}
                onChange={(e) => set(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          ))}

          {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "14px" }}>{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#475569", margin: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}