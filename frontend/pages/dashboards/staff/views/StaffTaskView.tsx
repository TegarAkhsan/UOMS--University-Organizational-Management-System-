import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, Link as LinkIcon, Award, Star, Trophy, Target, Zap } from 'lucide-react';
import { Card, Badge, Modal } from '../../../../components/ui/Shared';
import { Kanban } from '../../../../components/Kanban';
import client from '../../../../src/api/client';

export const StaffTaskView = ({ user, members, prokers, onSelectProker, viewMode }: any) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submissionLink, setSubmissionLink] = useState('');
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [showBadgesModal, setShowBadgesModal] = useState(false);
    const [memberData, setMemberData] = useState<any>({ points: 0, point_history: [], violationHistory: [] });

    useEffect(() => {
        fetchTasks();
        fetchMemberData();
    }, []);

    const fetchTasks = () => {
        // Fetch tasks assigned to the user
        // In a real scenario, we might want to filter by user.name
        // But for now, let's just fetch all tasks and filter client-side or assume API handles it
        client.get('/tasks').then(res => {
            const myTasks = res.data.filter((t: any) => t.assigned_to === user.name);
            setTasks(myTasks);
        }).catch(err => console.error("Error fetching tasks:", err));
    };

    const fetchMemberData = () => {
        // In a real app, fetch points/badges. For now, mock or use props if available.
        // Assuming there's an endpoint or we filter from members
        const me = members.find((m: any) => m.name === user.name);
        if (me) {
            setMemberData(me);
        }
    };

    const handleUpdateTaskStatus = (updatedTask: any) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        client.put(`/tasks/${updatedTask.id}`, { status: updatedTask.status });
    };

    const handleSubmitTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;

        const formData = new FormData();
        if (submissionFile) formData.append('file', submissionFile);
        if (submissionLink) formData.append('link', submissionLink);
        formData.append('status', 'review_coordinator');

        client.post(`/tasks/${selectedTask.id}/submit`, formData).then(res => {
            setTasks(tasks.map(t => t.id === selectedTask.id ? res.data : t));
            setSelectedTask(null);
            setSubmissionFile(null);
            setSubmissionLink('');
            alert('Task submitted successfully!');
        }).catch(err => {
            console.error(err);
            alert('Failed to submit task.');
        });
    };

    const BADGES = [
        { id: 1, name: 'Task Master', description: 'Complete 10 tasks', minPoints: 100, icon: <Trophy className="text-yellow-500" /> },
        { id: 2, name: 'Speed Demon', description: 'Complete 5 tasks before deadline', minPoints: 200, icon: <Zap className="text-blue-500" /> },
        { id: 3, name: 'Reliable', description: 'No missed deadlines for a month', minPoints: 300, icon: <Star className="text-purple-500" /> },
    ];

    if (viewMode === 'proker') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prokers.map((proker: any) => (
                        <Card key={proker.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200" onClick={() => onSelectProker(proker)}>
                            <div className="flex justify-between items-start mb-4">
                                <Badge status={proker.status} />
                                <span className="text-xs text-gray-500">{proker.deadline}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{proker.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">{proker.description}</p>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${proker.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{proker.progress}%</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats / Points Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">My Points</p>
                            <h3 className="text-4xl font-bold">{memberData.points || 0}</h3>
                        </div>
                        <button onClick={() => setShowPointsModal(true)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                            <Clock size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-blue-100 mt-4">Keep up the good work!</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setShowBadgesModal(true)}>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Badges Earned</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {BADGES.filter(b => (memberData.points || 0) >= b.minPoints).length} / {BADGES.length}
                        </h3>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <Award className="text-yellow-600" size={24} />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Active Tasks</p>
                        <h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status !== 'done').length}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                        <Target className="text-green-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <Kanban
                tasks={tasks}
                onUpdateTask={handleUpdateTaskStatus}
                isEditable={true}
                allowMarkDone={true}
                onTaskClick={setSelectedTask}
            />

            {/* Task Detail / Submission Modal */}
            <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Detail">
                {selectedTask && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge status={selectedTask.status} />
                                <span className="text-sm text-gray-500">Due: {selectedTask.deadline}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">{selectedTask.description || 'No description provided.'}</p>
                        </div>

                        {selectedTask.revision_note && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-800 mb-1">Revision Note</h4>
                                <p className="text-red-700 text-sm">{selectedTask.revision_note}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Submission</h4>
                            <form onSubmit={handleSubmitTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Evidence File</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group relative">
                                        <Upload className="mx-auto text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                        <p className="text-sm text-gray-500">{submissionFile ? submissionFile.name : 'Upload screenshot or document'}</p>
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setSubmissionFile(e.target.files ? e.target.files[0] : null)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Or Link</label>
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 p-2 border-r"><LinkIcon size={16} className="text-gray-500" /></div>
                                        <input type="text" className="w-full p-2 outline-none" placeholder="https://..." value={submissionLink} onChange={e => setSubmissionLink(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
                                        <CheckCircle size={16} /> Submit Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Points History Modal */}
            <Modal isOpen={showPointsModal} onClose={() => setShowPointsModal(false)} title="Points History">
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <p className="text-gray-600 font-bold">Total Points Earned</p>
                        <p className="text-4xl font-extrabold text-blue-600">{memberData.points}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-800">Earned</h4>
                        {memberData.point_history && memberData.point_history.length > 0 ? (
                            memberData.point_history.map((h: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 border-b border-gray-100">
                                    <div><p className="font-bold text-gray-800">{h.reason}</p><p className="text-xs text-gray-500">{h.date}</p></div>
                                    <span className="text-green-600 font-bold">+{h.amount}</span>
                                </div>
                            ))
                        ) : memberData.points > 0 ? (
                            <div className="flex justify-between items-center p-3 border-b border-gray-100">
                                <div><p className="font-bold text-gray-800">Initial Points</p><p className="text-xs text-gray-500">-</p></div>
                                <span className="text-green-600 font-bold">+{memberData.points}</span>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 italic py-4">No points history.</p>
                        )}
                    </div>
                    {memberData.violationHistory && memberData.violationHistory.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-red-800">Violation History (Recorded)</h4>
                            {memberData.violationHistory.map((h: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 border-b border-red-100 bg-red-50 rounded">
                                    <div><p className="font-bold text-gray-800">{h.reason}</p><p className="text-xs text-gray-500">{h.date}</p></div>
                                    <span className="text-red-600 font-bold">+{h.deduction} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Badges Modal */}
            <Modal isOpen={showBadgesModal} onClose={() => setShowBadgesModal(false)} title="Badges">
                <div className="grid grid-cols-1 gap-4">
                    {BADGES.map(badge => {
                        const isEarned = (memberData.points || 0) >= badge.minPoints;
                        return (
                            <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isEarned ? 'bg-white border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                <div className="text-4xl">{badge.icon}</div>
                                <div className="flex-1"><h4 className="font-bold text-gray-900">{badge.name}</h4><p className="text-sm text-gray-600">{badge.description}</p></div>
                                {isEarned ? <Badge status="Earned" /> : <span className="text-xs font-bold text-gray-400">{badge.minPoints} pts needed</span>}
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </div>
    );
};