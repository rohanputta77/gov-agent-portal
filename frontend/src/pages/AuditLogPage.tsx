import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.getAuditLogs(1).then(setLogs).catch(console.error);
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Activity Log</h1>
        <p className="text-slate-500 mt-1">A complete audit trail of all actions taken.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No activity recorded yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-sm shrink-0 mt-0.5">
                {i === 0 ? "★" : "•"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium leading-snug">{log.action_description}</p>
                {log.workflow_id && (
                  <p className="text-xs text-slate-400 mt-0.5">Workflow #{log.workflow_id}</p>
                )}
              </div>
              <time className="text-xs text-slate-400 shrink-0">{formatTime(log.created_at)}</time>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
