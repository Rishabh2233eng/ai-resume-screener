import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Pricing() {
  const navigate = useNavigate()
  const [hoveredPlan, setHoveredPlan] = useState(null)

  return (
    <div style={{ background: "#f1f0ed", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: "#0f172a" }}>
      <nav style={{ borderBottom: "1.5px solid #d6d3cd", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(241,240,237,0.92)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Resume<span style={{ color: "#4338ca" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/login")} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Sign in</button>
          <button onClick={() => navigate("/register")} style={{ padding: "7px 16px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #4338ca, #7c3aed)", color: "white", fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>Get started</button>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 16px", borderRadius: "20px", border: "1.5px solid #c7d2fe", background: "#eef2ff", fontSize: "12px", color: "#4338ca", marginBottom: "20px", fontWeight: 600 }}>✦ Simple, transparent pricing</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>Pay only when you need more</h1>
          <p style={{ fontSize: "16px", color: "#57534e", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>Start free, upgrade when you're ready. No subscriptions, no hidden fees.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", animation: "fadeUp 0.6s ease" }}>

          {/* Free plan */}
          <div
            onMouseEnter={() => setHoveredPlan("free")}
            onMouseLeave={() => setHoveredPlan(null)}
            style={{ background: "white", border: `2px solid ${hoveredPlan === "free" ? "#c7d2fe" : "#e7e5e4"}`, borderRadius: "20px", padding: "36px 28px", transition: "all 0.2s", transform: hoveredPlan === "free" ? "translateY(-4px)" : "translateY(0)", boxShadow: hoveredPlan === "free" ? "0 12px 32px rgba(67,56,202,0.1)" : "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", color: "#78716c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Free</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-1px" }}>₹0</span>
                <span style={{ fontSize: "14px", color: "#78716c" }}>/month</span>
              </div>
              <p style={{ fontSize: "13px", color: "#78716c", marginTop: "6px" }}>Perfect for getting started</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {["3 analyses per month", "Fit score + skill gap", "Basic recommendations", "PDF report download", "Match history (7 days)"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#ecfdf5", border: "1.5px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" fill="none" stroke="#047857" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ fontSize: "13px", color: "#44403c", fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/register")} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f0ed" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}>
              Get started free
            </button>
          </div>

          {/* Premium plan */}
          <div
            onMouseEnter={() => setHoveredPlan("premium")}
            onMouseLeave={() => setHoveredPlan(null)}
            style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed)", border: "2px solid transparent", borderRadius: "20px", padding: "36px 28px", transition: "all 0.2s", transform: hoveredPlan === "premium" ? "translateY(-4px)" : "translateY(0)", boxShadow: hoveredPlan === "premium" ? "0 16px 40px rgba(67,56,202,0.35)" : "0 8px 24px rgba(67,56,202,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", padding: "4px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", fontSize: "11px", color: "white", fontWeight: 700 }}>MOST POPULAR</div>
            <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: "-60px", right: "-60px" }} />
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Premium</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "44px", fontWeight: 800, color: "white", letterSpacing: "-1px" }}>₹99</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>/month</span>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "6px" }}>For serious job seekers</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px", position: "relative" }}>
              {["Unlimited analyses", "AI career coach suggestions", "Priority processing", "Full match history", "Multi-job comparison", "Early access to new features"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/register")} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: "white", color: "#4338ca", fontSize: "14px", fontWeight: 800, cursor: "pointer", transition: "all 0.15s", position: "relative" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.01)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}>
              Get Premium — ₹99/month
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: "64px", animation: "fadeUp 0.8s ease" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, textAlign: "center", marginBottom: "32px" }}>Frequently asked questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { q: "How does the free tier work?", a: "You get 3 resume analyses per month at no cost. The counter resets on the 1st of every month automatically." },
              { q: "What does 'semantic AI matching' mean?", a: "Instead of just counting keywords, we use a transformer model to understand the meaning of your resume and the job description — so 'ML engineer' and 'machine learning developer' are correctly matched as similar." },
              { q: "Is my resume data stored?", a: "Your PDF is processed in-memory and never stored on our servers. Only the extracted text and match scores are saved to your history." },
              { q: "Can I cancel anytime?", a: "Yes — Premium is month-to-month. Cancel anytime and you'll retain access until the end of your billing period." },
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: "white", border: "1.5px solid #e7e5e4", borderRadius: "14px", overflow: "hidden", transition: "all 0.2s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{q}</span>
        <span style={{ fontSize: "20px", color: "#4338ca", transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
      </button>
      {open && <div style={{ padding: "0 22px 18px", fontSize: "13px", color: "#57534e", lineHeight: 1.7, fontWeight: 500 }}>{a}</div>}
    </div>
  )
}