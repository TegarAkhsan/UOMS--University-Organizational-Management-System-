import React, { useState } from 'react';
import { DashboardHeader } from '../../../components/DashboardHeader';
import { BendaharaOverview } from './views/BendaharaOverview';
import { BendaharaRabView } from './views/BendaharaRabView';
import { BendaharaStandardPriceView } from './views/BendaharaStandardPriceView';
import { BendaharaBudgetCodeView } from './views/BendaharaBudgetCodeView';
import { BendaharaTransactionForm } from './views/BendaharaTransactionForm';
import { BendaharaKasView } from './views/BendaharaKasView';

export const BendaharaDashboard = ({ user, onLogout }: any) => {
    const [view, setView] = useState<'dashboard' | 'addIncome' | 'addExpense' | 'standardPrices' | 'budgetCodes' | 'kas' | 'rabReview'>('dashboard');

    if (view === 'addIncome') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader user={user} onLogout={onLogout} />
                <main className="px-8 pb-8">
                    <BendaharaTransactionForm type="Income" onBack={() => setView('dashboard')} />
                </main>
            </div>
        );
    }

    if (view === 'addExpense') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader user={user} onLogout={onLogout} />
                <main className="px-8 pb-8">
                    <BendaharaTransactionForm type="Expense" onBack={() => setView('dashboard')} />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-7xl mx-auto space-y-8">

                {/* Title Section */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg font-bold ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Overview</button>
                        <button onClick={() => setView('rabReview')} className={`px-4 py-2 rounded-lg font-bold ${view === 'rabReview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Review RAB</button>
                        <button onClick={() => setView('standardPrices')} className={`px-4 py-2 rounded-lg font-bold ${view === 'standardPrices' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Atur Harga Wajar</button>
                        <button onClick={() => setView('budgetCodes')} className={`px-4 py-2 rounded-lg font-bold ${view === 'budgetCodes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Atur Kode Anggaran</button>
                        <button onClick={() => setView('kas')} className={`px-4 py-2 rounded-lg font-bold ${view === 'kas' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Kas & Iuran</button>
                    </div>
                </div>

                {view === 'dashboard' && <BendaharaOverview setView={setView} />}
                {view === 'rabReview' && <BendaharaRabView />}
                {view === 'standardPrices' && <BendaharaStandardPriceView />}
                {view === 'budgetCodes' && <BendaharaBudgetCodeView />}
                {view === 'kas' && <BendaharaKasView user={user} />}

            </main>
        </div>
    );
};
