import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import type { Page } from "../App";

interface Props {
  domain: string;
  onNavigate: (page: Page, data?: any) => void;
}

export default function DomainChatPage({ domain, onNavigate }: Props) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: `Hi! I'm your expert for ${domain}. What are you trying to accomplish today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    
    // We send history WITHOUT the very first greeting (or with it, up to you. Sending it is fine).
    const currentHistory = [...messages];
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.chatRequest(domain, userMsg, currentHistory);
      
      setMessages(prev => [...prev, { role: "assistant", content: res.reply }]);
      if (res.state) {
        setState(res.state);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const requirements = state?.requirements || [];
  const available = requirements.filter((r: any) => r.status === "AVAILABLE").length;
  const total = requirements.length;
  const progress = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 animate-slide-up">
      {/* Left Chat Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("dashboard")} className="text-slate-400 hover:text-slate-600 transition">
              ← Back
            </button>
            <h2 className="font-bold text-slate-800">{domain} Agent</h2>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Live Chat</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-br-none" 
                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-bl-none px-5 py-3.5 text-sm shadow-sm flex gap-1">
                <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="E.g., I want to apply for a student visa to the UK and I have my passport..."
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl px-5 py-4 pr-16 text-sm transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-10 rounded-xl flex items-center justify-center transition-colors"
            >
              ↑
            </button>
          </form>
        </div>
      </div>

      {/* Right State Panel */}
      <div className="w-80 flex flex-col gap-4">
        {/* Goal Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg shrink-0">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Current Goal</p>
          <h3 className="text-lg font-bold leading-tight mb-4">{state?.goal || "Analyzing..."}</h3>
          
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">{progress}%</span>
            <span className="text-xs text-slate-400 mb-1">{available} of {total} docs</span>
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Dynamic Checklist */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 overflow-y-auto">
          <h4 className="font-bold text-slate-900 mb-4">Requirements</h4>
          {requirements.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center mt-8">
              Chat with the agent to generate your checklist.
            </p>
          ) : (
            <div className="space-y-4">
              {requirements.map((req: any, i: number) => (
                <div key={i} className="flex gap-3 group">
                  <div className="shrink-0 mt-0.5">
                    {req.status === "AVAILABLE" ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${req.status === "AVAILABLE" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {req.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{req.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
