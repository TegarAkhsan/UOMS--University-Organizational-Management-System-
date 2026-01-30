import React, { useState } from 'react';
import { Users, Briefcase, Plus, RefreshCw, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Shared';
import { DEPARTMENTS, DEPARTMENT_TEXTS } from '../../../data/mockData';
import { DashboardHeader } from '../../../components/DashboardHeader';
import client from '../../../src/api/client';

// Import Refactored Views
import { KadepCreateProject } from './views/kadep/KadepCreateProject';
import { KadepAddStaff } from './views/kadep/KadepAddStaff';
import { KadepStaffDetail } from './views/kadep/KadepStaffDetail';
import { KadepProjectDetail } from './views/kadep/KadepProjectDetail';

export const KadepDashboard = ({
    user,
    onLogout,
    members,
    setMembers,
    prokers,
    setProkers,
    refreshData
}: any) => {
    const [view, setView] = useState<'dashboard' | 'addStaff' | 'createProject' | 'staffDetail' | 'projectDetail'>('dashboard');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Dynamically determine Department based on Logged In User
    const memberRecord = members.find((m: any) => String(m.id) === String(user.id));
    const myDeptCode = user.department_id || user.department?.code || user.dept || (memberRecord ? memberRecord.dept : 'PSDM');

    const myDept = DEPARTMENTS.find(d => d.id === myDeptCode) || DEPARTMENTS.find(d => d.id === 'PSDM');
    const myDeptTexts = DEPARTMENT_TEXTS[myDeptCode] || DEPARTMENT_TEXTS['PSDM'] || { fungsi: '', arahan: [] };

    const deptMembers = members.filter((m: any) => m.dept === myDeptCode || m.department_id === myDeptCode);
    const deptProkers = prokers.filter((p: any) => p.department === myDeptCode || p.department_id === myDeptCode);

    // Calculate Stats
    const activeProkersCount = deptProkers.filter((p: any) => p.status === 'On Progress' || p.status === 'Active').length;
    const completedProkersCount = deptProkers.filter((p: any) => p.status === 'Done').length;

    // State for Create/Edit
    const [newMember, setNewMember] = useState({ name: '', nim: '', role: 'Staff' });
    const [newProker, setNewProker] = useState({
        title: '', description: '', objectives: '', benefits: '', impact: '', leader: '', deadline: '', status: 'On Progress'
    });

    // -- HANDLERS --

    // -- HANDLERS --
    // Legacy handlers removed. Logic moved to child components or replaced below.


    // [NEW STATE] for Delete Project Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

    // [NEW STATE] for Delete Staff Modal
    const [showStaffDeleteModal, setShowStaffDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

    // [NEW STATE] for Success Notification (Toast/Modal substitute)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // [MODIFIED] Delete Project Handler
    const confirmDeleteProject = (id: number) => {
        setProjectToDelete(id);
        setShowDeleteModal(true);
    };

    const performDeleteProject = () => {
        if (projectToDelete) {
            client.delete(`/programs/${projectToDelete}`)
                .then(() => {
                    setProkers(prokers.filter((p: any) => p.id !== projectToDelete));
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                    setSuccessMessage('Project has been deleted successfully.');
                    setShowSuccessModal(true);
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to delete project.');
                    setShowDeleteModal(false);
                });
        }
    };

    // [MODIFIED] Delete Staff Handler
    const handleDeleteStaff = (id: number) => {
        setStaffToDelete(id);
        setShowStaffDeleteModal(true);
    };

    const performDeleteStaff = () => {
        if (staffToDelete) {
            client.delete(`/users/${staffToDelete}`)
                .then(() => {
                    setMembers(members.filter((m: any) => m.id !== staffToDelete));
                    setShowStaffDeleteModal(false);
                    setStaffToDelete(null);
                    setSuccessMessage('Staff member removed successfully.');
                    setShowSuccessModal(true);
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to delete staff member.');
                    setShowStaffDeleteModal(false);
                });
        }
    };

    const handleUpdateProject = (updatedProker: any) => {
        setProkers(prokers.map((p: any) => p.id === updatedProker.id ? updatedProker : p));
        setSelectedItem(updatedProker);
    };

    // -- VIEWS --

    if (view === 'staffDetail' && selectedItem) {
        return (
            <KadepStaffDetail
                user={user}
                onLogout={onLogout}
                setView={setView}
                selectedItem={selectedItem}
            />
        );
    }

    if (view === 'createProject') {
        return (
            <KadepCreateProject
                user={user}
                onLogout={onLogout}
                setView={setView}
                setProkers={setProkers} // [UPDATED] Pass setter
                newProker={newProker}
                setNewProker={setNewProker}
                myDept={myDept}
                deptMembers={deptMembers}
                allProkers={prokers}
            />
        );
    }

    if (view === 'addStaff') {
        return (
            <KadepAddStaff
                user={user}
                onLogout={onLogout}
                setView={setView}
                allMembers={members}
                setMembers={setMembers}
                myDeptCode={myDeptCode}
            />
        );
    }

    if (view === 'projectDetail' && selectedItem) {
        return (
            <KadepProjectDetail
                user={user}
                onLogout={onLogout}
                setView={setView}
                selectedItem={selectedItem}
                onUpdateProject={handleUpdateProject}
                members={members}
                myDeptCode={myDeptCode}
            />
        );
    }

    // DASHBOARD VIEW
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:pb-8">
            <div className="sticky top-0 z-50">
                <DashboardHeader user={user} onLogout={onLogout} />
            </div>

            {/* Success Modal (Generic) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="p-6 text-center">
                            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Success</h3>
                            <p className="text-gray-500 mt-2 text-sm">{successMessage}</p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Project Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-4 rounded-full mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
                            <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove this project? This action cannot be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performDeleteProject}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Staff Modal */}
            {showStaffDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-4 rounded-full mb-4">
                                <Users size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Staff?</h3>
                            <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove this member? This action cannot be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowStaffDeleteModal(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performDeleteStaff}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Yes, Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8 w-full">
                {/* ... (rest of the code remains same, just ensuring context is correct) ... */}


                {/* Department Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    {/* Simplified Header Layout */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                        <div className="space-y-4 max-w-2xl">
                            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                                ID: {myDept?.id}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                {myDept?.fullName || 'Department'}
                            </h1>

                            {/* Head of Dept */}
                            <div className="flex items-center gap-4 pt-2">
                                <img src={`https://ui-avatars.com/api/?name=${myDept?.head}&background=0D8ABC&color=fff`} alt={myDept?.head} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Head of Department</p>
                                    <p className="font-bold text-gray-900 text-lg">{myDept?.head}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats & Refresh */}
                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto min-w-[140px]">
                            {refreshData && (
                                <button onClick={refreshData} className="group flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl py-2 px-3 transition-all duration-200 shadow-sm text-xs font-bold uppercase tracking-wider">
                                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Refresh Data
                                </button>
                            )}

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active</p>
                                    <p className="text-2xl font-black text-gray-900">{activeProkersCount}</p>
                                </div>
                                <div className="bg-green-50/50 border border-green-100 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Done</p>
                                    <p className="text-2xl font-black text-gray-900">{completedProkersCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Function & Duties (Always visible on large screens, collapsible details) */}
                    <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Function & Duties</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {myDeptTexts.fungsi || 'No function description available.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Work Directions</h4>
                            <ul className="text-gray-600 text-sm space-y-2">
                                {myDeptTexts.arahan.length > 0 ? (
                                    myDeptTexts.arahan.map((arahan: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                            <span>{arahan}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="italic text-gray-400">No specific instructions available.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Project Management Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">Projects & Programs</h3>
                        <button onClick={() => setView('createProject')} className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 flex items-center justify-center transition-all transform hover:scale-[1.02]">
                            <Plus size={18} className="mr-2" /> Create or Assign Project
                        </button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {deptProkers.map((p: any) => (
                            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge status={p.status} />
                                        <h4 className="font-bold text-gray-900 text-lg mt-2 leading-tight">{p.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            Leader: <span className="font-medium text-gray-700">{p.leader_name || p.leader?.name || '-'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 border-t border-gray-50 pt-3 mt-1">
                                    <button
                                        onClick={() => { setSelectedItem(p); setView('projectDetail'); }}
                                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-2.5 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => confirmDeleteProject(p.id)}
                                        className="p-2.5 bg-white border border-gray-100 text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {deptProkers.length === 0 && (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p>No projects initiated yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">Project Name</th>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">Leader</th>
                                    <th className="text-right py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptProkers.map((p: any) => (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                                        <td className="py-5 px-8 font-bold text-gray-900">{p.title}</td>
                                        <td className="py-5 px-8"><Badge status={p.status} /></td>
                                        <td className="py-5 px-8 text-gray-600 text-sm font-medium">{p.leader_name || p.leader?.name || p.leader || '-'}</td>
                                        <td className="py-5 px-8 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedItem(p); setView('projectDetail'); }}
                                                className="text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteProject(p.id)}
                                                className="text-red-500 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 px-3 py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {deptProkers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-gray-400 italic">
                                            No projects found. Start by creating one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staff Management Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">Department Members</h3>
                        <button onClick={() => setView('addStaff')} className="w-full md:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center transition-colors">
                            <Plus size={18} className="mr-2" /> Add Staff
                        </button>
                    </div>

                    {deptMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {deptMembers.map((m: any) => (
                                <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-center gap-5 group" onClick={() => { setSelectedItem(m); setView('staffDetail'); }}>
                                    <img src={m.image} alt={m.name} className="w-14 h-14 rounded-full border-2 border-gray-50 group-hover:border-blue-100 transition-colors object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate text-base">{m.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">{m.role || 'Staff'}</p>
                                        <p className="text-xs text-gray-400 mt-1">{m.nim}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStaff(m.id); }}
                                            className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                            title="Delete Staff"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ArrowLeft size={18} className="text-gray-200 group-hover:text-blue-500 rotate-180 transition-colors hidden md:block" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Users size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Staff Members</h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                Your department roster is empty. Add new members to get started.
                            </p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};