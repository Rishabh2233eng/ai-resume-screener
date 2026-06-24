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
        description: "Premium Subscription - Unlimited Analyses",
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
            alert("🎉 You are now a Premium member! Refresh to see unlimited analyses.")
            window.location.reload()
          } catch (err) {
            alert("Payment verification failed. Please contact support.")
          }
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#2563eb" }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert("Failed to start payment. Please try again.")
    }
  }

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") { setResume(file); setError("") }
    else setError("Please drop a PDF file.")
  }

  const handleSubmit = async () => {
    if (!resume || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
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
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    const canvas  = await html2canvas(resultsRef.current, { backgroundColor: "#060b18" })
    const imgData = canvas.toDataURL("image/png")
    const pdf     = new jsPDF("p", "mm", "a4")
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(imgData, "PNG", 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save("resume-match-report.pdf")
  }

  const scoreColor = (s) => {
    const n = parseFloat(s)
    if (n >= 70) return "#10b981"
    if (n >= 50) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif" }}>

      <nav className="main-nav" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,11,24,0.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.3px" }}>Resume<span style={{ color: "#38bdf8" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", marginRight: "4px" }}>Hi, {user?.name?.split(" ")[0] || "User"}</span>
          {result?.is_premium === false && (
            <span style={{ fontSize: "11px", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "4px 10px", borderRadius: "20px" }}>
              {result.analyses_used}/{result.analyses_limit} used
            </span>
          )}
          <button onClick={() => navigate("/history")} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Dashboard</button>
          <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "20px", border: "1px solid rgba(56,189,248,0.2)", background: "rgba(56,189,248,0.06)", fontSize: "12px", color: "#38bdf8", marginBottom: "20px" }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Powered by semantic AI matching
          </div>
          <h1 className="hero-headline" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: "14px", color: "#f1f5f9" }}>
            Know your fit score<br />
            <span style={{ background: "linear-gradient(90deg, #2563eb, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before you apply</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", maxWidth: "440px", margin: "0 auto" }}>Upload your resume and paste a job description — get instant AI-powered match analysis</p>
        </div>

        <div className="analyzer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: "8px" }}>Your Resume</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
              style={{
                border: `2px dashed ${dragging ? "#38bdf8" : resume ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px", padding: "32px 16px", textAlign: "center", cursor: "pointer",
                background: dragging ? "rgba(56,189,248,0.05)" : resume ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s", height: "160px", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center"
              }}
            >
              {resume ? (
                <>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <svg width="18" height="18" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <p style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, margin: "0 0 2px" }}>{resume.name.slice(0, 24)}...</p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Click to replace</p>
                </>
              ) : (
                <>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <svg width="18" height="18" fill="none" stroke="#38bdf8" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, margin: "0 0 2px" }}>Drop PDF here</p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>or click to browse</p>
                </>
              )}
            </div>
            <input id="fileInput" type="file" accept=".pdf" className="hidden" onChange={(e) => { setResume(e.target.files[0]); setError("") }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: "8px" }}>Job Description</label>
            <textarea
              rows={6}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: "#e2e8f0", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
            />
          </div>
        </div>

        {error && (
          error.includes("limit reached") ? (
            <div style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.08))", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "16px", padding: "28px", textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <svg width="22" height="22" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>You've used all 3 free analyses this month</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px" }}>Upgrade to Premium for unlimited resume matching, PDF reports, and priority processing</p>
              <button onClick={handleUpgrade} style={{ padding: "12px 32px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Upgrade to Premium — ₹99/month
              </button>
            </div>
          ) : (
            <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
          )
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            background: loading ? "rgba(37,99,235,0.4)" : "linear-gradient(135deg, #2563eb, #0891b2)",
            color: "white", fontSize: "15px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", marginBottom: "32px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transition: "transform 0.15s"
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-flex", gap: "4px" }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", display: "inline-block", animation: "bounce 0.8s infinite", animationDelay: `${i * 0.15}s` }} />
                ))}
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

        {result && (
          <div ref={resultsRef}>

            <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(8,145,178,0.12))", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "16px", padding: "32px", marginBottom: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Overall Fit Score</p>
              <div className="score-big" style={{ fontSize: "72px", fontWeight: 700, marginBottom: "8px", color: scoreColor(result.fit_score) }}>
                {result.fit_score}%
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 16px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", fontSize: "14px", color: "#e2e8f0", marginBottom: "20px" }}>
                {result.recommendation}
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.fit_score}%`, background: "linear-gradient(90deg, #2563eb, #06b6d4)", borderRadius: "3px", transition: "width 1s ease" }} />
              </div>
            </div>

            <div className="score-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Semantic Score", value: result.semantic_score, sub: "Meaning similarity" },
                { label: "Skill Match", value: result.skill_match_score, sub: `${result.total_job_skills} skills in JD` }
              ].map(item => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{item.label}</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px", color: scoreColor(item.value) }}>{item.value}%</p>
                  <p style={{ fontSize: "11px", color: "#475569" }}>{item.sub}</p>
                </div>
              ))}
            </div>

            {result.matched_skills.length > 0 && (
              <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Matched Skills ({result.matched_skills.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.matched_skills.map(skill => (
                    <span key={skill} style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "12px", color: "#10b981" }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {result.missing_skills.length > 0 && (
              <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", color: "#f87171", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
                  Missing Skills ({result.missing_skills.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.missing_skills.map(skill => (
                    <span key={skill} style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "#f87171" }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  Improvement Suggestions ({result.suggestions.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                        <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleDownloadPDF} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download Report as PDF
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        textarea::placeholder { color: #334155; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  )
}