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

    const handleAddMember = (e: any) => {
        e.preventDefault();
        const payload = {
            ...newMember,
            department_id: myDeptCode,
            dept: myDeptCode, // Legacy support
            email: `${newMember.name.toLowerCase().replace(/\s+/g, '.')}@himaforticunesa.com`, // Auto-generate email
            password: 'staffhimafortic', // Default password
            points: 0,
            violations: 0,
            status: 'staff' // Default status
        };

        client.post('/users', payload)
            .then(res => {
                // Manually inject 'dept' for frontend compatibility since backend might not return it immediately
                const newStaff = { ...res.data, dept: myDeptCode };
                setMembers([...members, newStaff]);
                setView('dashboard');
                setNewMember({ name: '', nim: '', role: 'Staff' });
                alert('Staff added successfully!');
            })
            .catch(err => {
                console.error(err);
                alert('Failed to add staff. Please try again.');
            });
    };

    const handleCreateProject = (e: any) => {
        e.preventDefault();
        const payload = {
            ...newProker,
            leader_name: newProker.leader, // Map leader to leader_name for backend
            department_id: myDeptCode, // Correct field for backend
            department: myDeptCode,    // Legacy support
            progress: 0
        };

        client.post('/programs', payload)
            .then(res => {
                // Manually inject department for immediate display
                const newProject = { ...res.data, department: myDeptCode, department_id: myDeptCode };
                setProkers([...prokers, newProject]);
                setView('dashboard');
                setNewProker({ title: '', description: '', objectives: '', benefits: '', impact: '', leader: '', deadline: '', status: 'On Progress' });
                alert('Project created successfully!');
            })
            .catch(err => {
                console.error(err);
                alert('Failed to create project. Please try again.');
            });
    };

    const handleDeleteStaff = (id: number) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            client.delete(`/users/${id}`)
                .then(() => {
                    setMembers(members.filter((m: any) => m.id !== id));
                    alert('Staff deleted successfully');
                })
                .catch(err => console.error(err));
        }
    };

    const handleDeleteProject = (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            client.delete(`/programs/${id}`)
                .then(() => {
                    setProkers(prokers.filter((p: any) => p.id !== id));
                    alert('Project deleted successfully');
                })
                .catch(err => console.error(err));
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
                handleCreateProject={handleCreateProject}
                newProker={newProker}
                setNewProker={setNewProker}
                myDept={myDept}
                deptMembers={deptMembers}
            />
        );
    }

    if (view === 'addStaff') {
        return (
            <KadepAddStaff
                user={user}
                onLogout={onLogout}
                setView={setView}
                handleAddMember={handleAddMember}
                newMember={newMember}
                setNewMember={setNewMember}
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
                members={deptMembers}
            />
        );
    }

    // DASHBOARD VIEW
    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-7xl mx-auto space-y-10">

                {/* Department Header Card */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-blue-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Briefcase size={150} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{myDept?.fullName || 'Department'}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">ID: {myDept?.id}</span>
                                <span className="flex items-center gap-1"><Users size={16} /> {deptMembers.length} Members</span>
                                <span className="flex items-center gap-1"><Briefcase size={16} /> {deptProkers.length} Projects</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {refreshData && (
                                <button onClick={refreshData} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-xl flex flex-col items-center justify-center min-w-[80px] transition-colors">
                                    <RefreshCw size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Refresh</span>
                                </button>
                            )}
                            <div className="bg-blue-50 p-4 rounded-xl text-center min-w-[120px]">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Active Prokers</p>
                                <p className="text-3xl font-bold text-blue-800">{activeProkersCount}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl text-center min-w-[120px]">
                                <p className="text-xs font-bold text-green-600 uppercase mb-1">Completed</p>
                                <p className="text-3xl font-bold text-green-800">{completedProkersCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center"><Users size={12} className="mr-1" /> Head of Department</p>
                            <p className="font-bold text-gray-900">{myDept?.head}</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center"><AlertCircle size={12} className="mr-1" /> Function</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{myDeptTexts.fungsi || 'No description available.'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center"><RefreshCw size={12} className="mr-1" /> Work Directions (Arahan Kerja)</p>
                                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                                    {myDeptTexts.arahan.length > 0 ? (
                                        myDeptTexts.arahan.map((arahan: string, idx: number) => (
                                            <li key={idx}>{arahan}</li>
                                        ))
                                    ) : (
                                        <li>No specific instructions available.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Management Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center"><Briefcase className="mr-2 text-blue-600" /> Project Management</h3>
                        <button onClick={() => setView('createProject')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md flex items-center transition-colors">
                            <Plus size={16} className="mr-2" /> Create Project
                        </button>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 uppercase">Project Name</th>
                                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 uppercase">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 uppercase">Leader</th>
                                    <th className="text-right py-4 px-6 text-sm font-bold text-gray-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptProkers.map((p: any) => (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-gray-900">{p.title}</td>
                                        <td className="py-4 px-6"><Badge status={p.status} /></td>
                                        <td className="py-4 px-6 text-gray-600 text-sm">{p.leader_name || p.leader?.name || p.leader || '-'}</td>
                                        <td className="py-4 px-6 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedItem(p); setView('projectDetail'); }}
                                                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors"
                                            >
                                                Lihat Project
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(p.id)}
                                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {deptProkers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Briefcase size={48} className="mb-4 opacity-20" />
                                                <p className="font-medium">No projects found.</p>
                                                <p className="text-sm">Create a new project to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staff Management Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center"><Users className="mr-2 text-green-600" /> Staff Management</h3>
                        <button onClick={() => setView('addStaff')} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center transition-colors">
                            <Plus size={16} className="mr-2" /> Add Staff
                        </button>
                    </div>

                    {deptMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deptMembers.map((m: any) => (
                                <div key={m.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group" onClick={() => { setSelectedItem(m); setView('staffDetail'); }}>
                                    <img src={m.image} alt={m.name} className="w-12 h-12 rounded-full border-2 border-gray-100 group-hover:border-blue-200 transition-colors" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{m.name}</h4>
                                        <p className="text-xs text-gray-500">{m.nim}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStaff(m.id); }}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Staff"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ArrowLeft size={16} className="text-gray-300 group-hover:text-blue-500 rotate-180 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <AlertCircle size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Staff Not Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                There are no staff members assigned to this department yet.
                                Please contact the Super Admin (Kahima) or add staff manually.
                            </p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};