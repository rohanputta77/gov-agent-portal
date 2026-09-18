import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Page } from "../App";
import WorkflowCard from "../components/WorkflowCard";

interface Props {
  onNavigate: (page: Page, data?: any) => void;
}

export default function ApplicationsPage({ onNavigate }: Props) {
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    api.getUserWorkflows(1).then(setWorkflows).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-500 mt-1">Track all your bureaucratic workflows in one place.</p>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <p className="text-slate-400 mb-3">No active applications yet.</p>
          <button onClick={() => onNavigate("dashboard")} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            → Go to Dashboard to start one
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} onClick={() => onNavigate("workflow-detail", wf)} />
          ))}
        </div>
      )}
    </div>
  );
}
