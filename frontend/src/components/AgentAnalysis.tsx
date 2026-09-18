interface Props {
  result: any;
  onViewWorkflow: () => void;
}

const STATUS_CONFIG: Record<string, { icon: string; label: string; class: string }> = {
  AVAILABLE:  { icon: "✓", label: "Available",  class: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  MISSING:    { icon: "✕", label: "Missing",    class: "text-red-600 bg-red-50 border-red-200" },
  EXPIRED:    { icon: "⚠", label: "Expired",    class: "text-amber-600 bg-amber-50 border-amber-200" },
  NEEDS_REVIEW: { icon: "?", label: "Review",   class: "text-blue-600 bg-blue-50 border-blue-200" },
};

export default function AgentAnalysisPanel({ result, onViewWorkflow }: Props) {
  const { intent, workflow, requirements, actions } = result;
  const entities = intent?.entities || {};
  const available = requirements.filter((r: any) => r.status === "AVAILABLE").length;
  const total = requirements.length;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">Agent Analysis</p>
            <h3 className="text-white font-bold text-xl">{workflow.name}</h3>
            {intent?.summary && (
              <p className="text-slate-300 text-sm mt-1">{intent.summary}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{pct}%</div>
            <div className="text-xs text-slate-400">documents ready</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-0 divide-x divide-slate-100">
        {/* Entities */}
        <div className="p-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Extracted Details</h4>
          {Object.entries(entities).length > 0 ? (
            <dl className="space-y-3">
              {Object.entries(entities).map(([key, val]) => (
                <div key={key}>
                  <dt className="text-xs text-slate-400 capitalize">{key.replace(/_/g, " ")}</dt>
                  <dd className="text-sm font-semibold text-slate-800">
                    {Array.isArray(val) ? (val as string[]).join(" → ") : String(val)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-400 italic">No entities extracted</p>
          )}
        </div>

        {/* Requirements */}
        <div className="p-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Requirements ({available}/{total})
          </h4>
          <ul className="space-y-2">
            {requirements.map((req: any, i: number) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.NEEDS_REVIEW;
              return (
                <li key={i} className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${cfg.class}`}>
                    {cfg.icon}
                  </span>
                  <span className={`text-sm ${req.status === "AVAILABLE" ? "text-slate-400 line-through" : "text-slate-800 font-medium"}`}>
                    {req.doc_type}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Actions */}
        <div className="p-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Next Actions</h4>
          <ol className="space-y-3">
            {actions.map((act: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-snug">{act.description}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
        <button
          onClick={onViewWorkflow}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          Open Full Workflow →
        </button>
      </div>
    </div>
  );
}
