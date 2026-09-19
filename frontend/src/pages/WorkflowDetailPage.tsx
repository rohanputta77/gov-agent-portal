import { useState } from "react";
import { api } from "../services/api";
import type { Page } from "../App";

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  AVAILABLE:  { icon: "✓", color: "text-emerald-700", bg: "bg-emerald-50",  label: "Available"  },
  MISSING:    { icon: "✕", color: "text-red-600",     bg: "bg-red-50",      label: "Missing"    },
  EXPIRED:    { icon: "⚠", color: "text-amber-600",   bg: "bg-amber-50",    label: "Expired"    },
  NEEDS_REVIEW: { icon: "!", color: "text-amber-600", bg: "bg-amber-100",   label: "Needs Review" },
};

interface Props {
  workflow: any;
  onNavigate: (page: Page, data?: any) => void;
}

export default function WorkflowDetailPage({ workflow: initialWorkflow, onNavigate }: Props) {
  const [workflow, setWorkflow] = useState<any>(initialWorkflow);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const refresh = () =>
    api.getUserWorkflows(1).then((wfs) => {
      const updated = wfs.find((w: any) => w.id === workflow.id);
      if (updated) setWorkflow(updated);
    });

  const handleComplete = async (actionId: number) => {
    await api.completeAction(actionId);
    refresh();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitWorkflow(workflow.id);
      setSubmitMsg(res.message);
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (!workflow) return null;

  const requirements = workflow.requirements || [];
  const actions = workflow.actions || [];
  const progress = Math.round(workflow.progress);
  const available = requirements.filter((r: any) => r.status === "AVAILABLE").length;
  const missing  = requirements.filter((r: any) => r.status === "MISSING").length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-2">{workflow.domain?.replace("_", " ")}</p>
            <h1 className="text-3xl font-black mb-1">{workflow.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                workflow.status === "Active" ? "bg-indigo-500/30 text-indigo-200" :
                workflow.status === "Submitted" ? "bg-emerald-500/30 text-emerald-200" :
                "bg-slate-600 text-slate-300"
              }`}>
                {workflow.status}
              </span>
              <span className="text-slate-400 text-sm">{available} of {requirements.length} documents ready</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-black text-white">{progress}%</div>
            <p className="text-slate-400 text-xs mt-1">completion</p>
            <div className="mt-3 w-48 bg-slate-700 rounded-full h-2.5 ml-auto">
              <div
                className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit message */}
      {submitMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-medium animate-fade-in">
          ✓ {submitMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Requirements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Document Requirements</h2>
          <div className="space-y-2.5">
            {requirements.map((req: any, i: number) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.MISSING;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </span>
                  <span className={`text-sm flex-1 ${req.status === "AVAILABLE" ? "text-slate-400 line-through" : "text-slate-800 font-medium"}`}>
                    {req.doc_type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Action Plan</h2>
          <div className="space-y-3">
            {actions.map((act: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  act.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {act.status === "COMPLETED" ? "✓" : i + 1}
                </span>
                <span className={`text-sm flex-1 ${act.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {act.description}
                </span>
                {act.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleComplete(act.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-lg transition"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          {workflow.status !== "Submitted" && (
            <button
              onClick={handleSubmit}
              disabled={submitting || missing > 0}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 px-4 rounded-xl transition"
              title={missing > 0 ? `${missing} documents still missing` : ""}
            >
              {submitting ? "Submitting..." : "Submit Application (Simulated)"}
            </button>
          )}
          {missing > 0 && workflow.status !== "Submitted" && (
            <p className="text-xs text-center text-slate-400 mt-2">{missing} documents still missing</p>
          )}
        </div>
      </div>
    </div>
  );
}
