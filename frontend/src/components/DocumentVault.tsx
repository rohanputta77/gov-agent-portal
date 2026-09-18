import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function DocumentVault() {
    const [documents, setDocuments] = useState<any[]>([]);
    
    const loadDocs = () => {
        api.getDocuments().then(setDocuments);
    };

    useEffect(() => {
        loadDocs();
    }, []);
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Document Vault</h2>
                <button className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Upload Document
                </button>
            </div>
            
            {documents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500 text-sm">No documents found. Ask the agent to start a workflow.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {documents.map((doc, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                            <div>
                                <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md mb-3 border border-indigo-100">{doc.doc_type}</span>
                                <h4 className="font-semibold text-gray-900 truncate" title={doc.name}>{doc.name}</h4>
                                <div className="mt-4 flex justify-between items-center">
                                    <p className="text-xs text-gray-500">Added: {new Date(doc.upload_date).toLocaleDateString()}</p>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{doc.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
