import { useState } from "react"
import axios from "axios"

export default function App() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!resume || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("job_description", jobDescription)

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/match", formData)
      setResult(res.data)
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 70) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const scoreBar = (score) => {
    if (score >= 70) return "bg-green-400"
    if (score >= 50) return "bg-yellow-400"
    return "bg-red-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">AI Resume Screener</h1>
          <p className="text-gray-400 text-sm">Upload your resume and paste a job description to get your match score</p>
        </div>

        {/* Input Card */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">

          {/* Resume Upload */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:font-medium hover:file:bg-violet-500 cursor-pointer"
            />
            {resume && <p className="text-xs text-gray-500 mt-1">Selected: {resume.name}</p>}
          </div>

          {/* Job Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
            <textarea
              rows={5}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Match"}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

            {/* Fit Score */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-1">Overall Fit Score</p>
              <p className={`text-6xl font-bold mb-1 ${scoreColor(result.fit_score)}`}>
                {result.fit_score}%
              </p>
              <p className="text-lg">{result.recommendation}</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all ${scoreBar(result.fit_score)}`}
                  style={{ width: `${result.fit_score}%` }}
                />
              </div>
            </div>

            {/* Sub scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Semantic Score</p>
                <p className={`text-2xl font-bold ${scoreColor(result.semantic_score)}`}>
                  {result.semantic_score}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Skill Match</p>
                <p className={`text-2xl font-bold ${scoreColor(result.skill_match_score)}`}>
                  {result.skill_match_score}%
                </p>
              </div>
            </div>

            {/* Matched Skills */}
            {result.matched_skills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-2">✅ Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-green-900/40 text-green-400 text-xs rounded-full border border-green-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missing_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">❌ Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-red-900/40 text-red-400 text-xs rounded-full border border-red-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}