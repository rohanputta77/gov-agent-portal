const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  // Agent
  analyzeRequest: (text: string) =>
    fetch(`${API_BASE}/agent/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user_id: 1 }),
    }).then(handleResponse),

  chatRequest: (domain: string, message: string, history: any[]) =>
    fetch(`${API_BASE}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, message, history }),
    }).then(handleResponse),

  // Workflows
  getWorkflowDefinitions: () =>
    fetch(`${API_BASE}/workflows/definitions`).then(handleResponse),

  getUserWorkflows: (userId = 1) =>
    fetch(`${API_BASE}/workflows/user/${userId}`).then(handleResponse),

  submitWorkflow: (workflowId: number) =>
    fetch(`${API_BASE}/workflows/${workflowId}/create-plan`, { method: "POST" }).then(handleResponse),

  completeAction: (actionId: number) =>
    fetch(`${API_BASE}/workflows/${actionId}/actions/complete`, { method: "POST" }).then(handleResponse),

  // Documents
  getDocuments: (userId = 1) =>
    fetch(`${API_BASE}/documents?user_id=${userId}`).then(handleResponse),

  uploadDocument: (file: File, docType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    formData.append("user_id", "1");
    return fetch(`${API_BASE}/documents`, { method: "POST", body: formData }).then(handleResponse);
  },

  deleteDocument: (documentId: number) =>
    fetch(`${API_BASE}/documents/${documentId}?user_id=1`, { method: "DELETE" }).then(handleResponse),

  // Audit Logs
  getAuditLogs: (userId = 1) =>
    fetch(`${API_BASE}/audit-logs?user_id=${userId}`).then(handleResponse),
};
