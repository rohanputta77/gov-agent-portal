import { useState, useEffect } from "react";
import { api } from "../services/api";
import AgentInput from "../components/AgentInput";
import AgentAnalysisPanel from "../components/AgentAnalysisPanel";
import WorkflowCard from "../components/WorkflowCard";
import StatsBar from "../components/StatsBar";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page, data?: any) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = () =>
    api.getUserWorkflows(1).then(setWorkflows).catch(console.error);

  useEffect(() => { loadWorkflows(); }, []);

  const handleAnalyze = async (text: string) => {
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await api.analyzeRequest(text);
      setAnalysisResult(result);
      loadWorkflows(); // refresh workflow cards
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const missingDocs = workflows.reduce(
    (acc, wf) => acc + wf.requirements.filter((r: any) => r.status === "MISSING").length, 0
  );
  const avgProgress = workflows.length
    ? Math.round(workflows.reduce((acc, wf) => acc + wf.progress, 0) / workflows.length)
    : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Good day, <span className="gradient-text">Demo User</span> 👋
        </h1>
        <p className="text-slate-500 mt-1">Let the AI handle your bureaucratic paperwork.</p>
      </div>

      {/* Stats */}
      <StatsBar
        activeWorkflows={workflows.length}
        avgProgress={avgProgress}
        missingDocs={missingDocs}
      />

      {/* AI Input */}
      <AgentInput onSubmit={handleAnalyze} loading={analyzing} />

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 animate-fade-in">
          ⚠ {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <AgentAnalysisPanel
          result={analysisResult}
          onViewWorkflow={() => {
            const wf = workflows.find(
              (w) => w.workflow_type === analysisResult.intent?.workflow
            ) || workflows[workflows.length - 1];
            onNavigate("workflow-detail", wf);
          }}
        />
      )}

      {/* Active Workflows */}
      {workflows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Active Applications</h2>
            <button
              onClick={() => onNavigate("applications")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onClick={() => onNavigate("workflow-detail", wf)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
