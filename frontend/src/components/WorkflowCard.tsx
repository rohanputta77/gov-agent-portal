const DOMAIN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  travel_immigration: { label: "Travel & Immigration", color: "text-blue-700", bg: "bg-blue-50" },
  finance_banking:   { label: "Finance & Banking",     color: "text-emerald-700", bg: "bg-emerald-50" },
  tax_compliance:    { label: "Tax & Compliance",      color: "text-purple-700", bg: "bg-purple-50" },
};

interface Props {
  workflow: any;
  onClick: () => void;
}

export default function WorkflowCard({ workflow, onClick }: Props) {
  const domain = DOMAIN_CONFIG[workflow.domain] || { label: workflow.domain, color: "text-slate-600", bg: "bg-slate-100" };
  const progress = Math.round(workflow.progress);
  const missing = workflow.requirements?.filter((r: any) => r.status === "MISSING").length || 0;
  const available = workflow.requirements?.filter((r: any) => r.status === "AVAILABLE").length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      {/* Badge */}
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${domain.bg} ${domain.color} mb-3`}>
        {domain.label}
      </span>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
        {workflow.name}
      </h3>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-bold text-indigo-700">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Counts */}
      <div className="mt-4 flex gap-3">
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
          ✓ {available} ready
        </span>
        {missing > 0 && (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
            ✕ {missing} missing
          </span>
        )}
        <span className={`text-xs ml-auto px-2 py-1 rounded-full font-medium ${
          workflow.status === "Active" ? "bg-indigo-50 text-indigo-700" :
          workflow.status === "Submitted" ? "bg-emerald-50 text-emerald-700" :
          "bg-slate-100 text-slate-500"
        }`}>
          {workflow.status}
        </span>
      </div>
    </div>
  );
}
