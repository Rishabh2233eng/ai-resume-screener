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
        const topMissing = Object.entries(missingCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([skill]) => skill)
        setStats({ avg: avg.toFixed(1), best: best.toFixed(1), total: res.data.length, topMissing })
      }
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      }
    })
    .finally(() => setLoading(false))
  }, [])

  const scoreColor = (score) => {
    const s = parseFloat(score)
    if (s >= 70) return "#10b981"
    if (s >= 50) return "#f59e0b"
    return "#ef4444"
  }

  const scoreBarColor = (score) => {
    const s = parseFloat(score)
    if (s >= 70) return "linear-gradient(90deg, #10b981, #06b6d4)"
    if (s >= 50) return "linear-gradient(90deg, #f59e0b, #f97316)"
    return "linear-gradient(90deg, #ef4444, #f43f5e)"
  }

  return (
    <div style={{ background: "#060b18", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.5px" }}>Dashboard</h1>
            </div>
            <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>Your resume match history and insights</p>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            + New Analysis
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", color: "#475569", padding: "48px 0" }}>Loading dashboard...</div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Total Analyses", value: stats.total, color: "#f1f5f9" },
              { label: "Average Score", value: `${stats.avg}%`, color: scoreColor(stats.avg) },
              { label: "Best Score", value: `${stats.best}%`, color: scoreColor(stats.best) },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{item.label}</p>
                <p style={{ fontSize: "28px", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top missing skills */}
        {stats && stats.topMissing.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#f87171", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              Top skills to add to your resume
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {stats.topMissing.map(skill => (
                <span key={skill} style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "#f87171" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && analyses.length === 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" fill="none" stroke="#38bdf8" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <p style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: "0 0 6px" }}>No analyses yet</p>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>Run your first resume match to see history here</p>
          </div>
        )}

        {/* Analysis cards */}
        {analyses.map((a) => (
          <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", marginBottom: "12px" }}>

            {/* Score + date */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: scoreColor(a.fit_score) }}>
                  {parseFloat(a.fit_score).toFixed(1)}%
                </span>
                <span style={{ fontSize: "12px", color: "#475569" }}>{a.recommendation}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#334155" }}>
                {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${parseFloat(a.fit_score)}%`, background: scoreBarColor(a.fit_score), borderRadius: "2px" }} />
            </div>

            {/* Matched skills */}
            {a.matched_skills && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", color: "#10b981", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Matched
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {a.matched_skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "11px", color: "#10b981" }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {a.missing_skills && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", color: "#f87171", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
                  Missing
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {a.missing_skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: "11px", color: "#f87171" }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* JD preview */}
            <p style={{ fontSize: "11px", color: "#334155", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
              {(a.job_description || "").slice(0, 120)}...
            </p>
          </div>
        ))}

      </div>
    </div>
  )
}