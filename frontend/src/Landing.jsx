import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function AnimatedNumber({ target, suffix = "" }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let current = 0
    const num = parseFloat(target)
    const steps = 40
    const increment = num / steps
    const interval = setInterval(() => {
      current += increment
      if (current >= num) { setVal(num); clearInterval(interval) }
      else setVal(parseFloat(current.toFixed(num % 1 !== 0 ? 1 : 0)))
    }, 30)
    return () => clearInterval(interval)
  }, [])
  return <span>{val}{suffix}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  useEffect(() => { if (localStorage.getItem("token")) navigate("/app") }, [])

  return (
    <div style={{ background: "#fafaf9", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: "#0f172a", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "0 40px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4", position: "sticky", top: 0, background: "rgba(250,250,249,0.95)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "-0.3px" }}>Resume<span style={{ color: "#4338ca" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => navigate("/login")} style={{ padding: "7px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "transparent", color: "#475569", fontSize: "13px", cursor: "pointer" }}>Sign in</button>
          <button onClick={() => navigate("/register")} style={{ padding: "7px 18px", borderRadius: "8px", border: "none", background: "#0f172a", color: "white", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Get started free</button>
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", border: "1px solid #bfdbfe", background: "#eff6ff", fontSize: "12px", color: "#4338ca", marginBottom: "28px" }}>
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Semantic AI resume matching
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 22px", maxWidth: "780px", color: "#0f172a" }}>
          Your resume, scored<br /><span style={{ color: "#4338ca" }}>before you apply</span>
        </h1>
        <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", lineHeight: 1.7, margin: "0 0 40px" }}>
          Upload your resume, paste a job description — get an instant AI match score, skill gap analysis, and personalized improvement tips.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => navigate("/register")} style={{ padding: "13px 30px", borderRadius: "10px", border: "none", background: "#0f172a", color: "white", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Start for free</button>
          <button onClick={() => navigate("/login")} style={{ padding: "13px 30px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: "#334155", fontSize: "14px", cursor: "pointer" }}>Sign in</button>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "18px" }}>No credit card required · 3 free analyses every month</p>

        <div style={{ display: "flex", gap: "48px", marginTop: "60px", paddingTop: "32px", borderTop: "1px solid #e7e5e4", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a" }}><AnimatedNumber target={2400} suffix="+" /></div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Resumes analyzed</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a" }}><AnimatedNumber target={73} suffix="%" /></div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Avg fit score</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a" }}><AnimatedNumber target={94} suffix="%" /></div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Accuracy</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a" }}>₹99/mo</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Premium</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center" }}>
          {["Semantic AI matching", "Skill gap analysis", "AI suggestions", "PDF export", "₹99/mo Premium"].map(f => (
            <span key={f} style={{ padding: "6px 14px", borderRadius: "20px", background: "white", border: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b" }}>{f}</span>
          ))}
        </div>
      </main>

      <footer style={{ padding: "20px 40px", borderTop: "1px solid #e7e5e4", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#94a3b8" }}>© 2026 ResumeIQ. Built by Rishabh.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map(l => <span key={l} style={{ fontSize: "13px", color: "#94a3b8", cursor: "pointer" }}>{l}</span>)}
        </div>
      </footer>
    </div>
  )
}