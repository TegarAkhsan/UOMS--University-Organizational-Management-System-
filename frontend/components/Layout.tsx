import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Search, Bell, LogOut } from 'lucide-react';

export const Layout = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to determine active tab based on path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/proker')) return 'Program Kerja';
        if (path.includes('/sdm')) return 'SDM';
        if (path.includes('/departments')) return 'Departments';
        if (path.includes('/keuangan')) return 'Keuangan';
        if (path.includes('/surat')) return 'Surat';
        if (path.includes('/asistensi')) return 'Asistensi';
        if (path.includes('/calendar')) return 'Calendar';
        if (path.includes('/meetings')) return 'Meetings';
        if (path.includes('/work-distribution')) return 'Work Dist.';
        return 'Dashboard';
    };

    const activeTab = getActiveTab();

    // The global Sidebar and Header are intended for the Superadmin (Kahima) only.
    // All other roles (Sekretaris, Bendahara, Kadep, Staff, Ketupel) have their own
    // specialized dashboards with their own headers and navigation.
    const isSuperAdmin = user.status === 'superadmin';

    if (!isSuperAdmin) {
        return <Outlet />;
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar activeTab={activeTab} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6">
                    <div className="flex-1"></div> {/* Spacer to push right */}
                    <div className="flex items-center space-x-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-600"
                            />
                        </div>
                        <button className="relative p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    {user.status === 'superadmin' ? 'Kahima' : user.role}
                                </p>
                                <p className="text-xs text-blue-500">
                                    {user.status === 'superadmin' ? 'Ketua Himpunan' : user.status === 'admin' ? 'Kadep' : 'Staff'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                                <img src="https://i.pravatar.cc/150?u=kahima" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
