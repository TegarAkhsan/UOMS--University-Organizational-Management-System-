
import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, CheckCircle, Clock, Check, X, Upload, MessageSquare, ArrowRight, User } from 'lucide-react';
import { Card, Badge, Modal } from '../../../../components/ui/Shared';
import { Kanban } from '../../../../components/Kanban';
import client from '../../../../src/api/client';

export const ProjectCoordinatorView = ({ currentProker, user, setProkers, prokers }: any) => {
    // Find the specific Sie (Division) this user coordinates
    const mySieIndex = currentProker.sies?.findIndex((s: any) => s.coordinator === user.name);
    const mySie = currentProker.sies?.[mySieIndex];

    const [tasks, setTasks] = useState<any[]>([]);
    const [newTask, setNewTask] = useState({ title: '', deadline: '', assigned_to: '', status: 'ready', description: '', file: null as File | null });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [taskToAssign, setTaskToAssign] = useState<any>(null);
    const [assignTo, setAssignTo] = useState('');

    useEffect(() => {
        if (currentProker?.id) {
            fetchTasks(currentProker.id);
        }
    }, [currentProker]);

    const fetchTasks = (programId: any) => {
        client.get(`/tasks?program_id=${programId}`).then(res => {
            setTasks(res.data);
        });
    };

    if (!mySie) return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium">No active division assignment found.</p>
        </div>
    );

    const handleAddTask = () => {
        if (!newTask.title) return;

        const formData = new FormData();
        formData.append('program_id', currentProker.id.toString());
        formData.append('title', newTask.title);
        formData.append('deadline', newTask.deadline);
        formData.append('assigned_to', newTask.assigned_to);
        formData.append('status', 'ready');
        formData.append('description', newTask.description);
        if (newTask.file) {
            formData.append('attachment_file', newTask.file);
        }

        client.post('/tasks', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            setTasks([...tasks, res.data]);
            setIsTaskModalOpen(false);
            setNewTask({ title: '', deadline: '', assigned_to: '', status: 'ready', description: '', file: null });
            alert('Task created successfully!');
        }).catch(err => {
            console.error('Task creation failed:', err);
            if (err.response && err.response.data) {
                console.error('Error details:', err.response.data);
                alert(`Failed to create task: ${JSON.stringify(err.response.data)}`);
            } else {
                alert('Failed to create task. See console for details.');
            }
        });
    };

    const handleAssignTask = () => {
        if (!taskToAssign || !assignTo) return;

        client.put(`/tasks/${taskToAssign.id}`, { assigned_to: assignTo }).then(res => {
            setTasks(tasks.map(t => t.id === taskToAssign.id ? res.data : t));
            setShowAssignModal(false);
            setTaskToAssign(null);
            setAssignTo('');
            alert('Task assigned successfully!');
        });
    };

    const handleUpdateTaskStatus = (updatedTask: any) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

        client.put(`/tasks/${updatedTask.id}`, { status: updatedTask.status }).then(res => {
            setTasks(tasks.map(t => t.id === updatedTask.id ? res.data : t));
        });
    };

    const handleReview = (status: 'approved' | 'revision') => {
        if (!selectedTask) return;

        const updateData: any = { status: status === 'approved' ? 'review_ketupel' : 'in_progress' };
        if (status === 'revision') {
            updateData.revision_note = revisionNote;
        }

        client.put(`/tasks/${selectedTask.id}`, updateData).then(res => {
            setTasks(tasks.map(t => t.id === selectedTask.id ? res.data : t));
            setShowReviewModal(false);
            setRevisionNote('');
            alert(`Task ${status === 'approved' ? 'approved' : 'returned for revision'}!`);
        });
    };

    const pendingReviewTasks = tasks.filter(t => t.status === 'review_coordinator');
    // Show ALL tasks for this program - Ketupel can assign to anyone
    // Filter by: assigned to staff in this sie, assigned to coordinator, or unassigned
    const sieTasks = tasks.filter(t => {
        // Unassigned tasks should show
        if (!t.assigned_to) return true;
        // Tasks assigned to staff in this sie
        if (mySie.staff && mySie.staff.includes(t.assigned_to)) return true;
        // Tasks assigned to the coordinator themselves
        if (t.assigned_to === user.name) return true;
        return false;
    });

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Header - Stacked on mobile */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Coordinator: {mySie.name}</h2>
                        <p className="text-gray-500 text-sm">{currentProker.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                            <Users size={16} />
                            <span>{mySie.staff?.length || 0} Staff</span>
                        </div>
                        {pendingReviewTasks.length > 0 && (
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                <MessageSquare size={16} />
                                <span>{pendingReviewTasks.length} Review</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Section - Compact cards on mobile */}
            {pendingReviewTasks.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 md:p-4 rounded-xl">
                    <h3 className="font-bold text-yellow-800 mb-3 text-sm flex items-center">
                        <MessageSquare className="mr-2" size={18} /> Pending Review
                    </h3>
                    <div className="space-y-3">
                        {pendingReviewTasks.map(task => (
                            <div key={task.id} className="bg-white p-3 rounded-lg border border-yellow-100">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{task.title}</h4>
                                        <p className="text-xs text-gray-600">By: <strong>{task.assigned_to}</strong></p>
                                        {task.submission_link && (
                                            <a href={task.submission_link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">View Link</a>
                                        )}
                                        {task.submission_file && (
                                            <a href={`http://localhost:8000/storage/${task.submission_file}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs ml-2">View File</a>
                                        )}
                                    </div>
                                    <button onClick={() => { setSelectedTask(task); setShowReviewModal(true); }} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-purple-700 w-full md:w-auto">
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Staff & Tupoksi - Stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
                        <Users className="mr-2 text-purple-600" size={18} /> Division Staff
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {mySie.staff && mySie.staff.length > 0 ? (
                            mySie.staff.map((staffName: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
                                        {staffName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{staffName}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic text-sm">No staff assigned yet.</p>
                        )}
                    </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-2 text-sm">Tupoksi</h3>
                    <p className="text-sm text-purple-700 leading-relaxed">
                        {mySie.tupoksi || "No job description set."}
                    </p>
                </div>
            </div>

            {/* Task Management */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Task Management</h3>
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center w-full md:w-auto justify-center"
                    >
                        <Plus size={16} className="mr-2" /> Assign Task
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                    <Kanban
                        tasks={sieTasks}
                        onUpdateTask={handleUpdateTaskStatus}
                        isEditable={true}
                        customColumns={[
                            { id: 'ready', title: 'Ready', color: 'bg-gray-100 border-gray-200' },
                            { id: 'in_progress', title: 'On Progress', color: 'bg-blue-50 border-blue-200' },
                            { id: 'review_coordinator', title: 'Review', color: 'bg-yellow-50 border-yellow-200' },
                            { id: 'review_ketupel', title: 'Sent to Leader', color: 'bg-purple-50 border-purple-200' },
                            { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' }
                        ]}
                        allowMarkDone={false}
                        onAssignClick={(task) => { setTaskToAssign(task); setShowAssignModal(true); }}
                    />
                </div>
            </div>

            {/* Task Creation Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text" className="w-full p-2 border rounded-lg text-sm"
                            value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            placeholder="Enter task title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-lg text-sm" rows={3}
                            value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="Describe the task"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
                            <select
                                className="w-full p-2 border rounded-lg bg-white text-sm"
                                value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                            >
                                <option value="">Select Staff</option>
                                {mySie.staff?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deadline</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg text-sm appearance-none"
                                value={newTask.deadline}
                                onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                style={{ WebkitAppearance: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Attachment (optional)</label>
                        <input
                            type="file" className="w-full p-2 border rounded-lg text-sm"
                            onChange={e => setNewTask({ ...newTask, file: e.target.files?.[0] || null })}
                        />
                        {newTask.file && <p className="text-xs text-green-600 mt-1">File: {newTask.file.name}</p>}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleAddTask} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 w-full md:w-auto">
                            Assign Task
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Review Modal */}
            <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Task">
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Task:</strong> {selectedTask?.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{selectedTask?.description}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Revision Note (if rejecting)</label>
                        <textarea className="w-full p-2 border rounded-lg text-sm" rows={3} value={revisionNote} onChange={e => setRevisionNote(e.target.value)} placeholder="Explain what needs to be fixed..." />
                    </div>
                    <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
                        <button onClick={() => handleReview('revision')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 w-full md:w-auto">
                            Request Revision
                        </button>
                        <button onClick={() => handleReview('approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 w-full md:w-auto">
                            Approve
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign Task Modal for unassigned tasks */}
            <Modal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setTaskToAssign(null); setAssignTo(''); }} title="Assign Task to Staff">
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Task:</strong> {taskToAssign?.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{taskToAssign?.description}</p>
                        {taskToAssign?.deadline && <p className="text-xs text-gray-500 mt-1">Deadline: {taskToAssign?.deadline}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-white text-sm"
                            value={assignTo} onChange={e => setAssignTo(e.target.value)}
                        >
                            <option value="">Select Staff</option>
                            {mySie.staff?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleAssignTask}
                            disabled={!assignTo}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};