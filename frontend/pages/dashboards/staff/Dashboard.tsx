import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowLeft, Calendar, Users, ListTodo, LayoutDashboard, CheckSquare, Folder, ChevronDown, ChevronRight, Menu, LogOut, User, Clock, Settings, X } from 'lucide-react';
import { DashboardHeader } from '../../../components/DashboardHeader';
import { StaffTaskView } from './views/StaffTaskView';
import { ProjectLeaderView } from '../ketupel/Dashboard';
import { ProjectTreasurerView } from './views/ProjectTreasurerView';
import { ProjectSecretaryView } from './views/ProjectSecretaryView';
import { ProjectCoordinatorView } from './views/ProjectCoordinatorView';
import { Badge, Card } from '../../../components/ui/Shared';

export const StaffDashboard = ({ user, onLogout, members, prokers, setProkers, refreshData }: any) => {
    const [activeView, setActiveView] = useState('my-tasks-kanban');
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['my-tasks', 'manage-project']);
    const [selectedProkerDetail, setSelectedProkerDetail] = useState<any>(null);
    // Default to closed on mobile (screen width < 768px)
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    // Check roles for specific projects
    const managedProkers = prokers.filter((p: any) => p.leader_name === user.name || p.leader === user.name);
    const treasuryProkers = prokers.filter((p: any) => p.treasurer_name === user.name || p.treasurer === user.name);
    const secretaryProkers = prokers.filter((p: any) => p.secretary_name === user.name || p.secretary === user.name);

    // Check Coordinator Role
    const coordinatorProkers = prokers.filter((p: any) =>
        p.sies?.some((s: any) => s.coordinator === user.name)
    );

    // Filter "My Proker" - Projects where the user is involved
    const myProkers = prokers.filter((p: any) => {
        const isLeader = p.leader_name === user.name || p.leader === user.name;
        const isSecretary = p.secretary_name === user.name || p.secretary === user.name;
        const isTreasurer = p.treasurer_name === user.name || p.treasurer === user.name;
        const isCoordinator = p.sies?.some((s: any) => s.coordinator === user.name);
        const isStaff = p.sies?.some((s: any) => s.staff?.includes(user.name));
        return isLeader || isSecretary || isTreasurer || isCoordinator || isStaff;
    });

    const isLeader = managedProkers.length > 0;
    const isTreasurer = treasuryProkers.length > 0;
    const isSecretary = secretaryProkers.length > 0;
    const isCoordinator = coordinatorProkers.length > 0;

    const currentProker = managedProkers[0];
    const treasuryProker = treasuryProkers[0];
    const secretaryProker = secretaryProkers[0];
    const coordinatorProker = coordinatorProkers[0];

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    // Helper to change view and auto-close sidebar on mobile
    const handleViewChange = (view: string) => {
        setActiveView(view);
        // Close sidebar on mobile (screen width < 768px)
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    // --- RENDER PROKER DETAIL (FULL PAGE SIMULATION for "My Proker" click) ---
    if (selectedProkerDetail) {
        const PROGRESS_UPDATES = [
            { activity: 'Penyusunan Proposal', pic: 'Sekretaris Pelaksana', status: 'Done', deadline: '2024-02-01' },
            { activity: 'Konsultasi Konsep Acara', pic: 'Sie Acara', status: 'Done', deadline: '2024-02-10' },
        ];

        return (
            <div className="min-h-screen bg-gray-50 animate-fade-in">
                <DashboardHeader user={user} onLogout={onLogout} />
                <main className="px-8 pb-8 max-w-7xl mx-auto space-y-8">
                    <button onClick={() => setSelectedProkerDetail(null)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </button>

                    {/* Header */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProkerDetail.title}</h1>
                                <div className="flex items-center space-x-3 text-sm">
                                    <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{selectedProkerDetail.department}</span>
                                    <span className="text-gray-500 flex items-center"><Calendar size={14} className="mr-1" /> {selectedProkerDetail.deadline}</span>
                                </div>
                            </div>
                            <Badge status={selectedProkerDetail.status} />
                        </div>
                        <p className="text-gray-600">{selectedProkerDetail.description}</p>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className={`h-3 rounded-full ${selectedProkerDetail.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${selectedProkerDetail.progress}%` }} />
                        </div>
                    </div>

                    {/* Updates */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <ListTodo size={20} className="mr-2" /> Progress Updates
                        </h3>
                        <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Activity</th>
                                        <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">PIC</th>
                                        <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PROGRESS_UPDATES.map((update, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-900 font-medium">{update.activity}</td>
                                            <td className="py-4 px-6 text-gray-600">{update.pic}</td>
                                            <td className="py-4 px-6"><Badge status={update.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                </main>
            </div>
        )
    }

    // --- MAIN DASHBOARD RENDER ---
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

                <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
                    {/* My Tasks & Progress Group */}
                    <div>
                        <button
                            onClick={() => toggleMenu('my-tasks')}
                            className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <CheckSquare size={18} />
                                <span>My Tasks & Progress</span>
                            </div>
                            {expandedMenus.includes('my-tasks') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {expandedMenus.includes('my-tasks') && (
                            <div className="ml-9 mt-1 space-y-1">
                                <button
                                    onClick={() => handleViewChange('my-tasks-kanban')}
                                    className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${activeView === 'my-tasks-kanban' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    My Task & Kanban
                                </button>
                                <button
                                    onClick={() => handleViewChange('my-proker')}
                                    className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${activeView === 'my-proker' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    My Proker
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Manage Project Group (Leader) */}
                    {isLeader && (
                        <div>
                            <button
                                onClick={() => toggleMenu('manage-project')}
                                className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard size={18} />
                                    <span>Manage Project</span>
                                </div>
                                {expandedMenus.includes('manage-project') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>

                            {expandedMenus.includes('manage-project') && (
                                <div className="ml-9 mt-1 space-y-1">
                                    <button
                                        onClick={() => handleViewChange('manage-project-overview')}
                                        className={`w-full text-left p-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${activeView === 'manage-project-overview' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <LayoutDashboard size={14} /> Overview
                                    </button>
                                    <button
                                        onClick={() => handleViewChange('manage-project-timeline')}
                                        className={`w-full text-left p-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${activeView === 'manage-project-timeline' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <Clock size={14} /> Timeline
                                    </button>
                                    <button
                                        onClick={() => handleViewChange('manage-project-members')}
                                        className={`w-full text-left p-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${activeView === 'manage-project-members' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <Users size={14} /> Members & Sie
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other Roles */}
                    {isCoordinator && (
                        <button
                            onClick={() => handleViewChange('coordinator-view')}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${activeView === 'coordinator-view' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Users size={18} />
                            <span>Coordinator View</span>
                        </button>
                    )}

                    {isSecretary && (
                        <button
                            onClick={() => handleViewChange('secretary-view')}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${activeView === 'secretary-view' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Folder size={18} />
                            <span>Administration</span>
                        </button>
                    )}

                    {isTreasurer && (
                        <button
                            onClick={() => handleViewChange('treasurer-view')}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${activeView === 'treasurer-view' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Briefcase size={18} />
                            <span>Financial</span>
                        </button>
                    )}
                </div>

                {/* User Profile & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.role}</p>
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-900">UOMS Dashboard</span>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeView === 'my-tasks-kanban' && 'My Tasks & Kanban'}
                                {activeView === 'my-proker' && 'My Projects'}
                                {activeView.startsWith('manage-project') && `Manage Project: ${currentProker?.title}`}
                                {activeView === 'coordinator-view' && 'Coordinator Dashboard'}
                                {activeView === 'secretary-view' && 'Administration Dashboard'}
                                {activeView === 'treasurer-view' && 'Financial Dashboard'}
                            </h1>
                            <p className="text-gray-500">Welcome back, {user.name}</p>
                        </div>

                        {activeView === 'my-tasks-kanban' && (
                            <StaffTaskView
                                user={user}
                                members={members}
                                prokers={prokers}
                                onSelectProker={setSelectedProkerDetail}
                                viewMode="tasks"
                            />
                        )}

                        {activeView === 'my-proker' && (
                            <StaffTaskView
                                user={user}
                                members={members}
                                prokers={myProkers}
                                onSelectProker={setSelectedProkerDetail}
                                viewMode="proker"
                            />
                        )}

                        {activeView.startsWith('manage-project') && isLeader && (
                            <ProjectLeaderView
                                currentProker={currentProker}
                                members={members}
                                user={user}
                                setProkers={setProkers}
                                prokers={prokers}
                                refreshData={refreshData}
                                activeTab={activeView.replace('manage-project-', '')}
                            />
                        )}

                        {activeView === 'coordinator-view' && isCoordinator && (
                            <ProjectCoordinatorView
                                currentProker={coordinatorProker}
                                user={user}
                                setProkers={setProkers}
                                prokers={prokers}
                            />
                        )}

                        {activeView === 'treasurer-view' && isTreasurer && (
                            <ProjectTreasurerView
                                treasuryProker={treasuryProker}
                            />
                        )}

                        {activeView === 'secretary-view' && isSecretary && (
                            <ProjectSecretaryView
                                secretaryProker={secretaryProker}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};