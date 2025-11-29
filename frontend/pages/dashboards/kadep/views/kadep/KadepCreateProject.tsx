import React from 'react';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/DashboardHeader';

export const KadepCreateProject = ({
    user,
    onLogout,
    setView,
    handleCreateProject,
    newProker,
    setNewProker,
    myDept,
    deptMembers
}: any) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                        <p className="text-gray-500 text-sm">Fill in the details to create a new program kerja for {myDept?.fullName}.</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleCreateProject} className="space-y-6">
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

                        {/* Department (Read-Only) */}
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Department</label>
                            <input
                                type="text"
                                disabled
                                className="w-full p-4 bg-gray-100 rounded-xl border-none text-gray-500 font-bold cursor-not-allowed"
                                value={myDept?.fullName || ''}
                            />
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
                </div>
            </main>
        </div>
    );
};
