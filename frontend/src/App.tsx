import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import DomainChatPage from "./pages/DomainChatPage";
import DocumentsPage from "./pages/DocumentsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AuditLogPage from "./pages/AuditLogPage";
import WorkflowDetailPage from "./pages/WorkflowDetailPage";

export type Page = "dashboard" | "domain-chat" | "documents" | "applications" | "audit" | "workflow-detail";

export interface NavState {
  page: Page;
  data?: any;
}

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: "dashboard" });

  const navigate = (page: Page, data?: any) => setNav({ page, data });

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 overflow-hidden font-inter">
      <Sidebar currentPage={nav.page} onNavigate={navigate} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
          {nav.page === "dashboard" && (
            <LandingPage onNavigate={navigate} />
          )}
          {nav.page === "domain-chat" && (
            <DomainChatPage domain={nav.data?.domain || "Domestic"} onNavigate={navigate} />
          )}
          {nav.page === "documents" && <DocumentsPage />}
          {nav.page === "applications" && (
            <ApplicationsPage onNavigate={navigate} />
          )}
          {nav.page === "audit" && <AuditLogPage />}
          {nav.page === "workflow-detail" && (
            <WorkflowDetailPage workflow={nav.data} onNavigate={navigate} />
          )}
        </div>
      </main>
    </div>
  );
}
