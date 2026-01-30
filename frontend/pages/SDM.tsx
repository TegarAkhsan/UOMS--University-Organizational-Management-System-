
import React, { useState } from 'react';
import { Search, ChevronRight, Plus, Briefcase, ArrowLeft, Award, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { Card, Badge, Modal } from '../components/ui/Shared';
import { DEPARTMENTS, ROLES, getAvatar } from '../data/mockData';
import client from '../src/api/client';

export const SDM = ({ members, setMembers, prokers, user }: { members: any[], setMembers: (m: any[]) => void, prokers: any[], user?: any }) => {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [sdmFilterDept, setSdmFilterDept] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [newMember, setNewMember] = useState<any>({ name: '', nim: '', dept: 'PSDM', role: 'Staff', avatar: null });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });

    // Violation State
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [violationData, setViolationData] = useState({ memberId: '', reason: '', deduction: 1 });

    // Check if user has access to Violation Manager
    const canManageViolations = (user && user.status === 'superadmin') || (user && ['Kahima', 'Wakil Kahima', 'Sekretaris Umum', 'Sekretaris 1', 'Sekretaris 2', 'Ketua Departemen'].includes(user.role)) || (user && user.dept === 'PSDM');

    const handleAddMember = (e: any) => {
        e.preventDefault();

        // Custom Email Generation
        // Format: [role][dept][year]@himaforticunesa.com
        const normalizeRole = (r: string) => r.toLowerCase().replace(/\s+/g, '');
        const normalizeDept = (d: string) => d.toLowerCase().replace(/\s+/g, '');
        const year = new Date().getFullYear();

        let emailPrefix = '';
        if (newMember.role === 'Ketua Departemen') {
            emailPrefix = `kadep${normalizeDept(newMember.dept)}${year}`;
        } else if (newMember.role === 'Staff') {
            // Staff emails usually use name or NIM, but user asked for "kadeppsdm2026" example. 
            // For staff, we might keep it simple or follow a pattern. Let's use name for staff to avoid collision.
            // Or if user wants STRICT pattern for all:
            // Let's stick to user request example "kadeppsdm2026" implies role+dept+year. 
            // For unique staff, maybe staff[name.split[0]][dept][year]? 
            // Let's try: staff[name_first_word][dept][year]
            const firstName = newMember.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            emailPrefix = `staff${firstName}${normalizeDept(newMember.dept)}${year}`;
        } else {
            // Fallback for other roles (Kahima etc)
            emailPrefix = `${normalizeRole(newMember.role)}${year}`;
        }

        const generatedEmail = `${emailPrefix}@himaforticunesa.com`;
        const generatedPassword = '123456'; // Default password

        const formData = new FormData();
        formData.append('name', newMember.name);
        formData.append('nim', newMember.nim);
        formData.append('department_id', newMember.dept);
        formData.append('role', newMember.role);
        formData.append('email', generatedEmail);
        formData.append('password', generatedPassword);
        if (newMember.avatar) {
            formData.append('avatar', newMember.avatar);
        }

        client.post('/users', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                setMembers([...members, res.data]);
                // Close Create View first? Or show modal on top? Show modal then redirect.
                // We'll keep Create View open or switch to list? Let's stay to show modal.
                setCreatedCredentials({ email: generatedEmail, password: generatedPassword });
                setShowSuccessModal(true);
                setNewMember({ name: '', nim: '', dept: 'PSDM', role: 'Staff', avatar: null });
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    alert('Session expired. Please login again.');
                    window.location.reload();
                } else {
                    alert('Failed to add member: ' + (err.response?.data?.message || err.message));
                }
            });
    };


    const handleMemberClick = (member: any) => {
        setSelectedMember(member);
        setView('detail');
    };

    const handleSubmitViolation = () => {
        if (!violationData.memberId) return;

        console.log('Submitting violation for:', violationData.memberId);
        const memberToUpdate = members.find(m => String(m.id) === String(violationData.memberId));
        if (!memberToUpdate) {
            console.error('Member not found in list:', violationData.memberId);
            return;
        }

        const newViolations = (memberToUpdate.violations || 0) + violationData.deduction;
        let newStatus = memberToUpdate.status;

        // Logic for Sanctions based on Total Violation Points
        if (newViolations >= 10) newStatus = 'Dropped (Keluar)';
        else if (newViolations >= 5) newStatus = 'SP 2';
        else if (newViolations >= 3) newStatus = 'SP 1';

        const newHistory = [...(memberToUpdate.violation_history || []), {
            date: new Date().toISOString().split('T')[0],
            reason: violationData.reason,
            deduction: violationData.deduction || 0
        }];

        const payload = {
            violations: newViolations,
            status: newStatus,
            violation_history: newHistory
        };

        client.put(`/users/${violationData.memberId} `, payload)
            .then(res => {
                console.log('Violation recorded:', res.data);
                const updatedMembers = members.map(m => String(m.id) === String(violationData.memberId) ? res.data : m);
                setMembers(updatedMembers);
                setShowViolationModal(false);
                setViolationData({ memberId: '', reason: '', deduction: 1 });
                alert('Violation recorded successfully.');
            })
            .catch(err => {
                console.error('Failed to record violation:', err);
                alert('Failed to record violation.');
            });
    };

    const handleDeleteMember = (e: React.MouseEvent, member: any) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)) return;

        client.delete(`/users/${member.id}`)
            .then(() => {
                setMembers(members.filter(m => m.id !== member.id));
                if (selectedMember?.id === member.id) {
                    setView('list');
                    setSelectedMember(null);
                }
                alert('Member deleted successfully');
            })
            .catch(err => {
                console.error('Failed to delete member:', err);
                alert('Failed to delete member');
            });
    };

    const handleOpenViolationModal = (e: React.MouseEvent, memberId: string) => {
        e.stopPropagation();
        setViolationData({ ...violationData, memberId });
        setShowViolationModal(true);
    };

    // CREATE VIEW
    if (view === 'create') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 relative">
                {/* Success Modal */}
                <Modal
                    isOpen={showSuccessModal}
                    onClose={() => { setShowSuccessModal(false); setView('list'); }}
                    title="Member Added Successfully"
                >
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {/* Reusing Check icon manually since Badge is a component */}
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-gray-600">The new member has been created. Please share these credentials securely.</p>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                <div className="flex justify-between items-center">
                                    <code className="text-gray-900 font-mono font-bold text-lg">{createdCredentials.email}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(createdCredentials.email)}
                                        className="text-blue-500 hover:text-blue-700 text-xs font-bold"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                                <div className="flex justify-between items-center">
                                    <code className="text-gray-900 font-mono font-bold text-lg">{createdCredentials.password}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(createdCredentials.password)}
                                        className="text-blue-500 hover:text-blue-700 text-xs font-bold"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setShowSuccessModal(false); setView('list'); }}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all"
                        >
                            Done
                        </button>
                    </div>
                </Modal>

                <div className="flex items-center space-x-4 mb-6">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New SDM</h1>
                        <p className="text-gray-500 text-sm">Enter the details for the new member.</p>
                    </div>
                </div>

                <form onSubmit={handleAddMember} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-base font-bold text-gray-900">Nama Lengkap (Full Name)</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter full name"
                            className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                            value={newMember.name}
                            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-bold text-gray-900">NIM</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter NIM"
                            className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                            value={newMember.nim}
                            onChange={e => setNewMember({ ...newMember, nim: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Departemen</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                    value={newMember.dept}
                                    onChange={e => setNewMember({ ...newMember, dept: e.target.value })}
                                >
                                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <ChevronRight className="rotate-90 text-gray-500" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Role / Jabatan</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <ChevronRight className="rotate-90 text-gray-500" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
                            Save SDM
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // DETAIL VIEW
    if (view === 'detail' && selectedMember) {
        // Logic for project history
        let memberProjects: any[] = [];

        if (selectedMember.dept === 'BPH') {
            memberProjects = prokers.map(p => ({
                title: p.title,
                role: selectedMember.role
            }));
        } else {
            memberProjects = prokers.filter(p => p.leader === selectedMember.name || Math.random() > 0.7).map(p => ({
                title: p.title,
                role: p.leader === selectedMember.name ? 'Ketua Pelaksana' : 'Staff Panitia'
            }));
        }

        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
                {/* Header Back */}
                <button
                    onClick={() => setView('list')}
                    className="text-gray-500 hover:text-gray-900 flex items-center mb-4 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>

                {/* Profile Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <img src={selectedMember.image} alt={selectedMember.name} className="w-32 h-32 rounded-full border-4 border-blue-50" />
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{selectedMember.name}</h1>
                                <p className="text-gray-500 text-lg font-medium">{selectedMember.nim}</p>
                            </div>
                            {user?.status === 'superadmin' && (
                                <button
                                    onClick={(e) => handleDeleteMember(e, selectedMember)}
                                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
                                >
                                    Delete Member
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">
                                {selectedMember.dept}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                {selectedMember.role === 'Kahima' ? 'Ketua Himpunan' : selectedMember.role === 'Wakil Kahima' ? 'Wakil Ketua Himpunan' : selectedMember.role}
                            </span>
                            <span className={`px - 3 py - 1 rounded - lg text - sm font - medium ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-700' :
                                selectedMember.status === 'Dropped (Keluar)' ? 'bg-red-200 text-red-800' :
                                    'bg-yellow-100 text-yellow-800' // SP1/SP2
                                } `}>
                                {selectedMember.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Poin Kontribusi</p>
                            <h3 className="text-3xl font-bold text-gray-900">{selectedMember.points}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Poin Pelanggaran</p>
                            <h3 className="text-3xl font-bold text-gray-900">{selectedMember.violations || 0}</h3>
                            <p className="text-xs text-red-400">
                                {(selectedMember.violations || 0) >= 10 ? 'Dropped' : (selectedMember.violations || 0) >= 5 ? 'SP 2' : (selectedMember.violations || 0) >= 3 ? 'SP 1' : 'Safe'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Violation History Table (Only visible to admins/PSDM) */}
                {canManageViolations && selectedMember.violation_history && selectedMember.violation_history.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-red-800">Violation History</h3>
                        <Card className="p-0 overflow-hidden border border-red-100 bg-red-50 rounded-xl">
                            <table className="w-full">
                                <thead className="bg-red-100 border-b border-red-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-red-800 font-bold text-sm">Date</th>
                                        <th className="text-left py-4 px-6 text-red-800 font-bold text-sm">Reason</th>
                                        <th className="text-left py-4 px-6 text-red-800 font-bold text-sm">Points Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMember.violation_history.map((v: any, idx: number) => (
                                        <tr key={idx} className="border-b border-red-100">
                                            <td className="py-4 px-6 text-gray-900">{v.date}</td>
                                            <td className="py-4 px-6 text-gray-900">{v.reason}</td>
                                            <td className="py-4 px-6 text-red-600 font-bold">+{v.deduction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}

                {/* Project Involvement Table */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Keterlibatan Program Kerja</h3>
                    <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Nama Program Kerja</th>
                                    <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Jabatan / Posisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberProjects.length > 0 ? (
                                    memberProjects.map((proj, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-900 font-medium">{proj.title}</td>
                                            <td className="py-4 px-6 text-blue-600">{proj.role}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="py-8 text-center text-gray-500">Belum ada keterlibatan program kerja.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        );
    }

    // LIST VIEW
    const filteredMembers = members.filter(m => {
        const matchesDept = sdmFilterDept === 'All' || m.dept === sdmFilterDept;
        const matchesSearch = searchTerm === '' ||
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nim.includes(searchTerm);
        return matchesDept && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Members</h1>
                    <p className="text-sm text-blue-500">Manage members of the organization</p>
                </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg flex items-center mb-6">
                <Search size={20} className="text-blue-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search members by Name or NIM"
                    className="bg-transparent border-none outline-none text-gray-600 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex space-x-3 mb-6">
                <div className="relative">
                    <select
                        className="appearance-none bg-gray-200 px-4 py-2 rounded-lg pr-8 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                        value={sdmFilterDept}
                        onChange={(e) => setSdmFilterDept(e.target.value)}
                    >
                        <option value="All">Department</option>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-500" size={16} />
                </div>

                <button
                    onClick={() => setView('create')}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    <span>Add SDM</span>
                </button>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Avatar</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Name</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">NIM</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Role</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Department</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Points</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Violations</th>
                            <th className="text-right py-4 px-6 text-gray-500 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr
                                key={member.id}
                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleMemberClick(member)}
                            >
                                <td className="py-4 px-6">
                                    <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full" />
                                </td>
                                <td className="py-4 px-6 text-gray-900 font-medium">{member.name}</td>
                                <td className="py-4 px-6 text-gray-600 text-sm">{member.nim}</td>
                                <td className="py-4 px-6 text-blue-600 text-sm">
                                    {(() => {
                                        // 1. BPH Logic
                                        if (member.dept === 'BPH' || member.department_id === 'BPH' || member.department?.name === 'BPH') {
                                            if (member.status === 'superadmin') return 'Ketua Himpunan';
                                            if (member.status === 'sub_super_admin_1') return 'Bendahara Umum';
                                            if (member.status === 'sub_super_admin_2') return 'Sekretaris Umum';
                                        }

                                        // 2. Normalize project roles to Department roles
                                        const projectRoles = ['staff_sie', 'coordinator_sie', 'sekretaris_bpk', 'bendahara_bpk', 'ketupel'];
                                        if (projectRoles.includes(member.role)) return 'Staff';

                                        // 3. Existing mappings
                                        if (member.role === 'Kahima') return 'Ketua Himpunan';
                                        if (member.role === 'Wakil Kahima') return 'Wakil Ketua Himpunan';

                                        return member.role;
                                    })()}
                                </td>
                                <td className="py-4 px-6 text-blue-600 text-sm">{member.department?.name || member.department_id || member.dept}</td>
                                <td className="py-4 px-6 text-green-600 text-sm font-medium">{member.points || 0}</td>
                                <td className="py-4 px-6 text-red-600 text-sm font-bold">{member.violations || 0}</td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {canManageViolations && (
                                            <button
                                                onClick={(e) => handleOpenViolationModal(e, member.id)}
                                                className="text-yellow-500 hover:text-yellow-700 p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                                                title="Record Violation"
                                            >
                                                <ShieldAlert size={18} />
                                            </button>
                                        )}
                                        {user?.status === 'superadmin' && (
                                            <button
                                                onClick={(e) => handleDeleteMember(e, member)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Violation Recording Modal */}
            <Modal isOpen={showViolationModal} onClose={() => setShowViolationModal(false)} title="Record Violation">
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mb-4">
                        <strong>Note:</strong> Points entered here will be ADDED to the member's violation score.
                        <ul className="list-disc pl-5 mt-2">
                            <li>3 Points = SP 1</li>
                            <li>5 Points = SP 2</li>
                            <li>10 Points = Dropped (Keluar)</li>
                        </ul>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Member</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-white"
                            value={violationData.memberId}
                            onChange={(e) => setViolationData({ ...violationData, memberId: e.target.value })}
                        >
                            <option value="">Select a member...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.nim})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Violation Description</label>
                        <textarea
                            className="w-full p-2 border rounded-lg"
                            rows={3}
                            value={violationData.reason}
                            onChange={(e) => setViolationData({ ...violationData, reason: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Violation Points (Added)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-lg"
                            value={violationData.deduction}
                            onChange={(e) => setViolationData({ ...violationData, deduction: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmitViolation}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700"
                        >
                            Submit Violation
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
