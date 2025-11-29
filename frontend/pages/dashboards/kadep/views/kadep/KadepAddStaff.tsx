import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/DashboardHeader';

export const KadepAddStaff = ({
    user,
    onLogout,
    setView,
    handleAddMember,
    newMember,
    setNewMember
}: any) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-2xl mx-auto animate-fade-in">
                <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Staff</h2>
                    <form onSubmit={handleAddMember} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="Ex: John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">NIM</label>
                            <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.nim} onChange={e => setNewMember({ ...newMember, nim: e.target.value })} placeholder="Ex: 23091397..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}>
                                <option value="Staff">Staff</option>
                                <option value="Sekretaris">Sekretaris</option>
                                <option value="Bendahara">Bendahara</option>
                            </select>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
                            <p className="font-bold mb-1"><Info size={16} className="inline mr-1" /> Auto-Generated Credentials</p>
                            <p>Email: firstname.lastname@himaforticunesa.com</p>
                            <p>Password: staffhimafortic</p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all transform hover:scale-105">Add Staff</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
