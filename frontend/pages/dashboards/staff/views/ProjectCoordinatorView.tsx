
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
    const [newTask, setNewTask] = useState({ title: '', deadline: '', assigned_to: '', status: 'ready', description: '' });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');

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

    if (!mySie) return <div>No active division assignment found.</div>;

    const handleAddTask = () => {
        if (!newTask.title) return;

        client.post('/tasks', {
            program_id: currentProker.id,
            ...newTask
        }).then(res => {
            setTasks([...tasks, res.data]);
            setIsTaskModalOpen(false);
            setNewTask({ title: '', deadline: '', assigned_to: '', status: 'ready', description: '' });
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

    const handleUpdateTaskStatus = (updatedTask: any) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

        client.put(`/tasks/${updatedTask.id}`, { status: updatedTask.status }).then(res => {
            // Confirm update
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

    // Filter tasks for this Sie? 
    // Ideally, we should filter tasks that are relevant to this Sie.
    // Since tasks don't have a sie_id, we can filter by 'assigned_to' being in 'mySie.staff' OR created by this coordinator.
    // But for now, let's show ALL tasks for the program to ensure visibility, or maybe filter by those assigned to staff in this Sie.
    const sieTasks = tasks.filter(t => !t.assigned_to || mySie.staff.includes(t.assigned_to) || t.assigned_to === user.name);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Coordinator Dashboard: {mySie.name}</h2>
                    <p className="text-gray-500 text-sm">Project: {currentProker.title}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase">Pending Review</p>
                        <p className="text-2xl font-bold text-purple-600">{pendingReviewTasks.length}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center">
                        {mySie.staff.length} Staff Members
                    </span>
                </div>
            </div>

            {/* Review Section */}
            {pendingReviewTasks.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                    <h3 className="font-bold text-yellow-800 mb-4 flex items-center"><MessageSquare className="mr-2" size={20} /> Tasks Pending Review</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {pendingReviewTasks.map(task => (
                            <Card key={task.id} className="p-4 bg-white border border-yellow-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{task.title}</h4>
                                        <p className="text-sm text-gray-600">Submitted by: <strong>{task.assigned_to}</strong></p>
                                        {task.submission_link && (
                                            <a href={task.submission_link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-1 block">View Submission Link</a>
                                        )}
                                        {task.submission_file && (
                                            <a href={`http://localhost:8000/storage/${task.submission_file}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-1 block">View Submitted File</a>
                                        )}
                                    </div>
                                    <button onClick={() => { setSelectedTask(task); setShowReviewModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700">Review</button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Staff & Tupoksi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Users className="mr-2 text-purple-600" /> Division Staff</h3>
                    <div className="flex flex-wrap gap-3">
                        {mySie.staff && mySie.staff.length > 0 ? (
                            mySie.staff.map((staffName: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
                                        {staffName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{staffName}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">No staff assigned yet by Ketua Pelaksana.</p>
                        )}
                    </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-2">Tupoksi (Job Desc)</h3>
                    <p className="text-sm text-purple-700 leading-relaxed">
                        {mySie.tupoksi || "No job description set."}
                    </p>
                </div>
            </div>

            {/* Task Management */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Task Management</h3>
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center"
                    >
                        <Plus size={16} className="mr-2" /> Assign Task
                    </button>
                </div>

                {/* Kanban Board for this Sie */}
                <Kanban
                    tasks={sieTasks}
                    onUpdateTask={handleUpdateTaskStatus}
                    isEditable={true}
                    customColumns={[
                        { id: 'ready', title: 'Ready to Start', color: 'bg-gray-100 border-gray-200' },
                        { id: 'in_progress', title: 'On Progress', color: 'bg-blue-50 border-blue-200' },
                        { id: 'review_coordinator', title: 'Needs Review', color: 'bg-yellow-50 border-yellow-200' },
                        { id: 'review_ketupel', title: 'Sent to Leader', color: 'bg-purple-50 border-purple-200' },
                        { id: 'done', title: 'Completed', color: 'bg-green-50 border-green-200' }
                    ]}
                    allowMarkDone={false}
                />
            </div>

            {/* Task Creation Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text" className="w-full p-2 border rounded-lg"
                            value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-lg" rows={3}
                            value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
                            <select
                                className="w-full p-2 border rounded-lg bg-white"
                                value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                            >
                                <option value="">Select Staff</option>
                                {mySie.staff?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deadline</label>
                            <input
                                type="date" className="w-full p-2 border rounded-lg"
                                value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleAddTask} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700">Assign Task</button>
                    </div>
                </div>
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