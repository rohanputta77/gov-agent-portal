import { useState, useEffect } from "react";
import { api } from "../services/api";

const DOC_TYPES = [
  "Passport", "Passport Photo", "Bank Statement", "Travel Insurance",
  "Accommodation Proof", "Employment Proof", "Flight Itinerary",
  "Cover Letter", "Identity Proof", "Address Proof", "Salary Slips",
  "Salary Slip", "PAN Card", "Aadhaar Card", "Property Documents", "Other"
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadDocs = () => api.getDocuments(1).then(setDocuments).catch(console.error);

  useEffect(() => { loadDocs(); }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await api.uploadDocument(file, docType);
      setShowModal(false);
      setFile(null);
      loadDocs();
    } catch (e: any) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await api.deleteDocument(id);
    loadDocs();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
          <p className="text-slate-500 mt-1">All your documents, securely managed in one place.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          + Upload Document
        </button>
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-amber-800 text-xs flex items-start gap-2">
        <span className="text-sm mt-0.5">⚠</span>
        <span>
          <strong>Prototype Notice:</strong> Documents are stored locally for demonstration purposes.
          In production, all files would be encrypted at rest with AES-256 and served over TLS.
        </span>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <p className="text-slate-400 mb-3">No documents uploaded yet.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            + Upload your first document
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition group">
              {/* Type badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold px-2.5 py-1 rounded-full">
                  {doc.doc_type}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  doc.status === "Valid" ? "bg-emerald-50 text-emerald-700" :
                  doc.status === "Expired" ? "bg-red-50 text-red-700" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {doc.status}
                </span>
              </div>

              {/* File icon */}
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-2xl mb-3">
                📄
              </div>

              <h4 className="text-sm font-semibold text-slate-900 truncate" title={doc.name}>
                {doc.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Added {new Date(doc.upload_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {doc.expiry_date && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Expires {new Date(doc.expiry_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}

              {/* Delete */}
              <button
                onClick={() => handleDelete(doc.id)}
                className="mt-4 text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Upload Document</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 10MB</p>
              </div>

              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setUploadError(null); }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
