import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function App() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const resultsRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "null")

  useEffect(() => { if (!localStorage.getItem("token")) navigate("/login") }, [])
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/") }

  const handleUpgrade = async () => {
    const token = localStorage.getItem("token")
    try {
      const orderRes = await axios.post("http://127.0.0.1:8000/api/payment/create-order", {}, { headers: { Authorization: `Bearer ${token}` } })
      const options = {
        key: orderRes.data.key_id, amount: orderRes.data.amount, currency: orderRes.data.currency,
        name: "ResumeIQ", description: "Premium Subscription", order_id: orderRes.data.order_id,
        handler: async (response) => {
          try {
            await axios.post("http://127.0.0.1:8000/api/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature
            }, { headers: { Authorization: `Bearer ${token}` } })
            alert("🎉 You are now a Premium member!"); window.location.reload()
          } catch { alert("Payment verification failed.") }
        },
        prefill: { name: user?.name || "", email: user?.email || "" }, theme: { color: "#2563eb" }
      }
      new window.Razorpay(options).open()
    } catch { alert("Failed to start payment.") }
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
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
      const res = await axios.post("http://127.0.0.1:8000/api/match", formData, { headers: { Authorization: `Bearer ${token}` } })
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
      else if (err.response?.status === 403) setError(err.response.data.detail)
      else setError("Something went wrong. Make sure the backend is running.")
    } finally { setLoading(false) }
  }

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(resultsRef.current, { backgroundColor: "#ffffff" })
    const pdf = new jsPDF("p", "mm", "a4")
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save("resumeiq-report.pdf")
  }

  const scoreColor = (s) => { const n = parseFloat(s); return n >= 70 ? "#059669" : n >= 50 ? "#d97706" : "#dc2626" }
  const scoreBg = (s) => { const n = parseFloat(s); return n >= 70 ? "#ecfdf5" : n >= 50 ? "#fffbeb" : "#fef2f2" }
  const scoreBorder = (s) => { const n = parseFloat(s); return n >= 70 ? "#a7f3d0" : n >= 50 ? "#fde68a" : "#fecaca" }

  return (
    <div style={{ background: "#fafaf9", minHeight: "100vh", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #e7e5e4", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,249,0.95)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>Resume<span style={{ color: "#2563eb" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Hi, {user?.name?.split(" ")[0] || "User"}</span>
          {result?.is_premium === false && <span style={{ fontSize: "11px", color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: "20px" }}>{result.analyses_used}/{result.analyses_limit} used</span>}
          <button onClick={() => navigate("/history")} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontSize: "13px", cursor: "pointer" }}>Dashboard</button>
          <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontSize: "13px", cursor: "pointer" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "20px", border: "1px solid #bfdbfe", background: "#eff6ff", fontSize: "12px", color: "#2563eb", marginBottom: "18px" }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Powered by semantic AI matching
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: "12px" }}>
            Know your fit score<br /><span style={{ color: "#2563eb" }}>before you apply</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", maxWidth: "440px", margin: "0 auto" }}>Upload your resume and paste a job description — get instant AI-powered match analysis</p>
        </div>

        <div style={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>Your Resume</label>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => document.getElementById("fileInput").click()}
                style={{ border: `2px dashed ${dragging ? "#2563eb" : resume ? "#10b981" : "#e2e8f0"}`, borderRadius: "12px", padding: "28px 16px", textAlign: "center", cursor: "pointer", background: dragging ? "#eff6ff" : resume ? "#ecfdf5" : "#fafaf9", height: "150px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {resume ? (
                  <>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                      <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>{resume.name.slice(0, 24)}...</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8" }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                      <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Drop PDF here</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8" }}>or click to browse</p>
                  </>
                )}
              </div>
              <input id="fileInput" type="file" accept=".pdf" className="hidden" onChange={(e) => { setResume(e.target.files[0]); setError("") }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>Job Description</label>
              <textarea rows={6} placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                style={{ flex: 1, background: "#fafaf9", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: "#0f172a", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
            </div>
          </div>

          {error && (error.includes("limit reached") ? (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Free tier limit reached</h3>
              <p style={{ fontSize: "13px", color: "#92400e", margin: "0 0 16px" }}>Upgrade to Premium for unlimited analyses and AI suggestions</p>
              <button onClick={handleUpgrade} style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: "#d97706", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Upgrade — ₹99/month</button>
            </div>
          ) : (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
              <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: loading ? "#94a3b8" : "#0f172a", color: "white", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? (
              <><span style={{ display: "inline-flex", gap: "5px" }}>{[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", animation: "bounce 0.8s infinite", animationDelay: `${i*0.15}s` }} />)}</span>Analyzing...</>
            ) : (
              <><svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Analyze Match</>
            )}
          </button>
        </div>

        {result && (
          <div ref={resultsRef}>
            <div style={{ background: scoreBg(result.fit_score), border: `1px solid ${scoreBorder(result.fit_score)}`, borderRadius: "16px", padding: "36px 28px", marginBottom: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Overall Fit Score</p>
              <div style={{ fontSize: "68px", fontWeight: 700, marginBottom: "8px", color: scoreColor(result.fit_score) }}>{result.fit_score}%</div>
              <div style={{ display: "inline-flex", padding: "5px 18px", borderRadius: "20px", background: "white", border: `1px solid ${scoreBorder(result.fit_score)}`, fontSize: "14px", color: scoreColor(result.fit_score), marginBottom: "18px", fontWeight: 600 }}>{result.recommendation}</div>
              <div style={{ height: "6px", background: "white", borderRadius: "3px", maxWidth: "400px", margin: "0 auto", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.fit_score}%`, background: scoreColor(result.fit_score), borderRadius: "3px", transition: "width 1s ease" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[{ label: "Semantic Score", value: result.semantic_score, sub: "Meaning similarity" }, { label: "Skill Match", value: result.skill_match_score, sub: `${result.total_job_skills} skills in JD` }].map(item => (
                <div key={item.label} style={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{item.label}</p>
                  <p style={{ fontSize: "26px", fontWeight: 700, color: scoreColor(item.value), marginBottom: "4px" }}>{item.value}%</p>
                  <p style={{ fontSize: "11px", color: "#94a3b8" }}>{item.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {result.matched_skills.length > 0 && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "14px", padding: "18px" }}>
                  <p style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginBottom: "10px" }}>✓ Matched ({result.matched_skills.length})</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{result.matched_skills.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: "20px", background: "white", border: "1px solid #a7f3d0", fontSize: "11px", color: "#059669" }}>{s}</span>)}</div>
                </div>
              )}
              {result.missing_skills.length > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "14px", padding: "18px" }}>
                  <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: 700, marginBottom: "10px" }}>✕ Missing ({result.missing_skills.length})</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{result.missing_skills.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: "20px", background: "white", border: "1px solid #fecaca", fontSize: "11px", color: "#dc2626" }}>{s}</span>)}</div>
                </div>
              )}
            </div>

            {result.suggestions?.length > 0 && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "#2563eb", fontWeight: 700, marginBottom: "14px" }}>✦ AI Improvement Suggestions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", padding: "12px 14px", background: "white", borderRadius: "10px", border: "1px solid #dbeafe" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: "10px", color: "white", fontWeight: 700 }}>{i+1}</span></div>
                      <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleDownloadPDF} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download Report as PDF
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} } textarea::placeholder{color:#cbd5e1}`}</style>
    </div>
  )
}