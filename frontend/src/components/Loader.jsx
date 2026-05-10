export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
      {/* Shield icon with pulse */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        {/* Ping ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-indigo-400 animate-ping-slow" />
      </div>

      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="text-gray-700 font-semibold text-lg">Analyzing with AI...</p>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          This takes 30–60 seconds. Your data never leaves your laptop.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Processing via Ollama</span>
        </div>
      </div>
    </div>
  )
}
