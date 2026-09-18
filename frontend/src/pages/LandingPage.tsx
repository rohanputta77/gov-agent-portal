import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page, data?: any) => void;
}

const DOMAINS = [
  {
    id: "domestic",
    title: "Domestic",
    icon: "🏠",
    color: "from-blue-500 to-cyan-500",
    pillColor: "bg-blue-50 text-blue-700 ring-blue-500/20",
    subDomains: [
      "Driver's License", "Bank Operations", "Government Benefits", "Tax Filing", 
      "Insurance", "Property Registration", "Vehicle Registration", "Utilities", 
      "Telecom", "Healthcare Records", "Legal Documents", "Municipal Services"
    ]
  },
  {
    id: "travel",
    title: "Travel & Immigration",
    icon: "✈️",
    color: "from-indigo-500 to-purple-500",
    pillColor: "bg-indigo-50 text-indigo-700 ring-indigo-500/20",
    subDomains: [
      "Passport & Visa", "Travel Insurance", "Visa Applications (USA, UK, Canada, Australia, Schengen)", 
      "Flight Bookings & Visa Requirements", "Immunizations & Health Certificates"
    ]
  },
  {
    id: "education",
    title: "Education Abroad",
    icon: "🎓",
    color: "from-emerald-500 to-teal-500",
    pillColor: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    subDomains: [
      "University Applications", "Visa for Study (Student Visa)", "Admission Letters", 
      "Financial Proof", "Accommodation", "Education Loan", "TOEFL/IELTS Documentation", 
      "Transcript & Degree Verification"
    ]
  },
  {
    id: "employment",
    title: "Employment",
    icon: "💼",
    color: "from-orange-500 to-red-500",
    pillColor: "bg-orange-50 text-orange-700 ring-orange-500/20",
    subDomains: [
      "Employment Verification", "Reference Letters", "Background Checks", 
      "Work Visa Sponsorship", "Transfer of Credentials"
    ]
  },
];

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="space-y-8 animate-slide-up max-w-6xl mx-auto py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Home
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Choose a bureaucracy domain to begin. Our AI will automatically determine what documents you need, guide you through the process, and help manage compliance.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        {DOMAINS.map((d) => (
          <div
            key={d.id}
            onClick={() => onNavigate("domain-chat", { domain: d.title })}
            className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${d.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl shadow-lg`}>
                {d.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {d.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8 flex-grow">
              {d.subDomains.map((sub, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${d.pillColor}`}
                >
                  {sub}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
              Start Conversation →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
