interface Props {
  activeWorkflows: number;
  avgProgress: number;
  missingDocs: number;
}

export default function StatsBar({ activeWorkflows, avgProgress, missingDocs }: Props) {
  const stats = [
    {
      label: "Active Applications",
      value: activeWorkflows,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: "◈",
    },
    {
      label: "Avg. Completion",
      value: `${avgProgress}%`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "◉",
    },
    {
      label: "Missing Documents",
      value: missingDocs,
      color: missingDocs > 0 ? "text-amber-600" : "text-emerald-600",
      bg: missingDocs > 0 ? "bg-amber-50" : "bg-emerald-50",
      icon: "◻",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center text-2xl ${s.color}`}>
            {s.icon}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
