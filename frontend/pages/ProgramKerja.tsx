
import React, { useState } from 'react';
import { ChevronRight, Calendar as CalendarIcon, ArrowLeft, Users, ListTodo, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Card, Badge, Modal, Toast } from '../components/ui/Shared';
import { DEPARTMENTS } from '../data/mockData';

export const ProgramKerja = ({ prokers, setProkers, members }: { prokers: any[], setProkers: (p: any[]) => void, members: any[] }) => {
    const [view, setView] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
    const [prokerFilterDept, setProkerFilterDept] = useState('All');
    const [prokerFilterStatus, setProkerFilterStatus] = useState('All');
    const [prokerFilterStart, setProkerFilterStart] = useState('');
    const [prokerFilterEnd, setProkerFilterEnd] = useState('');

    const [selectedProker, setSelectedProker] = useState<any>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [prokerToDelete, setProkerToDelete] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // State for Create/Edit form
    const [formProker, setFormProker] = useState({
        title: '',
        description: '',
        objectives: '',
        benefits: '',
        impact: '',
        leader: '',
        secretary: '',
        treasurer: '',
        department: 'BPH',
        deadline: '',
        status: 'On Progress',
        proposal_status: 'not_started',
        lpj_status: 'not_started',
        sies: [] as any[]
    });

    // --- ACTIONS ---

    const handleCreateProker = (e: any) => {
        e.preventDefault();
        import('../src/api/client').then(({ default: client }) => {
            const payload = {
                ...formProker,
                leader_name: formProker.leader,
                secretary_name: formProker.secretary,
                treasurer_name: formProker.treasurer,
                department_id: formProker.department,
                progress: 0,
            };
            client.post('/programs', payload)
                .then(res => {
                    const newProker = { ...res.data, department: { id: formProker.department, name: DEPARTMENTS.find(d => d.id === formProker.department)?.name } };
                    setProkers([...prokers, newProker]);
                    setView('list');
                    resetForm();
                    setToastMessage('Proker created successfully!');
                })
                .catch(err => {
                    console.error('Error creating proker:', err);
                    if (err.response && err.response.status === 401) {
                        alert('Your session has expired. Please log in again.');
                        window.location.reload();
                    } else {
                        alert(`Failed to create proker: ${err.response?.data?.message || err.message}`);
                    }
                });
        });
    };

    const handleUpdateProker = (e: any) => {
        e.preventDefault();
        import('../src/api/client').then(({ default: client }) => {
            const payload = {
                ...formProker,
                leader_name: formProker.leader,
                secretary_name: formProker.secretary,
                treasurer_name: formProker.treasurer,
                department_id: formProker.department,
            };
            client.put(`/programs/${selectedProker.id}`, payload)
                .then(res => {
                    const updated = res.data;
                    const displayUpdated = { ...updated, department: { id: formProker.department, name: DEPARTMENTS.find(d => d.id === formProker.department)?.name } };

                    const updatedProkers = prokers.map(p =>
                        p.id === selectedProker.id ? displayUpdated : p
                    );
                    setProkers(updatedProkers);
                    setSelectedProker(displayUpdated);
                    setView('detail');
                    resetForm();
                    setToastMessage('Proker updated successfully!');
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to update proker.');
                });
        });
    };

    const handleDeleteProker = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setProkerToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (prokerToDelete) {
            import('../src/api/client').then(({ default: client }) => {
                client.delete(`/programs/${prokerToDelete}`)
                    .then(() => {
                        setProkers(prokers.filter(p => p.id !== prokerToDelete));
                        setToastMessage('Proker deleted successfully!');
                        setDeleteModalOpen(false);
                        setProkerToDelete(null);
                    })
                    .catch(err => {
                        console.error(err);
                        alert('Failed to delete proker.');
                    });
            });
        }
    };

    const handleEditClick = () => {
        setFormProker({
            title: selectedProker.title,
            description: selectedProker.description,
            objectives: selectedProker.objectives,
            benefits: selectedProker.benefits,
            impact: selectedProker.impact,
            leader: selectedProker.leader_name || selectedProker.leader,
            secretary: selectedProker.secretary_name || '',
            treasurer: selectedProker.treasurer_name || '',
            department: selectedProker.department_id || selectedProker.department?.id || 'BPH',
            deadline: selectedProker.deadline,
            status: selectedProker.status,
            proposal_status: selectedProker.proposal_status || 'not_started',
            lpj_status: selectedProker.lpj_status || 'not_started',
            sies: selectedProker.sies || []
        });
        setView('edit');
    };

    const handleProkerClick = (proker: any) => {
        setSelectedProker(proker);
        setView('detail');
    };

    const resetForm = () => {
        setFormProker({
            title: '', description: '', objectives: '', benefits: '', impact: '', leader: '', secretary: '', treasurer: '', department: 'BPH', deadline: '', status: 'On Progress',
            proposal_status: 'not_started', lpj_status: 'not_started', sies: []
        });
    };

    // --- FILTERS ---
    const filteredProkers = prokers.filter(p => {
        const matchDept = prokerFilterDept === 'All' || (p.department_id || p.department?.id || p.department) === prokerFilterDept;
        const pStatus = p.status === 'Active' ? 'On Progress' : p.status;
        const matchStatus = prokerFilterStatus === 'All' || pStatus === prokerFilterStatus;

        let matchDate = true;
        if (prokerFilterStart && prokerFilterEnd) {
            matchDate = p.deadline >= prokerFilterStart && p.deadline <= prokerFilterEnd;
        }

        return matchDept && matchStatus && matchDate;
    });

    if (view === 'create') return <ProkerForm mode="create" onSubmit={handleCreateProker} formProker={formProker} setFormProker={setFormProker} members={members} setView={setView} resetForm={resetForm} />;
    if (view === 'edit') return <ProkerForm mode="edit" onSubmit={handleUpdateProker} formProker={formProker} setFormProker={setFormProker} members={members} setView={setView} resetForm={resetForm} selectedProker={selectedProker} />;


    // DETAIL VIEW
    if (view === 'detail' && selectedProker) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setView('list')}
                        className="text-gray-500 hover:text-gray-900 flex items-center transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back to List
                    </button>

                    <button
                        onClick={handleEditClick}
                        className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                        <Edit size={16} />
                        <span>Edit Project</span>
                    </button>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 relative group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProker.title}</h1>
                            <div className="flex items-center space-x-3 text-sm">
                                <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{selectedProker.department?.name || selectedProker.department}</span>
                                <span className="text-gray-500 flex items-center"><CalendarIcon size={14} className="mr-1" /> {selectedProker.deadline}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge status={selectedProker.status} />
                            <div className="flex gap-2">
                                <Badge status={selectedProker.proposal_status || 'not_started'} />
                                <Badge status={selectedProker.lpj_status || 'not_started'} />
                            </div>
                        </div>
                    </div>

                    {/* BPK Highlight */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-500 font-medium">Ketua Pelaksana</p>
                            <p className="text-lg font-bold text-gray-900">{selectedProker.leader_name || selectedProker.leader || '-'}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-500 font-medium">Sekretaris</p>
                            <p className="text-lg font-bold text-gray-900">{selectedProker.secretary_name || '-'}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-500 font-medium">Bendahara</p>
                            <p className="text-lg font-bold text-gray-900">{selectedProker.treasurer_name || '-'}</p>
                        </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full ${selectedProker.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${selectedProker.progress}%` }}
                        />
                    </div>
                    <p className="text-right text-sm font-bold text-gray-700">{selectedProker.progress}% Completed</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900">Deskripsi Program Kerja</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProker.description}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900">Tujuan (Objectives)</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProker.objectives}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900">Manfaat (Benefits)</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProker.benefits}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900">Dampak (Impact)</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProker.impact}</p>
                        </div>
                    </div>
                </div>

                {/* Committee Table */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Users size={20} className="mr-2" /> Susunan Kepanitiaan (Sies)
                    </h3>
                    <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Sie / Divisi</th>
                                    <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Koordinator</th>
                                    <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Staff</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProker.sies && selectedProker.sies.length > 0 ? (
                                    selectedProker.sies.map((sie: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-900 font-medium">{sie.name}</td>
                                            <td className="py-4 px-6 text-blue-600 font-medium">{sie.coordinator}</td>
                                            <td className="py-4 px-6 text-gray-600 text-sm">{sie.staff?.join(', ')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-4 px-6 text-center text-gray-500">Belum ada data kepanitiaan.</td>
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
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl text-white mb-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <ListTodo size={32} className="text-blue-100" />
                        <h1 className="text-3xl font-extrabold tracking-tight">Program Kerja</h1>
                    </div>
                    <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                        Manage, track, and execute your organization's initiatives with precision.
                    </p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Department Filter */}
                    <div className="relative min-w-[150px]">
                        <select
                            value={prokerFilterDept}
                            onChange={(e) => setProkerFilterDept(e.target.value)}
                            className="w-full appearance-none bg-gray-50 px-4 py-2.5 rounded-lg pr-10 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <option value="All">All Departments</option>
                            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[150px]">
                        <select
                            value={prokerFilterStatus}
                            onChange={(e) => setProkerFilterStatus(e.target.value)}
                            className="w-full appearance-none bg-gray-50 px-4 py-2.5 rounded-lg pr-10 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="On Progress">On Progress</option>
                            <option value="Done">Done</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <input type="date" value={prokerFilterStart} onChange={e => setProkerFilterStart(e.target.value)} className="bg-transparent text-sm text-gray-700 focus:outline-none w-28 font-medium cursor-pointer" />
                        <span className="text-gray-300">|</span>
                        <input type="date" value={prokerFilterEnd} onChange={e => setProkerFilterEnd(e.target.value)} className="bg-transparent text-sm text-gray-700 focus:outline-none w-28 font-medium cursor-pointer" />
                    </div>
                </div>

                <button
                    onClick={() => { resetForm(); setView('create'); }}
                    className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-95"
                >
                    <Plus size={18} />
                    <span>New Proker</span>
                </button>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Title</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Department</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Progress</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Ketua Pelaksana</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Waktu Pelaksanaan</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProkers.map(proker => (
                            <tr key={proker.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => handleProkerClick(proker)}>
                                <td className="py-4 px-6 text-gray-900 font-medium">{proker.title}</td>
                                <td className="py-4 px-6">
                                    <Badge status={proker.status === 'Active' ? 'On Progress' : proker.status} />
                                </td>
                                <td className="py-4 px-6 text-blue-600 text-sm">{proker.department?.name || proker.department_id || proker.department}</td>
                                <td className="py-4 px-6 w-48">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${proker.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${proker.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{proker.progress}%</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-blue-600 text-sm">{proker.leader?.name || proker.leader_name || proker.leader || '-'}</td>
                                <td className="py-4 px-6 text-blue-600 text-sm">{proker.deadline}</td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={(e) => handleDeleteProker(e, proker.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Proker"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Program Kerja">
                <div className="space-y-4">
                    <p className="text-gray-600">Are you sure you want to delete this program? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </Modal>

            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        </div>
    );
};

// SHARED FORM COMPONENT (Used for Create & Edit)
const ProkerForm = ({ mode, onSubmit, formProker, setFormProker, members, setView, resetForm, selectedProker }: any) => {
    const [newSie, setNewSie] = useState({ name: '', coordinator: '', staff: [] as string[] });
    const [staffInput, setStaffInput] = useState('');

    const addSie = () => {
        if (newSie.name && newSie.coordinator) {
            setFormProker({ ...formProker, sies: [...formProker.sies, newSie] });
            setNewSie({ name: '', coordinator: '', staff: [] });
        }
    };

    const removeSie = (idx: number) => {
        const updated = [...formProker.sies];
        updated.splice(idx, 1);
        setFormProker({ ...formProker, sies: updated });
    };

    const addStaffToSie = () => {
        if (staffInput) {
            setNewSie({ ...newSie, staff: [...newSie.staff, staffInput] });
            setStaffInput('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => {
                        if (mode === 'edit') setView('detail');
                        else setView('list');
                        resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Create Proker' : 'Edit Proker'}</h1>
                    <p className="text-gray-500 text-sm">{mode === 'create' ? 'Fill in the details to create a new program kerja.' : `Editing details for ${selectedProker?.title}`}</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Nama Proker */}
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Nama Proker (Project Name)</label>
                    <input
                        required
                        type="text"
                        placeholder="Enter project name"
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        value={formProker.title}
                        onChange={e => setFormProker({ ...formProker, title: e.target.value })}
                    />
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Deskripsi Proker (Project Description)</label>
                    <textarea
                        rows={5}
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                        value={formProker.description}
                        onChange={e => setFormProker({ ...formProker, description: e.target.value })}
                    />
                </div>

                {/* Tujuan */}
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Tujuan Proker (Project Objectives)</label>
                    <textarea
                        rows={4}
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                        value={formProker.objectives}
                        onChange={e => setFormProker({ ...formProker, objectives: e.target.value })}
                    />
                </div>

                {/* Manfaat */}
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Manfaat Proker (Project Benefits)</label>
                    <textarea
                        rows={4}
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                        value={formProker.benefits}
                        onChange={e => setFormProker({ ...formProker, benefits: e.target.value })}
                    />
                </div>

                {/* Dampak */}
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Dampak/Output yang dituju (Expected Impact/Output)</label>
                    <textarea
                        rows={4}
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                        value={formProker.impact}
                        onChange={e => setFormProker({ ...formProker, impact: e.target.value })}
                    />
                </div>

                {/* BPK Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mode === 'edit' && (
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Ketua Pelaksana</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                    value={formProker.leader}
                                    onChange={e => setFormProker({ ...formProker, leader: e.target.value })}
                                >
                                    <option value="">Select Leader</option>
                                    {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <ChevronRight className="rotate-90 text-gray-500" size={20} />
                                </div>
                            </div>
                        </div>
                    )}
                    {mode === 'edit' && (
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Sekretaris</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                    value={formProker.secretary}
                                    onChange={e => setFormProker({ ...formProker, secretary: e.target.value })}
                                >
                                    <option value="">Select Secretary</option>
                                    {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <ChevronRight className="rotate-90 text-gray-500" size={20} />
                                </div>
                            </div>
                        </div>
                    )}
                    {mode === 'edit' && (
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Bendahara</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                    value={formProker.treasurer}
                                    onChange={e => setFormProker({ ...formProker, treasurer: e.target.value })}
                                >
                                    <option value="">Select Treasurer</option>
                                    {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <ChevronRight className="rotate-90 text-gray-500" size={20} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Committee Management - Only for Edit */}
                {mode === 'edit' && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-bold text-gray-900">Susunan Kepanitiaan (Sies)</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input type="text" placeholder="Nama Sie (e.g. Sie Acara)" className="p-2 border rounded" value={newSie.name} onChange={e => setNewSie({ ...newSie, name: e.target.value })} />
                                <select className="p-2 border rounded" value={newSie.coordinator} onChange={e => setNewSie({ ...newSie, coordinator: e.target.value })}>
                                    <option value="">Select Coordinator</option>
                                    {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Add Staff Name" className="p-2 border rounded flex-1" value={staffInput} onChange={e => setStaffInput(e.target.value)} />
                                    <button type="button" onClick={addStaffToSie} className="bg-gray-200 px-3 rounded font-bold">+</button>
                                </div>
                            </div>
                            {newSie.staff.length > 0 && <p className="text-xs text-gray-500">Staff: {newSie.staff.join(', ')}</p>}
                            <button type="button" onClick={addSie} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm w-full">Add Sie</button>
                        </div>

                        {/* List of Added Sies */}
                        <div className="space-y-2">
                            {formProker.sies.map((sie: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                    <div>
                                        <p className="font-bold text-sm">{sie.name}</p>
                                        <p className="text-xs text-blue-600">Koord: {sie.coordinator}</p>
                                        <p className="text-xs text-gray-500">Staff: {sie.staff?.join(', ')}</p>
                                    </div>
                                    <button type="button" onClick={() => removeSie(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Updates (Only for Edit) */}
                {mode === 'edit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t pt-4">
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">Proposal Status</label>
                            <select className="w-full p-4 bg-slate-100 rounded-xl border-none" value={formProker.proposal_status} onChange={e => setFormProker({ ...formProker, proposal_status: e.target.value })}>
                                <option value="not_started">Not Started</option>
                                <option value="on_progress">On Progress</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-base font-bold text-gray-900">LPJ Status</label>
                            <select className="w-full p-4 bg-slate-100 rounded-xl border-none" value={formProker.lpj_status} onChange={e => setFormProker({ ...formProker, lpj_status: e.target.value })}>
                                <option value="not_started">Not Started</option>
                                <option value="on_progress">On Progress</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="block text-base font-bold text-gray-900">Department</label>
                        <div className="relative">
                            <select
                                className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
                                value={formProker.department}
                                onChange={e => setFormProker({ ...formProker, department: e.target.value })}
                            >
                                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <ChevronRight className="rotate-90 text-gray-500" size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-base font-bold text-gray-900">Waktu Pelaksanaan</label>
                        <input
                            type="date"
                            className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={formProker.deadline}
                            onChange={e => setFormProker({ ...formProker, deadline: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-8 gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (mode === 'edit') setView('detail');
                            else setView('list');
                            resetForm();
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors flex items-center">
                        <Save size={18} className="mr-2" />
                        {mode === 'create' ? 'Create Project' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
