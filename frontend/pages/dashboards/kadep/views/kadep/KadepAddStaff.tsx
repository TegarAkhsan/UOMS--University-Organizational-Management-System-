import React, { useState } from 'react';
import { ArrowLeft, Info, Plus, Link, ChevronDown, Check, Copy, X } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/DashboardHeader';
import client from '../../../../../src/api/client';

export const KadepAddStaff = ({
    user,
    onLogout,
    setView,
    allMembers = [],
    setMembers, // Need this to update list after adding
    myDeptCode  // Need this to know which dept to assign
}: any) => {
    const [mode, setMode] = useState<'create' | 'assign'>('create');
    const [selectedExistingId, setSelectedExistingId] = useState('');

    // Local state for form
    const [newMember, setNewMember] = useState({ name: '', nim: '', role: 'Staff' });

    // Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });

    // Filter Logic
    const unassignedMembers = allMembers.filter((m: any) =>
        (!m.department_id && (!m.dept || m.dept === '-')) &&
        (m.role === 'Staff' || m.role === 'Volunteer' || !m.role)
    );

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate credentials logic (matching Dashboard.tsx logic)
        const email = `${newMember.name.toLowerCase().replace(/\s+/g, '.')}@himaforticunesa.com`;
        const password = 'staffhimafortic';

        const payload = {
            ...newMember,
            department_id: myDeptCode || user.dept || 'PSDM',
            dept: myDeptCode || user.dept || 'PSDM',
            email,
            password,
            points: 0,
            violations: 0,
            status: 'staff'
        };

        try {
            const res = await client.post('/users', payload);
            const newStaff = { ...res.data, dept: payload.dept };

            // Update parent list if function exists
            if (setMembers) {
                // We assume setMembers is passed. If not, we might need to reload.
                // Since I can't guarantee setMembers signature from just this file view, 
                // but usually it's a setState setter.
                setMembers((prev: any) => [...prev, newStaff]);
            }

            setCreatedCredentials({ email, password });
            setShowSuccessModal(true);
            setNewMember({ name: '', nim: '', role: 'Staff' });
        } catch (err) {
            console.error(err);
            alert('Failed to add staff. Please try again.');
        }
    };

    const handleAssignMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExistingId) return;

        const deptToAssign = myDeptCode || user.dept || 'PSDM';

        const payload = {
            department_id: deptToAssign,
            dept: deptToAssign,
        };

        client.put(`/users/${selectedExistingId}`, payload)
            .then(res => {
                alert('Staff successfully assigned to your department!');
                window.location.reload();
            })
            .catch(err => {
                console.error(err);
                alert('Failed to assign staff.');
            });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <DashboardHeader user={user} onLogout={onLogout} />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                <Check size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Staff Added!</h3>
                            <p className="text-green-100 mt-2 text-sm">Account has been created successfully.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Access</label>
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
                                        <input readOnly value={createdCredentials.email} className="bg-transparent flex-1 p-2 text-sm font-bg-gray-700 outline-none" />
                                        <button onClick={() => copyToClipboard(createdCredentials.email)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Copy Email">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Access</label>
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
                                        <input readOnly value={createdCredentials.password} className="bg-transparent flex-1 p-2 text-sm font-bg-gray-700 outline-none" />
                                        <button onClick={() => copyToClipboard(createdCredentials.password)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Copy Password">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setShowSuccessModal(false); setView('dashboard'); }}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                Done & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="px-4 md:px-8 pb-8 max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
                        <p className="text-gray-500 text-sm">Add new recruits or assign existing members to your department.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mode === 'create'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Create New Staff
                    </button>
                    <button
                        onClick={() => setMode('assign')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mode === 'assign'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Assign Existing Staff
                    </button>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    {mode === 'create' ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Plus size={20} className="mr-2 text-green-600" /> Add New Staff
                            </h2>
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
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
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Link size={20} className="mr-2 text-blue-600" /> Assign Existing Member
                            </h2>
                            <form onSubmit={handleAssignMember} className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm mb-4">
                                    <strong>Info:</strong> Select members who are currently not assigned to any department.
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-base font-bold text-gray-900">Select Unassigned Staff</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                            value={selectedExistingId}
                                            onChange={e => setSelectedExistingId(e.target.value)}
                                        >
                                            <option value="">-- Choose Member --</option>
                                            {unassignedMembers.length > 0 ? (
                                                unassignedMembers.map((m: any) => (
                                                    <option key={m.id} value={m.id}>{m.name} ({m.nim})</option>
                                                ))
                                            ) : (
                                                <option disabled>No unassigned staff found.</option>
                                            )}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <ChevronDown className="text-gray-500" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 gap-4">
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors flex items-center">
                                        <Link size={18} className="mr-2" />
                                        Assign Staff
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
