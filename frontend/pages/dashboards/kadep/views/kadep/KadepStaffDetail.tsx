import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/DashboardHeader';

export const KadepStaffDetail = ({
    user,
    onLogout,
    setView,
    selectedItem
}: any) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-5xl mx-auto animate-fade-in">
                <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-32 h-32 rounded-full border-4 border-blue-50" />
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{selectedItem.name}</h1>
                            <p className="text-gray-500 text-lg">{selectedItem.nim}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">{selectedItem.dept}</span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">{selectedItem.role}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <div className="bg-green-50 p-4 rounded-xl"><p className="text-green-700 font-medium">Contribution Points</p><p className="text-2xl font-bold text-green-800">{selectedItem.points}</p></div>
                            <div className="bg-red-50 p-4 rounded-xl"><p className="text-red-700 font-medium">Violations</p><p className="text-2xl font-bold text-red-800">{selectedItem.violations}</p></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
