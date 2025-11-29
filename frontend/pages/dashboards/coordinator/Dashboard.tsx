import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../../../components/DashboardHeader';
import { Card, Badge, Modal } from '../../../components/ui/Shared';
import { Check, X, Clock, FileText, User, Plus, Upload, MessageSquare, ArrowRight } from 'lucide-react';
import client from '../../../src/api/client';

export const CoordinatorDashboard = ({ user, onLogout }: any) => {
    const [programs, setPrograms] = useState<any[]>([]);
    const [mySie, setMySie] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [view, setView] = useState<'overview' | 'manage' | 'review'>('overview');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assigned_to: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = () => {
        client.get('/programs').then(res => {
            // Filter programs where user is coordinator
            const allPrograms = res.data;
            // Find the program and sie where this user is coordinator
            // Assuming user can be coordinator of multiple, but for simplicity taking the first one found or listing all
            // For this dashboard, let's list all, but focus on the active one
            const myPrograms = allPrograms.filter((p: any) =>
                p.sies && p.sies.some((s: any) => s.coordinator === user.name)
            );
            setPrograms(myPrograms);

            // For now, just pick the first one to show tasks
            if (myPrograms.length > 0) {
                const program = myPrograms[0];
                const sie = program.sies.find((s: any) => s.coordinator === user.name);
                setMySie({ ...sie, programId: program.id, programTitle: program.title });
                fetchTasks(program.id);
            }
        });
    };

    const fetchTasks = (programId: any) => {
        client.get(`/tasks?program_id=${programId}`).then(res => {
            setTasks(res.data);
        });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mySie) return;

        client.post('/tasks', {
            program_id: mySie.programId,
            ...newTask,
            status: 'ready' // Initial status
        }).then(res => {
            setTasks([...tasks, res.data]);
            setShowCreateModal(false);
            setNewTask({ title: '', description: '', deadline: '', assigned_to: '' });
            alert('Task created successfully!');
        });
    };

    const handleReview = (status: 'approved' | 'revision') => {
        if (!selectedTask) return;

        const updateData: any = { status: status === 'approved' ? 'review_ketupel' : 'in_progress' }; // If revision, send back to in_progress
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

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
                        <p className="text-gray-500">Manage your division tasks and staff.</p>
                    </div>
                    {mySie && (
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold">
                            {mySie.name} - {mySie.programTitle}
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-l-4 border-blue-500">
                        <h3 className="text-gray-500 font-bold text-sm uppercase">Total Tasks</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
                    </Card>
                    <Card className="p-6 border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 font-bold text-sm uppercase">Pending Review</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{pendingReviewTasks.length}</p>
                    </Card>
                    <Card className="p-6 border-l-4 border-green-500">
                        <h3 className="text-gray-500 font-bold text-sm uppercase">Staff Members</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{mySie?.staff?.length || 0}</p>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200">
                    <button onClick={() => setView('overview')} className={`pb-2 px-4 font-bold ${view === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Overview</button>
                    <button onClick={() => setView('manage')} className={`pb-2 px-4 font-bold ${view === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Manage Tasks</button>
                    <button onClick={() => setView('review')} className={`pb-2 px-4 font-bold ${view === 'review' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Review ({pendingReviewTasks.length})</button>
                </div>

                {/* Content */}
                {view === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                            <ul className="space-y-3">
                                {tasks.slice(0, 5).map(t => (
                                    <li key={t.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span>{t.title}</span>
                                        <Badge status={t.status} />
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4">Staff Performance</h3>
                            <ul className="space-y-3">
                                {mySie?.staff?.map((s: string, i: number) => (
                                    <li key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{s.charAt(0)}</div>
                                            <span>{s}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{tasks.filter(t => t.assigned_to === s && t.status === 'done').length} Tasks Done</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                )}

                {view === 'manage' && (
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-xl">Task Management</h3>
                            <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
                                <Plus size={18} /> Create Task
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {tasks.map(task => (
                                <Card key={task.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="font-bold text-lg">{task.title}</h4>
                                        <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1"><User size={14} /> {task.assigned_to || 'Unassigned'}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {task.deadline || 'No deadline'}</span>
                                        </div>
                                    </div>
                                    <Badge status={task.status} />
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'review' && (
                    <div className="space-y-6">
                        <h3 className="font-bold text-xl">Tasks Pending Review</h3>
                        {pendingReviewTasks.length === 0 ? (
                            <p className="text-gray-500 italic">No tasks pending review.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingReviewTasks.map(task => (
                                    <Card key={task.id} className="p-6 border border-yellow-200 bg-yellow-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{task.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">Submitted by: <strong>{task.assigned_to}</strong></p>
                                                {task.submission_link && (
                                                    <a href={task.submission_link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-2 block">View Submission Link</a>
                                                )}
                                                {task.submission_file && (
                                                    <a href={`http://localhost:8000/storage/${task.submission_file}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-2 block">View Submitted File</a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setSelectedTask(task); setShowReviewModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Review</button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Task Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Title</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea className="w-full p-2 border rounded-lg" rows={3} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Deadline</label>
                        <input type="date" className="w-full p-2 border rounded-lg" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Assign To</label>
                        <select className="w-full p-2 border rounded-lg" value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}>
                            <option value="">Select Staff</option>
                            {mySie?.staff?.map((s: string, i: number) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Create Task</button>
                    </div>
                </form>
            </Modal>

            {/* Review Modal */}
            <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Task">
                <div className="space-y-4">
                    <p>Reviewing task: <strong>{selectedTask?.title}</strong></p>
                    <div>
                        <label className="block text-sm font-bold mb-1">Revision Note (if rejecting)</label>
                        <textarea className="w-full p-2 border rounded-lg" rows={3} value={revisionNote} onChange={e => setRevisionNote(e.target.value)} placeholder="Explain what needs to be fixed..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => handleReview('revision')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Request Revision</button>
                        <button onClick={() => handleReview('approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Approve</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
