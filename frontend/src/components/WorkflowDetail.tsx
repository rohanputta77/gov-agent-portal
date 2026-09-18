export function WorkflowDetail({ workflow, onBack }: { workflow: any, onBack: () => void }) {
    if (!workflow) return null;
    
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center transition-colors">
                ← Back to Dashboard
            </button>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{workflow.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">Status: Active</p>
                    </div>
                    <div className="w-48 text-right">
                        <div className="text-sm font-medium text-gray-900 mb-1">{workflow.progress.toFixed(0)}% Complete</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${workflow.progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Workflow Requirements</h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-gray-500 text-sm italic">
                        This workflow is being tracked. Return to the dashboard to let the AI process more documents or actions.
                    </div>
                </div>
            </div>
        </div>
    );
}
