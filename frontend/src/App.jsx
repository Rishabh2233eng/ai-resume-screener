import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function App() {
  const [resume, setResume]                 = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult]                 = useState(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState("")
  const [dragging, setDragging]             = useState(false)
  const resultsRef = useRef(null)
  const navigate   = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "null")

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const handleUpgrade = async () => {
    const token = localStorage.getItem("token")
    try {
      const orderRes = await axios.post(
        "http://127.0.0.1:8000/api/payment/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const options = {
        key: orderRes.data.key_id,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "ResumeIQ",
        description: "Premium Subscription",
        order_id: orderRes.data.order_id,
        handler: async function (response) {
          try {
            await axios.post(
              "http://127.0.0.1:8000/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            alert("🎉 You are now a Premium member!")
            window.location.reload()
          } catch { alert("Payment verification failed.") }
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#2563eb" }
      }
      new window.Razorpay(options).open()
    } catch { alert("Failed to start payment.") }
  }

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === "application/pdf") { setResume(file); setError("") }
    else setError("Please drop a PDF file.")
  }

  const handleSubmit = async () => {
    if (!resume || !jobDescription.trim()) { setError("Please upload a resume and enter a job description."); return }
    setError(""); setLoading(true); setResult(null)
    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("job_description", jobDescription)
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/match", formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
      else if (err.response?.status === 403) setError(err.response.data.detail)
      else setError("Something went wrong. Make sure the backend is running.")
    } finally { setLoading(false) }
  }

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(resultsRef.current, { backgroundColor: "#060b18" })
    const pdf = new jsPDF("p", "mm", "a4")
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save("resumeiq-report.pdf")
  }

  const scoreColor = (s) => {
    const n = parseFloat(s)
    if (n >= 70) return "#10b981"
    if (n >= 50) return "#f59e0b"
    return "#ef4444"
  }

  const scoreGlow = (s) => {
    const n = parseFloat(s)
    if (n >= 70) return "rgba(16,185,129,0.15)"
    if (n >= 50) return "rgba(245,158,11,0.15)"
    return "rgba(239,68,68,0.15)"
  }

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Background visuals */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Mesh grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        {/* Orb 1 */}
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)", top: "-200px", right: "-100px" }} />
        {/* Orb 2 */}
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)", bottom: "10%", left: "-100px" }} />
        {/* Orb 3 */}
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)", top: "40%", right: "10%" }} />
      </div>

      {/* Navbar */}
      <nav className="main-nav" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,11,24,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(37,99,235,0.4)" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}>Resume<span style={{ color: "#38bdf8" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#475569" }}>Hi, {user?.name?.split(" ")[0] || "User"}</span>
          {result?.is_premium === false && (
            <span style={{ fontSize: "11px", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "4px 10px", borderRadius: "20px" }}>
              {result.analyses_used}/{result.analyses_limit} used
            </span>
          )}
          <button onClick={() => navigate("/history")} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Dashboard</button>
          <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", border: "1px solid rgba(56,189,248,0.25)", background: "rgba(56,189,248,0.07)", fontSize: "12px", color: "#38bdf8", marginBottom: "20px" }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Powered by semantic AI matching
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "16px", color: "#f1f5f9" }}>
            Know your fit score<br />
            <span style={{ background: "linear-gradient(90deg, #2563eb, #38bdf8, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before you apply</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>Upload your resume and paste a job description — get an instant AI match score with actionable improvement suggestions</p>
        </div>

        {/* Input card */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", marginBottom: "20px", backdropFilter: "blur(10px)" }}>
          <div className="analyzer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: "8px" }}>Your Resume</label>
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
                style={{
                  border: `2px dashed ${dragging ? "#38bdf8" : resume ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "14px", padding: "28px 16px", textAlign: "center", cursor: "pointer",
                  background: dragging ? "rgba(56,189,248,0.06)" : resume ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.2s", height: "160px", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center"
                }}
              >
                {resume ? (
                  <>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, margin: "0 0 3px" }}>{resume.name.slice(0, 22)}...</p>
                    <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <svg width="20" height="20" fill="none" stroke="#38bdf8" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, margin: "0 0 3px" }}>Drop PDF here</p>
                    <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>or click to browse</p>
                  </>
                )}
              </div>
              <input id="fileInput" type="file" accept=".pdf" className="hidden" onChange={(e) => { setResume(e.target.files[0]); setError("") }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: "8px" }}>Job Description</label>
              <textarea
                rows={6} placeholder="Paste the job description here..."
                value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "12px 14px", fontSize: "13px", color: "#e2e8f0", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.7, transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "rgba(56,189,248,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {error && (
            error.includes("limit reached") ? (
              <div style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.06))", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="22" height="22" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>Free tier limit reached</h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" }}>Upgrade to Premium for unlimited analyses, PDF reports, and AI suggestions</p>
                <button onClick={handleUpgrade} style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Upgrade — ₹99/month
                </button>
              </div>
            ) : (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
                <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
              </div>
            )
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: loading ? "rgba(37,99,235,0.3)" : "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.25)" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            {loading ? (
              <>
                <span style={{ display: "inline-flex", gap: "5px" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", display: "inline-block", animation: "bounce 0.8s infinite", animationDelay: `${i * 0.15}s` }} />)}
                </span>
                Analyzing your resume...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Analyze Match
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div ref={resultsRef}>

            {/* Score hero */}
            <div style={{ background: `linear-gradient(135deg, ${scoreGlow(result.fit_score)}, rgba(6,11,24,0.8))`, border: `1px solid ${scoreColor(result.fit_score)}30`, borderRadius: "20px", padding: "40px 32px", marginBottom: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${scoreGlow(result.fit_score)}, transparent 70%)`, top: "-100px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />
              <p style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Overall Fit Score</p>
              <div className="score-big" style={{ fontSize: "88px", fontWeight: 700, lineHeight: 1, marginBottom: "12px", color: scoreColor(result.fit_score), textShadow: `0 0 40px ${scoreColor(result.fit_score)}60` }}>
                {result.fit_score}%
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 20px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "14px", color: "#e2e8f0", marginBottom: "24px" }}>
                {result.recommendation}
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ height: "100%", width: `${result.fit_score}%`, background: `linear-gradient(90deg, ${scoreColor(result.fit_score)}, #06b6d4)`, borderRadius: "4px", transition: "width 1.2s ease", boxShadow: `0 0 12px ${scoreColor(result.fit_score)}60` }} />
              </div>
            </div>

            {/* Sub scores */}
            <div className="score-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Semantic Score", value: result.semantic_score, sub: "Overall meaning similarity", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { label: "Skill Match", value: result.skill_match_score, sub: `${result.total_job_skills} required skills found`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
              ].map(item => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "8px", background: `${scoreColor(item.value)}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="none" stroke={scoreColor(item.value)} strokeWidth="2" viewBox="0 0 24 24"><path d={item.icon}/></svg>
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{item.label}</p>
                  <p style={{ fontSize: "36px", fontWeight: 700, color: scoreColor(item.value), marginBottom: "4px", lineHeight: 1 }}>{item.value}%</p>
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Skills section */}
            <div style={{ display: "grid", gridTemplateColumns: result.matched_skills.length > 0 && result.missing_skills.length > 0 ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "16px" }}>
              {result.matched_skills.length > 0 && (
                <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "#10b981", fontWeight: 600, margin: 0 }}>Matched ({result.matched_skills.length})</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {result.matched_skills.map(skill => (
                      <span key={skill} style={{ padding: "4px 11px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "12px", color: "#10b981" }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_skills.length > 0 && (
                <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" fill="none" stroke="#f87171" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "#f87171", fontWeight: 600, margin: 0 }}>Missing ({result.missing_skills.length})</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {result.missing_skills.map(skill => (
                      <span key={skill} style={{ padding: "4px 11px", borderRadius: "20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "#f87171" }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(6,182,212,0.04))", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="none" stroke="#38bdf8" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", color: "#38bdf8", fontWeight: 700, margin: 0 }}>AI Improvement Suggestions</p>
                    <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Personalized recommendations to boost your score</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #2563eb, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "11px", color: "white", fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download */}
            <button onClick={handleDownloadPDF}
              style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e2e8f0" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#94a3b8" }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download Full Report as PDF
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        textarea::placeholder { color: #334155; }
      `}</style>
    </div>
  )
}