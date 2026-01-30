import React, { useState } from 'react';
import { DashboardHeader } from '../../../components/DashboardHeader';
import { BendaharaOverview } from './views/BendaharaOverview';
import { BendaharaRabView } from './views/BendaharaRabView';
import { BendaharaStandardPriceView } from './views/BendaharaStandardPriceView';
import { BendaharaBudgetCodeView } from './views/BendaharaBudgetCodeView';
import { BendaharaTransactionForm } from './views/BendaharaTransactionForm';
import { BendaharaKasView } from './views/BendaharaKasView';
import { Wallet, LayoutDashboard, FileCheck, DollarSign, Hash, PiggyBank, Menu, X, LogOut, ArrowLeft } from 'lucide-react';

export const BendaharaDashboard = ({ user, onLogout }: any) => {
    const [view, setView] = useState<'dashboard' | 'addIncome' | 'addExpense' | 'standardPrices' | 'budgetCodes' | 'kas' | 'rabReview'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    // Helper to change view and auto-close sidebar on mobile
    const handleViewChange = (newView: typeof view) => {
        setView(newView);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'rabReview', icon: FileCheck, label: 'Review RAB' },
        { id: 'standardPrices', icon: DollarSign, label: 'Harga Wajar' },
        { id: 'budgetCodes', icon: Hash, label: 'Kode Anggaran' },
        { id: 'kas', icon: PiggyBank, label: 'Kas & Iuran' },
    ];

    // Transaction Form Views (full screen)
    if (view === 'addIncome' || view === 'addExpense') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setView('dashboard')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">
                        {view === 'addIncome' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                    </h1>
                </div>
                <main className="p-4 md:p-8">
                    <BendaharaTransactionForm
                        type={view === 'addIncome' ? 'Income' : 'Expense'}
                        onBack={() => setView('dashboard')}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                        <Wallet className="fill-blue-600 text-white" size={24} />
                        <span>Bendahara</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleViewChange(item.id as typeof view)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${view === item.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {user.name?.charAt(0) || 'B'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Financial Dashboard</h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {/* Desktop Title */}
                    <h1 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">
                        Financial Dashboard
                    </h1>

                    {view === 'dashboard' && <BendaharaOverview setView={setView} />}
                    {view === 'rabReview' && <BendaharaRabView />}
                    {view === 'standardPrices' && <BendaharaStandardPriceView />}
                    {view === 'budgetCodes' && <BendaharaBudgetCodeView />}
                    {view === 'kas' && <BendaharaKasView user={user} />}
                </main>
            </div>
        </div>
    );
};
