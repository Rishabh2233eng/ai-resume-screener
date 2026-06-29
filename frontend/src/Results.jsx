import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import confetti from "canvas-confetti"

export default function Results() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const reportRef = useRef(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("latestResult")
    if (!stored) { navigate("/app"); return }
    const data = JSON.parse(stored)
    setResult(data)

    // Animate score counting up
    let current = 0
    const target = data.fit_score
    const duration = 1200
    const steps = 60
    const increment = target / steps
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedScore(target)
        clearInterval(interval)
        if (target >= 70) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.4 },
            colors: ["#4338ca", "#7c3aed", "#10b981", "#06b6d4"]
          })
        }
      } else {
        setAnimatedScore(parseFloat(current.toFixed(1)))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [])

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff" })
    const pdf = new jsPDF("p", "mm", "a4")
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save("resumeiq-report.pdf")
  }

  if (!result) return null

  const scoreColor = (s) => { const n = parseFloat(s); return n >= 70 ? "#047857" : n >= 50 ? "#b45309" : "#b91c1c" }
  const scoreBg = (s) => { const n = parseFloat(s); return n >= 70 ? "#d1fae5" : n >= 50 ? "#fef3c7" : "#fee2e2" }
  const scoreBorder = (s) => { const n = parseFloat(s); return n >= 70 ? "#6ee7b7" : n >= 50 ? "#fcd34d" : "#fca5a5" }

  return (
    <div style={{ background: "#f1f0ed", minHeight: "100vh", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1.5px solid #d6d3cd", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(241,240,237,0.92)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(67,56,202,0.3)" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Resume<span style={{ color: "#4338ca" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("/app")} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>New Analysis</button>
          <button onClick={() => navigate("/history")} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Dashboard</button>
        </div>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "44px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", color: "#78716c", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Your Match Report</p>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>Here's how you stack up</h1>
        </div>

        <div ref={reportRef}>
          <div style={{ background: `linear-gradient(135deg, ${scoreBg(result.fit_score)}, white)`, border: `2px solid ${scoreBorder(result.fit_score)}`, borderRadius: "20px", padding: "48px 28px", marginBottom: "20px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: "11px", color: "#78716c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Overall Fit Score</p>
            <div style={{ fontSize: "88px", fontWeight: 800, marginBottom: "12px", color: scoreColor(result.fit_score), letterSpacing: "-3px" }}>{animatedScore}%</div>
            <div style={{ display: "inline-flex", padding: "7px 22px", borderRadius: "20px", background: "white", border: `2px solid ${scoreBorder(result.fit_score)}`, fontSize: "15px", color: scoreColor(result.fit_score), marginBottom: "24px", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>{result.recommendation}</div>
            <div style={{ height: "8px", background: "white", borderRadius: "4px", maxWidth: "440px", margin: "0 auto", overflow: "hidden", border: `1px solid ${scoreBorder(result.fit_score)}` }}>
              <div style={{ height: "100%", width: `${animatedScore}%`, background: scoreColor(result.fit_score), borderRadius: "4px", transition: "width 0.3s ease" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            {[{ label: "Semantic Score", value: result.semantic_score, sub: "Meaning similarity", icon: "📊" }, { label: "Skill Match", value: result.skill_match_score, sub: `${result.total_job_skills} skills in JD`, icon: "🎯" }].map(item => (
              <div key={item.label} style={{ background: "white", border: "1.5px solid #e7e5e4", borderRadius: "16px", padding: "22px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: "20px", marginBottom: "8px" }}>{item.icon}</p>
                <p style={{ fontSize: "11px", color: "#78716c", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px", fontWeight: 700 }}>{item.label}</p>
                <p style={{ fontSize: "30px", fontWeight: 800, color: scoreColor(item.value), marginBottom: "4px" }}>{item.value}%</p>
                <p style={{ fontSize: "11px", color: "#a8a29e", fontWeight: 500 }}>{item.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            {result.matched_skills.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #ecfdf5, white)", border: "1.5px solid #a7f3d0", borderRadius: "16px", padding: "20px" }}>
                <p style={{ fontSize: "13px", color: "#047857", fontWeight: 800, marginBottom: "12px" }}>✓ Matched ({result.matched_skills.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>{result.matched_skills.map(s => <span key={s} style={{ padding: "4px 12px", borderRadius: "20px", background: "white", border: "1.5px solid #a7f3d0", fontSize: "11px", color: "#047857", fontWeight: 600 }}>{s}</span>)}</div>
              </div>
            )}
            {result.missing_skills.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #fef2f2, white)", border: "1.5px solid #fca5a5", borderRadius: "16px", padding: "20px" }}>
                <p style={{ fontSize: "13px", color: "#b91c1c", fontWeight: 800, marginBottom: "12px" }}>✕ Missing ({result.missing_skills.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>{result.missing_skills.map(s => <span key={s} style={{ padding: "4px 12px", borderRadius: "20px", background: "white", border: "1.5px solid #fca5a5", fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>{s}</span>)}</div>
              </div>
            )}
          </div>

          {result.suggestions?.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, #eef2ff, #faf5ff)", border: "1.5px solid #c7d2fe", borderRadius: "18px", padding: "26px", marginBottom: "20px" }}>
              <p style={{ fontSize: "15px", color: "#4338ca", fontWeight: 800, marginBottom: "18px" }}>✦ AI Career Coach Recommendations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", padding: "15px 16px", background: "white", borderRadius: "12px", border: "1.5px solid #e0e7ff" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "8px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}><span style={{ fontSize: "12px", color: "white", fontWeight: 700 }}>{i+1}</span></div>
                    <p style={{ fontSize: "13.5px", color: "#44403c", margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleDownloadPDF} style={{ width: "100%", padding: "14px", borderRadius: "13px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download Full Report as PDF
        </button>
      </div>
    </div>
  )
}