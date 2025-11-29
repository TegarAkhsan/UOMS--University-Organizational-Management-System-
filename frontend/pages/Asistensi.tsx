import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  FileText,
  ChevronLeft,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Search
} from 'lucide-react';
import { Card, Badge, Modal } from '../components/ui/Shared';
import { DEPARTMENTS } from '../data/mockData';
import client from '../src/api/client';

export const Asistensi = () => {
  const [view, setView] = useState<'dashboard' | 'history' | 'detail' | 'revision'>('dashboard');
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [revisionNote, setRevisionNote] = useState('');

  // Task Review State
  const [reviewTasks, setReviewTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [selectedReviewTask, setSelectedReviewTask] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [kahimaRevisionNote, setKahimaRevisionNote] = useState('');

  // RAB Review State
  const [rabs, setRabs] = useState<any[]>([]);
  const [allRabs, setAllRabs] = useState<any[]>([]);
  const [selectedRab, setSelectedRab] = useState<any>(null);
  const [showRabModal, setShowRabModal] = useState(false);
  const [rabRevisionNote, setRabRevisionNote] = useState('');

  useEffect(() => {
    fetchReviewTasks();
    fetchRabs();
  }, []);

  const fetchReviewTasks = () => {
    client.get('/tasks')
      .then(res => {
        setAllTasks(res.data);
        // Filter for tasks waiting for Kahima review
        const pendingTasks = res.data.filter((t: any) => t.status === 'review_kahima' || t.status === 'pending_approval'); // Adjust based on actual status
        setReviewTasks(pendingTasks);
      })
      .catch(err => console.error("Failed to fetch review tasks:", err));
  };

  const fetchRabs = () => {
    client.get('/rabs')
      .then(res => {
        setAllRabs(res.data);
        // Filter for RABs waiting for Kahima review
        const pendingRabs = res.data.filter((r: any) => r.status === 'review_kahima');
        setRabs(pendingRabs);
      })
      .catch(err => console.error("Failed to fetch RABs:", err));
  };

  const handleRabReview = (status: 'approved' | 'revision') => {
    if (!selectedRab) return;

    const updateData: any = { status: status === 'approved' ? 'approved' : 'revision' };
    if (status === 'revision') {
      updateData.revision_note = rabRevisionNote;
    }

    client.put(`/rabs/${selectedRab.id}`, updateData).then(res => {
      fetchRabs(); // Refresh list
      setShowRabModal(false);
      setRabRevisionNote('');
      alert(`RAB ${status === 'approved' ? 'approved' : 'returned for revision'}!`);
    }).catch(err => {
      console.error("Failed to update RAB:", err);
      alert("Failed to update RAB status.");
    });
  };

  const handleKahimaReview = (status: 'approved' | 'revision') => {
    if (!selectedReviewTask) return;

    const updateData: any = { status: status === 'approved' ? 'done' : 'revision' };
    if (status === 'revision') {
      updateData.revision_note = kahimaRevisionNote;
    }

    client.put(`/tasks/${selectedReviewTask.id}`, updateData).then(res => {
      fetchReviewTasks(); // Refresh list
      setShowReviewModal(false);
      setKahimaRevisionNote('');
      alert(`Task ${status === 'approved' ? 'approved and completed' : 'returned for revision'}!`);
    }).catch(err => {
      console.error("Failed to update task:", err);
      alert("Failed to update task status.");
    });
  };

  // Calculate Stats
  const totalTasks = allTasks.length;
  const approvedTasks = allTasks.filter(t => t.status === 'done' || t.status === 'approved').length;
  const revisionTasks = allTasks.filter(t => t.status === 'revision').length;
  const pendingTasks = allTasks.filter(t => t.status === 'review_kahima' || t.status === 'pending_approval').length;

  const completionRate = totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0;

  // History View
  if (view === 'history') {
    const historyItems = selectedDept
      ? allTasks.filter(t => t.department_id === selectedDept.id || (t.program && t.program.department_id === selectedDept.id))
      : allTasks;

    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setView('dashboard')}
          className="text-gray-500 hover:text-gray-900 flex items-center mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Asistensi History: {selectedDept?.name || 'All Departments'}</h1>

        <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">No</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Task / Proker</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Assigned To</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.length > 0 ? historyItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-none">
                  <td className="py-4 px-6 text-gray-900">{idx + 1}</td>
                  <td className="py-4 px-6 text-gray-900 font-medium">{item.title}</td>
                  <td className="py-4 px-6 text-gray-600">{item.assigned_to}</td>
                  <td className="py-4 px-6">
                    <Badge status={item.status} />
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 italic">No history available for this department.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Asistensi Audit Dashboard</h1>

      {/* Task Review Section */}
      {reviewTasks.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-xl font-bold text-blue-900 flex items-center mb-4">
            <CheckCircle className="mr-2 text-blue-600" /> Tasks Pending Final Approval
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {reviewTasks.map(task => (
              <Card key={task.id} className="p-4 bg-white border border-blue-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">Assigned to: <strong>{task.assigned_to}</strong></p>
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    {task.submission_link && (
                      <a href={task.submission_link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-1 block">View Submission Link</a>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedReviewTask(task); setShowReviewModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                  >
                    Review
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* RAB Review Section */}
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-sm">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center mb-4">
          <CheckCircle className="mr-2 text-indigo-600" /> RABs Pending Final Approval
        </h3>
        {rabs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {rabs.map(rab => (
              <Card key={rab.id} className="p-4 bg-white border border-indigo-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">RAB: {rab.program?.title}</h4>
                    <p className="text-sm text-gray-600">Submitted by: <strong>{rab.program?.treasurer_name || 'Bendahara'}</strong></p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">Total Budget: Rp {parseFloat(rab.total_budget).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedRab(rab); setShowRabModal(true); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700"
                  >
                    Review RAB
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">No RABs pending approval.</p>
        )}
      </div>

      {/* Summary Table */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Asistensi Waiting Summary</h3>
        <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Department</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Pending Requests</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map((dept) => {
                const deptPending = allTasks.filter(t => (t.department_id === dept.id || (t.program && t.program.department_id === dept.id)) && (t.status === 'review_kahima' || t.status === 'pending_approval')).length;
                return (
                  <tr
                    key={dept.id}
                    className="border-b border-gray-50 last:border-none hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedDept(dept); setView('history'); }}
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium">{dept.fullName}</td>
                    <td className="py-4 px-6 text-blue-500 font-bold">{deptPending}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Overview Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Asistensi Overview</h3>
        <Card className="border border-gray-200 rounded-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Stats */}
            <div>
              <p className="text-gray-900 font-medium mb-2">Asistensi Completion Rate</p>
              <h2 className="text-5xl font-bold text-gray-900 mb-1">{completionRate}%</h2>
              <p className="text-blue-500 font-medium mb-8">Total Tasks: {totalTasks}</p>

              <div className="flex space-x-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-32 bg-gray-100 rounded-t-lg relative">
                    <div className="absolute bottom-0 w-full bg-green-500 rounded-t-lg" style={{ height: `${totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-green-600">Approved ({approvedTasks})</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-32 bg-gray-100 rounded-t-lg relative">
                    <div className="absolute bottom-0 w-full bg-red-500 rounded-t-lg" style={{ height: `${totalTasks > 0 ? (revisionTasks / totalTasks) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-red-600">Revision ({revisionTasks})</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-32 bg-gray-100 rounded-t-lg relative">
                    <div className="absolute bottom-0 w-full bg-yellow-500 rounded-t-lg" style={{ height: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">Pending ({pendingTasks})</span>
                </div>
              </div>
            </div>

            {/* Right: Timeline */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h4>
              <div className="space-y-8 relative pl-4">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                {allTasks.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 relative cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-white border-2 ${item.status === 'done' ? 'border-green-500' : 'border-gray-900'}`}>
                      <Check size={14} className={item.status === 'done' ? 'text-green-500' : 'text-gray-900'} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {item.title} ({item.status})
                      </p>
                      <p className="text-blue-500 text-sm">{new Date(item.updated_at || item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Task (Kahima)">
        <div className="space-y-4">
          <p>Reviewing task: <strong>{selectedReviewTask?.title}</strong></p>
          <div>
            <label className="block text-sm font-bold mb-1">Revision Note (if rejecting)</label>
            <textarea className="w-full p-2 border rounded-lg" rows={3} value={kahimaRevisionNote} onChange={e => setKahimaRevisionNote(e.target.value)} placeholder="Explain what needs to be fixed..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => handleKahimaReview('revision')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Request Revision</button>
            <button onClick={() => handleKahimaReview('approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Approve & Complete</button>
          </div>
        </div>
      </Modal>

      {/* RAB Review Modal */}
      <Modal isOpen={showRabModal} onClose={() => setShowRabModal(false)} title="Review RAB (Kahima)">
        <div className="space-y-4">
          <p>Reviewing RAB for: <strong>{selectedRab?.program?.title}</strong></p>
          <p className="text-sm text-gray-600">Total Budget: <strong>Rp {selectedRab && parseFloat(selectedRab.total_budget).toLocaleString()}</strong></p>

          {/* Simple Table Preview */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Item</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedRab?.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-right">{parseFloat(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Revision Note (if rejecting)</label>
            <textarea className="w-full p-2 border rounded-lg" rows={3} value={rabRevisionNote} onChange={e => setRabRevisionNote(e.target.value)} placeholder="Explain what needs to be fixed..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => handleRabReview('revision')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Request Revision</button>
            <button onClick={() => handleRabReview('approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Approve Final RAB</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
