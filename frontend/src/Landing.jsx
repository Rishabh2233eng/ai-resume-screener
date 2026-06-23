import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Landing() {
  const navigate = useNavigate()

  // If already logged in, go straight to app
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/app")
  }, [])

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav style={{ padding: "0 40px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(6,11,24,0.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" }}>Resume<span style={{ color: "#38bdf8" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => navigate("/login")}
            style={{ padding: "7px 18px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#e2e8f0" }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#94a3b8" }}>
            Sign in
          </button>
          <button onClick={() => navigate("/register")}
            style={{ padding: "7px 18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "transform 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", width: "700px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.1), transparent 70%)", top: "0", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "400px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)", top: "20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", border: "1px solid rgba(56,189,248,0.2)", background: "rgba(56,189,248,0.06)", fontSize: "12px", color: "#38bdf8", marginBottom: "28px", animation: "fadeUp 0.5s ease" }}>
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          AI-powered resume screening
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-2px", margin: "0 0 24px", maxWidth: "800px", animation: "fadeUp 0.6s ease" }}>
          Know your fit score<br />
          <span style={{ background: "linear-gradient(90deg, #2563eb, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before you apply</span>
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#64748b", maxWidth: "520px", lineHeight: 1.7, margin: "0 0 44px", animation: "fadeUp 0.7s ease" }}>
          Upload your resume, paste a job description — get an instant AI match score, skill gap analysis, and actionable improvement suggestions.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s ease" }}>
          <button onClick={() => navigate("/register")}
            style={{ padding: "14px 32px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 24px rgba(37,99,235,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.4)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.3)" }}>
            Start for free — 3 analyses/month
          </button>
          <button onClick={() => navigate("/login")}
            style={{ padding: "14px 32px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontSize: "15px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)" }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}>
            Sign in
          </button>
        </div>

        {/* Social proof */}
        <p style={{ fontSize: "12px", color: "#334155", marginTop: "20px", animation: "fadeUp 0.9s ease" }}>
          No credit card required · Free forever plan available
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px", marginTop: "64px", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 1s ease" }}>
          {[
            { num: "2.1k+", label: "Resumes analyzed" },
            { num: "73%", label: "Avg fit score" },
            { num: "94%", label: "Matching accuracy" },
            { num: "₹99/mo", label: "Premium plan" }
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>{s.num}</div>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "10px", marginTop: "48px", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 1.1s ease" }}>
          {[
            "Semantic AI matching",
            "Skill gap analysis",
            "PDF report export",
            "Match history",
            "Premium — ₹99/mo"
          ].map(f => (
            <span key={f} style={{ padding: "6px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", color: "#64748b" }}>{f}</span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#334155" }}>© 2026 ResumeIQ. Built by Rishabh.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <span key={l} style={{ fontSize: "13px", color: "#334155", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#64748b"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#334155"}>
              {l}
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          nav { padding: 0 20px !important; }
          main { padding: 60px 20px 40px !important; }
        }
      `}</style>
    </div>
  )
}