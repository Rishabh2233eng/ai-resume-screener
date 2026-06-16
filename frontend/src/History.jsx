import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }

    axios.get("http://127.0.0.1:8000/api/users/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAnalyses(res.data))
    .catch(() => navigate("/login"))
    .finally(() => setLoading(false))
  }, [])

  const scoreColor = (score) => {
    if (score >= 70) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Match History</h1>
            <p className="text-gray-400 text-sm">Your past resume analyses</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + New Analysis
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-12">Loading history...</div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-300 font-medium">No analyses yet</p>
            <p className="text-gray-500 text-sm mt-1">Run your first resume match to see history here</p>
          </div>
        )}

        {analyses.map((a) => (
          <div key={a.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl font-bold ${scoreColor(a.fit_score)}`}>
                {a.fit_score}%
              </span>
              <span className="text-xs text-gray-500">
                {new Date(a.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{a.recommendation}</p>
            {a.matched_skills && (
              <div className="flex flex-wrap gap-2">
                {a.matched_skills.split(",").map(skill => skill.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-green-900/40 text-green-400 text-xs rounded-full border border-green-800">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}