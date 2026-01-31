import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Plus, RefreshCw, AlertCircle, ArrowLeft, Trash2, LogOut, Building2, ListTodo, Folder, ChevronDown, ChevronRight, Menu, Video, Calendar, Clock } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Shared';
import { DEPARTMENTS, DEPARTMENT_TEXTS } from '../../../data/mockData';
import client from '../../../src/api/client';

// Import Refactored Views
import { KadepCreateProject } from './views/kadep/KadepCreateProject';
import { KadepAddStaff } from './views/kadep/KadepAddStaff';
import { KadepStaffDetail } from './views/kadep/KadepStaffDetail';
import { KadepProjectDetail } from './views/kadep/KadepProjectDetail';
import { StaffTaskView } from '../staff/views/StaffTaskView';
import { Meetings } from '../../../pages/Meetings';

export const KadepDashboard = ({
    user,
    onLogout,
    members,
    setMembers,
    prokers,
    setProkers,
    refreshData
}: any) => {
    // View state for sidebar navigation
    const [activeView, setActiveView] = useState<string>('department-overview');
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['department', 'my-tasks']);
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    // Legacy view state for sub-pages
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

    // Filter "My Proker" - Projects where Kadep is involved (as leader, etc.)
    const myProkers = prokers.filter((p: any) => {
        const isLeader = p.leader_name === user.name || p.leader === user.name;
        const isSecretary = p.secretary_name === user.name || p.secretary === user.name;
        const isTreasurer = p.treasurer_name === user.name || p.treasurer === user.name;
        const isCoordinator = p.sies?.some((s: any) => s.coordinator === user.name);
        const isStaff = p.sies?.some((s: any) => s.staff?.includes(user.name));
        return isLeader || isSecretary || isTreasurer || isCoordinator || isStaff;
    });

    // State for Create/Edit
    const [newMember, setNewMember] = useState({ name: '', nim: '', role: 'Staff' });
    const [newProker, setNewProker] = useState({
        title: '', description: '', objectives: '', benefits: '', impact: '', leader: '', deadline: '', status: 'On Progress'
    });

    // Delete Modals State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
    const [showStaffDeleteModal, setShowStaffDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // -- HANDLERS --
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

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    const handleViewChange = (newView: string) => {
        setActiveView(newView);
        setView('dashboard'); // Reset sub-view
        setSelectedItem(null);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    // -- SUB-VIEWS (Legacy pages) --
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
                setProkers={setProkers}
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

    // -- MAIN DASHBOARD WITH SIDEBAR --
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                        <Briefcase className="fill-blue-600 text-white" />
                        <span>UOMS</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto pb-32">
                    {/* Department Menu (First) */}
                    <div className="mb-2">
                        <button
                            onClick={() => toggleMenu('department')}
                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <Building2 size={18} className="text-blue-600" />
                                <span>Department</span>
                            </span>
                            {expandedMenus.includes('department') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {expandedMenus.includes('department') && (
                            <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                                <button
                                    onClick={() => handleViewChange('department-overview')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'department-overview' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => handleViewChange('department-members')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'department-members' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Members & Sie
                                </button>
                                <button
                                    onClick={() => handleViewChange('department-projects')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'department-projects' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Projects
                                </button>
                            </div>
                        )}
                    </div>

                    {/* My Tasks & Progress Menu (Second) */}
                    <div className="mb-2">
                        <button
                            onClick={() => toggleMenu('my-tasks')}
                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <ListTodo size={18} className="text-green-600" />
                                <span>My Tasks & Progress</span>
                            </span>
                            {expandedMenus.includes('my-tasks') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {expandedMenus.includes('my-tasks') && (
                            <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                                <button
                                    onClick={() => handleViewChange('my-tasks-kanban')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'my-tasks-kanban' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    My Task & Kanban
                                </button>
                                <button
                                    onClick={() => handleViewChange('my-proker')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'my-proker' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    My Proker
                                </button>
                                <button
                                    onClick={() => handleViewChange('meetings')}
                                    className={`w-full text-left p-2.5 text-sm rounded-lg transition-colors ${activeView === 'meetings' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Video size={14} />
                                        Meetings
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* User Profile & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user.name?.charAt(0) || 'K'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">Ketua Departemen</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header with Menu Button */}
                <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-gray-900">Kadep Dashboard</span>
                    <div className="w-8" />
                </header>

                {/* Success Modal */}
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

                {/* CONTENT AREA */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* DEPARTMENT OVERVIEW VIEW */}
                    {activeView === 'department-overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Department Header Card */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
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

                                {/* Function & Duties */}
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

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Total Projects</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{deptProkers.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Team Members</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{deptMembers.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Active</p>
                                    <p className="text-2xl font-black text-blue-600 mt-1">{activeProkersCount}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Completed</p>
                                    <p className="text-2xl font-black text-green-600 mt-1">{completedProkersCount}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DEPARTMENT MEMBERS VIEW */}
                    {activeView === 'department-members' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-900">Department Members</h2>
                                <button onClick={() => setView('addStaff')} className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center transition-all">
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
                    )}

                    {/* DEPARTMENT PROJECTS VIEW */}
                    {activeView === 'department-projects' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-900">Projects & Programs</h2>
                                <button onClick={() => setView('createProject')} className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center transition-all">
                                    <Plus size={18} className="mr-2" /> Create or Assign Project
                                </button>
                            </div>

                            {/* Desktop Table View */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                    )}

                    {/* MY TASKS & KANBAN VIEW */}
                    {activeView === 'my-tasks-kanban' && (
                        <div className="animate-fade-in">
                            <StaffTaskView user={user} prokers={prokers} members={members} />
                        </div>
                    )}

                    {/* MY PROKER VIEW */}
                    {activeView === 'my-proker' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900">My Proker</h2>
                            {myProkers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myProkers.map((p: any) => (
                                        <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge status={p.status} />
                                                <span className="text-xs text-gray-400">{p.department || p.department_id}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {p.deadline || 'No deadline'}
                                                </span>
                                                <span>Leader: {p.leader_name || p.leader || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <Folder size={48} className="text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Projects Assigned</h3>
                                    <p className="text-gray-400 text-sm">You are not involved in any projects yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MEETINGS VIEW */}
                    {activeView === 'meetings' && (
                        <div className="animate-fade-in">
                            <Meetings user={user} prokers={prokers} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};