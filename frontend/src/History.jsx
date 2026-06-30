import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }

    axios.get("http://127.0.0.1:8000/api/users/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAnalyses(res.data)
      if (res.data.length > 0) {
        const avg = res.data.reduce((s, a) => s + parseFloat(a.fit_score), 0) / res.data.length
        const best = Math.max(...res.data.map(a => parseFloat(a.fit_score)))
        const missingCount = {}
        res.data.forEach(a => {
          if (a.missing_skills) {
            a.missing_skills.split(",").map(s => s.trim()).filter(Boolean).forEach(skill => {
              missingCount[skill] = (missingCount[skill] || 0) + 1
            })
          }
        })
        const topMissing = Object.entries(missingCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill]) => skill)
        setStats({ avg: avg.toFixed(1), best: best.toFixed(1), total: res.data.length, topMissing })
      }
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login")
      }
    })
    .finally(() => setLoading(false))
  }, [])

  const scoreColor = (s) => { const n = parseFloat(s); return n >= 70 ? "#047857" : n >= 50 ? "#b45309" : "#b91c1c" }
  const scoreBg = (s) => { const n = parseFloat(s); return n >= 70 ? "#d1fae5" : n >= 50 ? "#fef3c7" : "#fee2e2" }
  const scoreBorder = (s) => { const n = parseFloat(s); return n >= 70 ? "#6ee7b7" : n >= 50 ? "#fcd34d" : "#fca5a5" }
  const scoreBarColor = (s) => { const n = parseFloat(s); return n >= 70 ? "#047857" : n >= 50 ? "#b45309" : "#b91c1c" }

  return (
    <div style={{ background: "#f1f0ed", minHeight: "100vh", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom: "1.5px solid #d6d3cd", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(241,240,237,0.92)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #4338ca, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(67,56,202,0.3)" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Resume<span style={{ color: "#4338ca" }}>IQ</span></span>
        </div>
        <button onClick={() => navigate("/app")} style={{ padding: "7px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #4338ca, #7c3aed)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(67,56,202,0.25)" }}>
          + New Analysis
        </button>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "44px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 6px" }}>Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#78716c", margin: 0, fontWeight: 500 }}>Your resume match history and insights</p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#78716c", fontWeight: 500 }}>Loading dashboard...</div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            {[
              { label: "Total Analyses", value: stats.total, color: "#0f172a", icon: "📋" },
              { label: "Average Score", value: `${stats.avg}%`, color: scoreColor(stats.avg), icon: "📊" },
              { label: "Best Score", value: `${stats.best}%`, color: scoreColor(stats.best), icon: "🏆" },
            ].map(item => (
              <div key={item.label} style={{ background: "white", border: "1.5px solid #e7e5e4", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: "20px", marginBottom: "8px" }}>{item.icon}</p>
                <p style={{ fontSize: "10px", color: "#78716c", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px", fontWeight: 700 }}>{item.label}</p>
                <p style={{ fontSize: "26px", fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top missing skills */}
        {stats && stats.topMissing.length > 0 && (
          <div style={{ background: "linear-gradient(135deg, #fef2f2, white)", border: "1.5px solid #fca5a5", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(239,68,68,0.06)" }}>
            <p style={{ fontSize: "13px", color: "#b91c1c", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              Top skills to add to your resume
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {stats.topMissing.map(skill => (
                <span key={skill} style={{ padding: "5px 13px", borderRadius: "20px", background: "white", border: "1.5px solid #fca5a5", fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && analyses.length === 0 && (
          <div style={{ background: "white", border: "1.5px solid #e7e5e4", borderRadius: "18px", padding: "52px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
            <p style={{ fontSize: "16px", color: "#44403c", fontWeight: 700, margin: "0 0 6px" }}>No analyses yet</p>
            <p style={{ fontSize: "13px", color: "#a8a29e", margin: "0 0 20px" }}>Run your first resume match to see history here</p>
            <button onClick={() => navigate("/app")} style={{ padding: "11px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #4338ca, #7c3aed)", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Analyze my resume
            </button>
          </div>
        )}

        {/* Analysis cards */}
        {analyses.map((a) => (
          <div key={a.id} style={{ background: "white", border: "1.5px solid #e7e5e4", borderRadius: "16px", padding: "22px", marginBottom: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>

            {/* Score + date row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "8px 16px", borderRadius: "12px", background: scoreBg(a.fit_score), border: `1.5px solid ${scoreBorder(a.fit_score)}` }}>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: scoreColor(a.fit_score) }}>{parseFloat(a.fit_score).toFixed(1)}%</span>
                </div>
                <div>
                  <p style={{ fontSize: "13px", color: "#44403c", fontWeight: 700, margin: "0 0 2px" }}>{a.recommendation}</p>
                  <p style={{ fontSize: "11px", color: "#a8a29e", margin: 0 }}>
                    {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: "6px", background: "#f1f0ed", borderRadius: "3px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${parseFloat(a.fit_score)}%`, background: scoreBarColor(a.fit_score), borderRadius: "3px", transition: "width 0.8s ease" }} />
            </div>

            {/* Skills row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {a.matched_skills && (
                <div>
                  <p style={{ fontSize: "11px", color: "#047857", fontWeight: 700, marginBottom: "7px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    Matched
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {a.matched_skills.split(",").map(s => s.trim()).filter(Boolean).slice(0, 6).map(skill => (
                      <span key={skill} style={{ padding: "3px 9px", borderRadius: "20px", background: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: "11px", color: "#047857", fontWeight: 600 }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {a.missing_skills && (
                <div>
                  <p style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 700, marginBottom: "7px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
                    Missing
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {a.missing_skills.split(",").map(s => s.trim()).filter(Boolean).slice(0, 6).map(skill => (
                      <span key={skill} style={{ padding: "3px 9px", borderRadius: "20px", background: "#fef2f2", border: "1px solid #fca5a5", fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* JD preview */}
            <p style={{ fontSize: "11px", color: "#a8a29e", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f0ed" }}>
              {(a.job_description || "").slice(0, 120)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}