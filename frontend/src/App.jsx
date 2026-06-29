import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function App() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
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
        prefill: { name: user?.name || "", email: user?.email || "" }, theme: { color: "#4338ca" }
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
    setError(""); setLoading(true)
    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("job_description", jobDescription)
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/match", formData, { headers: { Authorization: `Bearer ${token}` } })
      sessionStorage.setItem("latestResult", JSON.stringify(res.data))
      navigate("/results")
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
      else if (err.response?.status === 403) setError(err.response.data.detail)
      else setError("Something went wrong. Make sure the backend is running.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: "#f1f0ed", minHeight: "100vh", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1.5px solid #d6d3cd", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(241,240,237,0.92)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(67,56,202,0.3)" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" }}>Resume<span style={{ color: "#4338ca" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#57534e", fontWeight: 500 }}>Hi, {user?.name?.split(" ")[0] || "User"}</span>
          <button onClick={() => navigate("/history")} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "13px", cursor: "pointer", fontWeight: 500, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>Dashboard</button>
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #d6d3cd", background: "white", color: "#44403c", fontSize: "13px", cursor: "pointer", fontWeight: 500, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 16px", borderRadius: "20px", border: "1.5px solid #c7d2fe", background: "#eef2ff", fontSize: "12px", color: "#4338ca", marginBottom: "20px", fontWeight: 600 }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Powered by semantic AI matching
          </div>
          <h1 style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-1.2px", marginBottom: "14px" }}>
            Know your fit score<br />
            <span style={{ background: "linear-gradient(90deg, #4338ca, #7c3aed, #c026d3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before you apply</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#57534e", maxWidth: "440px", margin: "0 auto", fontWeight: 500 }}>Upload your resume and paste a job description — get instant AI-powered match analysis</p>
        </div>

        <div style={{ background: "white", border: "1.5px solid #d6d3cd", borderRadius: "18px", padding: "28px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "22px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#78716c", marginBottom: "9px" }}>Your Resume</label>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => document.getElementById("fileInput").click()}
                style={{ border: `2.5px dashed ${dragging ? "#4338ca" : resume ? "#059669" : "#d6d3cd"}`, borderRadius: "14px", padding: "28px 16px", textAlign: "center", cursor: "pointer", background: dragging ? "#eef2ff" : resume ? "#ecfdf5" : "#fafaf9", height: "152px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {resume ? (
                  <>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "9px" }}>
                      <svg width="19" height="19" fill="none" stroke="#047857" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p style={{ fontSize: "12px", color: "#047857", fontWeight: 700 }}>{resume.name.slice(0, 24)}...</p>
                    <p style={{ fontSize: "11px", color: "#78716c" }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "9px" }}>
                      <svg width="19" height="19" fill="none" stroke="#4338ca" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "#44403c", fontWeight: 600 }}>Drop PDF here</p>
                    <p style={{ fontSize: "11px", color: "#a8a29e" }}>or click to browse</p>
                  </>
                )}
              </div>
              <input id="fileInput" type="file" accept=".pdf" className="hidden" onChange={(e) => { setResume(e.target.files[0]); setError("") }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#78716c", marginBottom: "9px" }}>Job Description</label>
              <textarea rows={6} placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                style={{ flex: 1, background: "#fafaf9", border: "1.5px solid #e7e5e4", borderRadius: "14px", padding: "13px 15px", fontSize: "13px", color: "#0f172a", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "#4338ca"} onBlur={(e) => e.target.style.borderColor = "#e7e5e4"} />
            </div>
          </div>

          {error && (error.includes("limit reached") ? (
            <div style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a30)", border: "1.5px solid #fcd34d", borderRadius: "16px", padding: "26px", textAlign: "center", marginBottom: "18px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#fde68a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="21" height="21" fill="none" stroke="#92400e" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 6px" }}>Free tier limit reached</h3>
              <p style={{ fontSize: "13px", color: "#92400e", margin: "0 0 16px", fontWeight: 500 }}>Upgrade to Premium for unlimited analyses and AI suggestions</p>
              <button onClick={handleUpgrade} style={{ padding: "12px 30px", borderRadius: "11px", border: "none", background: "linear-gradient(135deg, #d97706, #ea580c)", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}>Upgrade — ₹99/month</button>
            </div>
          ) : (
            <div style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: "11px", padding: "11px 15px", marginBottom: "16px" }}>
              <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0, fontWeight: 600 }}>{error}</p>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "15px", borderRadius: "13px", border: "none", background: loading ? "#a8a29e" : "linear-gradient(135deg, #4338ca, #7c3aed)", color: "white", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: loading ? "none" : "0 4px 16px rgba(67,56,202,0.3)", transition: "transform 0.15s" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            {loading ? (
              <><span style={{ display: "inline-flex", gap: "5px" }}>{[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", animation: "bounce 0.8s infinite", animationDelay: `${i*0.15}s` }} />)}</span>Analyzing...</>
            ) : (
              <><svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Analyze Match</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} } textarea::placeholder{color:#a8a29e}`}</style>
    </div>
  )
}