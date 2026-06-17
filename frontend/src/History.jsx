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
        setStats({
          avg: avg.toFixed(1),
          best: best.toFixed(1),
          total: res.data.length,
          topMissing
        })
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
    if (s >= 70) return "text-green-400"
    if (s >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const scoreBg = (score) => {
    const s = parseFloat(score)
    if (s >= 70) return "bg-green-400"
    if (s >= 50) return "bg-yellow-400"
    return "bg-red-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm">Your resume match history and insights</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + New Analysis
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-12">Loading dashboard...</div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-1">Total Analyses</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-1">Average Score</p>
              <p className={`text-3xl font-bold ${scoreColor(stats.avg)}`}>{stats.avg}%</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-1">Best Score</p>
              <p className={`text-3xl font-bold ${scoreColor(stats.best)}`}>{stats.best}%</p>
            </div>
          </div>
        )}

        {stats && stats.topMissing.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">
              🎯 Top skills to add to your resume
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.topMissing.map(skill => (
                <span key={skill} className="px-3 py-1 bg-red-900/40 text-red-400 text-xs rounded-full border border-red-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-300 font-medium">No analyses yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Run your first resume match to see history here
            </p>
          </div>
        )}

        {analyses.map((a) => (
          <div key={a.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-4">

            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl font-bold ${scoreColor(a.fit_score)}`}>
                {parseFloat(a.fit_score).toFixed(2)}%
              </span>
              <span className="text-xs text-gray-500">
                {new Date(a.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </span>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
              <div
                className={`h-1.5 rounded-full ${scoreBg(a.fit_score)}`}
                style={{ width: `${parseFloat(a.fit_score)}%` }}
              />
            </div>

            <p className="text-sm text-gray-400 mb-3">{a.recommendation}</p>

            {a.matched_skills && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">✅ Matched</p>
                <div className="flex flex-wrap gap-1">
                  {a.matched_skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-green-900/40 text-green-400 text-xs rounded-full border border-green-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {a.missing_skills && (
              <div>
                <p className="text-xs text-gray-500 mb-1">❌ Missing</p>
                <div className="flex flex-wrap gap-1">
                  {a.missing_skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-red-900/40 text-red-400 text-xs rounded-full border border-red-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-3">
              JD: {(a.job_description || "").slice(0, 100)}...
            </p>

          </div>
        ))}

      </div>
    </div>
  )
}