import { useState } from "react";

interface Props {
  onSubmit: (text: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  "I'm planning a 3-week trip to France, Italy and Germany in December. I need a Schengen visa.",
  "I want to apply for a home loan of ₹50 lakhs. I earn ₹1.5 lakh per month.",
  "I started a freelance software business and need to register for GST.",
];

export default function AgentInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm">✦</span>
          <h2 className="text-white font-semibold text-sm tracking-wide uppercase">AI Agent</h2>
          <span className="ml-auto text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium">Powered by Gemini</span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-slate-600 text-sm mb-4">
          Describe your situation in plain language. The agent will identify the right workflow and build your action plan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. I'm planning a 3-week trip to Europe covering France, Italy and Germany..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
          />
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setValue(ex)}
                  className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  Try example {i + 1}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">⟳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>✦</span>
                  Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
