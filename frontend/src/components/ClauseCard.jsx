export default function ClauseCard({ clause, type }) {
  const isRisk = type === "risk"

  return (
    <div
      className={`rounded-xl border p-5 mb-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        isRisk
          ? "bg-gradient-to-br from-red-50 to-red-50/50 border-red-200/80 hover:shadow-red-100"
          : "bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200/80 hover:shadow-emerald-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Clause text */}
        <div className="flex items-start gap-3 min-w-0">
          <span className={`mt-1 shrink-0 ${isRisk ? "text-red-400" : "text-emerald-400"}`}>
            {isRisk ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          <p className={`text-sm font-medium leading-relaxed ${isRisk ? "text-red-800" : "text-emerald-800"}`}>
            "{clause.clause_text}"
          </p>
        </div>

        {/* Score badge */}
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${
            isRisk
              ? "bg-red-100 text-red-700 ring-1 ring-red-200"
              : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
          }`}
        >
          {clause.risk_score}/10
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-500 mt-3 ml-7 leading-relaxed">
        {clause.explanation}
      </p>
    </div>
  )
}
