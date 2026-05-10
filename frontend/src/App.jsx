import { useState } from "react"
import UploadPanel from "./components/UploadPanel"
import RiskReport from "./components/RiskReport"
import Loader from "./components/Loader"

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb w-96 h-96 bg-indigo-400 top-[-10rem] right-[-5rem] animate-float" />
      <div className="bg-orb w-80 h-80 bg-purple-400 bottom-[-8rem] left-[-4rem] animate-float-delayed" />
      <div className="bg-orb w-64 h-64 bg-blue-300 top-[40%] left-[60%] animate-float" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">ClauseGuard</span>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">AI Contract Analyzer</span>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-medium border border-emerald-200/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Secure
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        {!loading && !result && (
          <div className="mb-10 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Understand your<br />
              <span className="gradient-text">contract.</span>
            </h1>
            <p className="text-gray-400 mt-3 text-lg max-w-lg leading-relaxed">
              Upload a PDF, paste a URL, or paste raw text — get an instant plain-English risk report.
              <span className="block mt-1 text-sm text-gray-300">
                Powered by Ollama NLP (Natural Language Processing) Engine.
              </span>
            </p>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <Loader />
        ) : result ? (
          <RiskReport data={result} onReset={() => setResult(null)} />
        ) : (
          <UploadPanel onResult={setResult} onLoading={setLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-100/50">
        <p className="text-xs text-gray-300">
          ClauseGuard is not legal advice. Always consult a qualified lawyer for important decisions.
        </p>
        <p className="text-xs text-gray-200 mt-1">
          Built for INNOVATEX 1.0 • MAKAUT 2026
        </p>
      </footer>
    </div>
  )
}
