import React, { useState } from 'react';
import { ArrowLeft, Plus, ChevronDown, Link, Check, X } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/DashboardHeader';
import client from '../../../../../src/api/client';

export const KadepCreateProject = ({
    user,
    onLogout,
    setView,
    setProkers, // [NEW] Expect this prop to update parent state
    newProker,
    setNewProker,
    myDept,
    deptMembers,
    allProkers = []
}: any) => {
    const [mode, setMode] = useState<'create' | 'assign'>('create');
    const [selectedExistingId, setSelectedExistingId] = useState('');
    const [assignLeader, setAssignLeader] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Project created successfully.');

    // Filter for unassigned projects
    const unassignedProkers = allProkers.filter((p: any) => !p.department_id && !p.department);

    const handleInternalCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...newProker,
            department_id: myDept?.id || user.dept,
            leader_name: newProker.leader // Ensure leader name is explicitly sent if needed
        };

        try {
            const res = await client.post('/programs', payload);

            // Update parent state if function exists
            if (setProkers) {
                setProkers((prev: any) => [...prev, res.data]);
            }

            // Show Success Modal
            setSuccessMessage('Project created successfully.');
            setShowSuccessModal(true);

            // Reset form
            setNewProker({ title: '', description: '', objectives: '', benefits: '', impact: '', leader: '', deadline: '' });

        } catch (err) {
            console.error(err);
            alert('Failed to create project. Please check your inputs.');
        }
    };

    const handleAssignProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExistingId) return;

        const payload = {
            department_id: myDept?.id || user.dept,
            department: myDept?.id || user.dept,
            leader_name: assignLeader,
        };

        client.put(`/programs/${selectedExistingId}`, payload)
            .then(res => {
                setSuccessMessage('Project assigned to your department successfully!');
                setShowSuccessModal(true);
            })
            .catch(err => {
                console.error(err);
                alert('Failed to assign project.');
            });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        if (mode === 'assign') {
            window.location.reload(); // Reload for assignment to simplify state sync
        } else {
            setView('dashboard'); // Return to dashboard for creation
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <DashboardHeader user={user} onLogout={onLogout} />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                <Check size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Success!</h3>
                            <p className="text-green-100 mt-2 text-sm">{successMessage}</p>
                        </div>
                        <div className="p-6">
                            <button
                                onClick={handleCloseModal}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="px-4 md:px-8 pb-8 max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
                        <p className="text-gray-500 text-sm">Create new or assign existing programs to {myDept?.fullName}.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mode === 'create'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Create New Project
                    </button>
                    <button
                        onClick={() => setMode('assign')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mode === 'assign'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Assign from Existing
                    </button>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    {mode === 'create' ? (
                        <form onSubmit={handleInternalCreate} className="space-y-6">
                            {/* Nama Proker */}
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Nama Proker (Project Name)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter project name"
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                    value={newProker.title}
                                    onChange={e => setNewProker({ ...newProker, title: e.target.value })}
                                />
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Deskripsi Proker (Project Description)</label>
                                <textarea
                                    rows={5}
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                                    value={newProker.description}
                                    onChange={e => setNewProker({ ...newProker, description: e.target.value })}
                                />
                            </div>

                            {/* Tujuan */}
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Tujuan Proker (Project Objectives)</label>
                                <textarea
                                    rows={4}
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                                    value={newProker.objectives}
                                    onChange={e => setNewProker({ ...newProker, objectives: e.target.value })}
                                />
                            </div>

                            {/* Manfaat */}
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Manfaat Proker (Project Benefits)</label>
                                <textarea
                                    rows={4}
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                                    value={newProker.benefits}
                                    onChange={e => setNewProker({ ...newProker, benefits: e.target.value })}
                                />
                            </div>

                            {/* Dampak */}
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Dampak/Output yang dituju (Expected Impact/Output)</label>
                                <textarea
                                    rows={4}
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                                    value={newProker.impact}
                                    onChange={e => setNewProker({ ...newProker, impact: e.target.value })}
                                />
                            </div>

                            {/* Leader & Deadline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="block text-base font-bold text-gray-900">Ketua Pelaksana (Project Leader)</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                            value={newProker.leader}
                                            onChange={e => setNewProker({ ...newProker, leader: e.target.value })}
                                            style={{ zIndex: 10, position: 'relative' }}
                                        >
                                            <option value="">Select project leader</option>
                                            {deptMembers.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <ChevronDown className="text-gray-500" size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-base font-bold text-gray-900">Waktu Pelaksanaan</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        value={newProker.deadline}
                                        onChange={e => setNewProker({ ...newProker, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setView('dashboard')}
                                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors flex items-center">
                                    <Plus size={18} className="mr-2" />
                                    Create Project
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAssignProject} className="space-y-6">
                            {/* Assign Existing Form */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm mb-4">
                                <strong>Info:</strong> These are projects created by Admin/Kahima that have not been assigned to any department yet.
                            </div>

                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Select Unassigned Project</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                        value={selectedExistingId}
                                        onChange={e => setSelectedExistingId(e.target.value)}
                                    >
                                        <option value="">-- Choose a Project --</option>
                                        {unassignedProkers.length > 0 ? (
                                            unassignedProkers.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))
                                        ) : (
                                            <option disabled>No unassigned projects found.</option>
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <ChevronDown className="text-gray-500" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-900">Assign Project Leader</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                        value={assignLeader}
                                        onChange={e => setAssignLeader(e.target.value)}
                                        style={{ zIndex: 10, position: 'relative' }}
                                    >
                                        <option value="">Select Member</option>
                                        {deptMembers.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <ChevronDown className="text-gray-500" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setView('dashboard')}
                                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md transition-colors flex items-center">
                                    <Link size={18} className="mr-2" />
                                    Assign Project
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};
