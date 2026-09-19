import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import DomainChatPage from "./pages/DomainChatPage";
import DocumentsPage from "./pages/DocumentsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AuditLogPage from "./pages/AuditLogPage";
import WorkflowDetailPage from "./pages/WorkflowDetailPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

export type Page = "dashboard" | "domain-chat" | "documents" | "applications" | "audit" | "workflow-detail";

export interface NavState {
  page: Page;
  data?: any;
}

function MainApp() {
  const [nav, setNav] = useState<NavState>({ page: "dashboard" });
  const { user, isLoading } = useAuth();

  const navigate = (page: Page, data?: any) => setNav({ page, data });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 overflow-hidden font-inter">
      <Sidebar currentPage={nav.page} onNavigate={navigate} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-4 right-6 text-sm text-slate-500 font-medium">
          Logged in as <span className="text-slate-800 font-bold">{user.email}</span>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in mt-4">
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
