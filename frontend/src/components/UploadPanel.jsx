import { useState } from "react"
import axios from "axios"

const BASE = "http://localhost:8000"

export default function UploadPanel({ onResult, onLoading }) {
  const [mode, setMode] = useState("pdf")
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleAnalyze = async () => {
    setError("")
    onLoading(true)
    try {
      let response
      const fd = new FormData()

      if (mode === "pdf") {
        if (!file) { setError("Please select a PDF file"); onLoading(false); return }
        fd.append("file", file)
        response = await axios.post(`${BASE}/analyze/pdf`, fd)
      } else if (mode === "url") {
        if (!url.trim()) { setError("Please enter a URL"); onLoading(false); return }
        fd.append("url", url.trim())
        response = await axios.post(`${BASE}/analyze/url`, fd)
      } else {
        if (!text.trim()) { setError("Please paste some text"); onLoading(false); return }
        fd.append("contract_text", text.trim())
        response = await axios.post(`${BASE}/analyze/text`, fd)
      }

      onResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Is Ollama running?")
    } finally {
      onLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(droppedFile)
      } else {
        setError("Only PDF files are supported")
      }
    }
  }

  const tabs = [
    { id: "pdf", label: "Upload PDF", icon: "📄" },
    { id: "url", label: "Paste URL", icon: "🔗" },
    { id: "text", label: "Paste Text", icon: "📝" },
  ]

  return (
    <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/5 p-7 animate-scale-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Analyze a Contract</h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload a PDF, paste a URL (Terms of Service, lease, NDA), or paste raw text
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100/80 p-1 rounded-xl" id="input-mode-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => { setMode(tab.id); setError("") }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === tab.id
                ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* PDF Upload */}
      {mode === "pdf" && (
        <div
          id="pdf-drop-zone"
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
          }`}
          onClick={() => document.getElementById("pdf-input").click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="pdf-input" type="file" accept=".pdf" className="hidden"
            onChange={e => setFile(e.target.files[0])}
          />
          {file ? (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-emerald-700 font-semibold">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">Drop your PDF here or <span className="text-indigo-500">browse</span></p>
              <p className="text-xs text-gray-300">Supports .pdf files</p>
            </div>
          )}
        </div>
      )}

      {/* URL Input */}
      {mode === "url" && (
        <div className="space-y-2 animate-fade-in">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.07a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.82" />
              </svg>
            </span>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/terms-of-service"
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>
          <p className="text-xs text-gray-300 ml-1">Works with any Terms of Service, Privacy Policy, lease, or NDA page</p>
        </div>
      )}

      {/* Text Input */}
      {mode === "text" && (
        <div className="animate-fade-in">
          <textarea
            id="text-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your contract text here..."
            className="w-full h-52 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all leading-relaxed"
          />
          <p className="text-xs text-gray-300 mt-1 ml-1">
            {text.length > 0 ? `${text.length} characters` : "Min 50 characters required"}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in" id="error-message">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        id="analyze-button"
        onClick={handleAnalyze}
        className="mt-5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Analyze Contract
        </span>
      </button>
    </div>
  )
}
