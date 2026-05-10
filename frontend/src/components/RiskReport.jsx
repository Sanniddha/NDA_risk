import ClauseCard from "./ClauseCard"

export default function RiskReport({ data, onReset }) {
  const scoreColor = data.overall_score >= 7
    ? "text-red-600 bg-red-50 border-red-200"
    : data.overall_score >= 4
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-emerald-600 bg-emerald-50 border-emerald-200"

  const scoreLabel = data.overall_score >= 7
    ? "High Risk"
    : data.overall_score >= 4
    ? "Moderate Risk"
    : "Low Risk"

  const scoreGlow = data.overall_score >= 7
    ? "risk-glow-red"
    : data.overall_score >= 4
    ? "risk-glow-amber"
    : "risk-glow-green"

  const meterColor = data.overall_score >= 7
    ? "bg-gradient-to-r from-red-400 to-red-500"
    : data.overall_score >= 4
    ? "bg-gradient-to-r from-amber-300 to-amber-500"
    : "bg-gradient-to-r from-emerald-300 to-emerald-500"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analysis Report</h2>
          <p className="text-xs text-gray-400 mt-1 truncate max-w-xs flex items-center gap-1">
            {data.source_type === "url" ? "🔗" : data.source_type === "pdf" ? "📄" : "📝"}
            <span>{data.source_name}</span>
          </p>
        </div>
        <button
          id="analyze-another-button"
          onClick={onReset}
          className="text-sm text-indigo-500 hover:text-indigo-700 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 shrink-0"
        >
          ← Analyze another
        </button>
      </div>

      {/* Summary + Score Card */}
      <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/5 p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <h3 className="font-semibold text-gray-700 text-lg">Summary</h3>
          <span className={`text-sm font-bold px-4 py-2 rounded-full border ${scoreColor} ${scoreGlow}`}>
            {scoreLabel} — {data.overall_score}/10
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
      </div>

      {/* Risk Meter */}
      <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/5 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Risk Level</h3>
          <span className="text-3xl font-black gradient-text">
            {data.overall_score}<span className="text-lg text-gray-300 font-normal">/10</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            className={`h-5 rounded-full transition-all duration-1000 ease-out ${meterColor} ${scoreGlow}`}
            style={{ width: `${data.overall_score * 10}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Dangerous
          </span>
        </div>
      </div>

      {/* High Risk Clauses */}
      <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/5 p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2 text-lg">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse" />
          High Risk Clauses
          <span className="text-xs font-normal text-red-300 ml-1">({data.high_risk.length})</span>
        </h3>
        {data.high_risk.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No high risk clauses found — looking good!</p>
        ) : (
          data.high_risk.map((clause, i) => (
            <ClauseCard key={i} clause={clause} type="risk" />
          ))
        )}
      </div>

      {/* Safe Clauses */}
      <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/5 p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2 text-lg">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          Safe Clauses
          <span className="text-xs font-normal text-emerald-300 ml-1">({data.safe_clauses.length})</span>
        </h3>
        {data.safe_clauses.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No safe clauses identified.</p>
        ) : (
          data.safe_clauses.map((clause, i) => (
            <ClauseCard key={i} clause={clause} type="safe" />
          ))
        )}
      </div>
    </div>
  )
}
