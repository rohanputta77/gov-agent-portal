const API_BASE = import.meta.env.VITE_API_URL ?? "https://gov-agent-portal.onrender.com/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    if (res.status === 401) {
       // Ideally trigger a logout event, but for now just clear token
       localStorage.removeItem("token");
       localStorage.removeItem("user");
       window.location.href = "/";
    }
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  dummyLogin: (email: string, name?: string) =>
    fetch(`${API_BASE}/auth/dummy-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    }).then(handleResponse),

  // Agent
  analyzeRequest: (text: string) =>
    fetch(`${API_BASE}/agent/analyze`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),

  chatRequest: (domain: string, message: string, history: any[]) =>
    fetch(`${API_BASE}/chat/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ domain, message, history }),
    }).then(handleResponse),

  getChatHistory: (domain: string) =>
    fetch(`${API_BASE}/chat/history/${domain}`, { headers: getHeaders() }).then(handleResponse),

  // Workflows
  getWorkflowDefinitions: () =>
    fetch(`${API_BASE}/workflows/definitions`, { headers: getHeaders() }).then(handleResponse),

  getUserWorkflows: () =>
    fetch(`${API_BASE}/workflows/`, { headers: getHeaders() }).then(handleResponse),

  submitWorkflow: (workflowId: number) =>
    fetch(`${API_BASE}/workflows/${workflowId}/create-plan`, { method: "POST", headers: getHeaders() }).then(handleResponse),

  completeAction: (actionId: number) =>
    fetch(`${API_BASE}/workflows/${actionId}/actions/complete`, { method: "POST", headers: getHeaders() }).then(handleResponse),

  // Documents
  getDocuments: () =>
    fetch(`${API_BASE}/documents`, { headers: getHeaders() }).then(handleResponse),

  uploadDocument: (file: File, docType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    return fetch(`${API_BASE}/documents/`, { method: "POST", headers, body: formData }).then(handleResponse);
  },

  deleteDocument: (documentId: number) =>
    fetch(`${API_BASE}/documents/${documentId}`, { method: "DELETE", headers: getHeaders() }).then(handleResponse),

  // Audit Logs
  getAuditLogs: () =>
    fetch(`${API_BASE}/audit-logs`, { headers: getHeaders() }).then(handleResponse),
};
