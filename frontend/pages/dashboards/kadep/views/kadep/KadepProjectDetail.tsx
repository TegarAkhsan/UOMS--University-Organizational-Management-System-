import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Trash2, ChevronDown, ChevronUp, Search, CheckCircle, Edit, Save, X, Plus, Clock, Check, CalendarDays } from 'lucide-react';
import { Card, Badge, Modal } from '../../../../../components/ui/Shared';
import { DashboardHeader } from '../../../../../components/DashboardHeader';
import { ProjectTabs } from '../../../../../components/ProjectTabs';
import { ProjectSecretaryView } from '../../../staff/views/ProjectSecretaryView';
import { ProjectTreasurerView } from '../../../staff/views/ProjectTreasurerView';

// BPH Roles to exclude from Manage Staff modal
const BPH_ROLES = [
    'Kahima', 'Ketua Himpunan',
    'Wakil Kahima', 'Wakil Ketua Himpunan', 'Wakahima',
    'Sekretaris Umum', 'Sekretaris 1', 'Sekretaris 2',
    'Bendahara Umum', 'Bendahara 1', 'Bendahara 2'
];

// Roles to exclude from BPK Assignment (Kadep roles)
const KADEP_ROLES = ['Kadep', 'Ketua Departemen', 'Kepala Departemen'];

// Helper function to add days to a date
const addDays = (dateStr: string, days: number): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const KadepProjectDetail = ({
    user,
    onLogout,
    setView,
    selectedItem,
    onUpdateProject,
    members,
    myDeptCode
}: any) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(selectedItem);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Local state for specific tab interactions that don't need immediate saving
    const [newSie, setNewSie] = useState('');
    const [newTask, setNewTask] = useState('');
    const [expandedSie, setExpandedSie] = useState<number | null>(null);
    const [selectedSieForStaff, setSelectedSieForStaff] = useState<any>(null);
    const [staffSearchTerm, setStaffSearchTerm] = useState('');

    // Sync formData with selectedItem when not editing
    useEffect(() => {
        if (!isEditing && selectedItem) {
            setFormData(JSON.parse(JSON.stringify(selectedItem))); // Deep copy to avoid reference issues
        }
    }, [selectedItem, isEditing]);

    const handleSave = () => {
        import('../../../../../src/api/client').then(({ default: client }) => {
            // Prepare payload - ensure we send IDs/Names correctly if backend expects them
            const payload = {
                ...formData,
                leader_name: formData.leader_name,
                secretary_name: formData.secretary_name,
                treasurer_name: formData.treasurer_name,
                // Ensure sies and tasks are included
                sies: formData.sies,
                tasks: formData.tasks,
                // Timeline fields
                timeline_konsep_start: formData.timeline_konsep_start,
                timeline_konsep_end: formData.timeline_konsep_end,
                timeline_persiapan_start: formData.timeline_persiapan_start,
                timeline_persiapan_end: formData.timeline_persiapan_end
            };

            client.put(`/programs/${selectedItem.id}`, payload)
                .then(res => {
                    const updated = res.data;
                    onUpdateProject(updated);
                    setIsEditing(false);
                    setSuccessMessage('Changes saved successfully!');
                    setShowSuccessModal(true);
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to save changes.');
                });
        });
    };

    const handleCancel = () => {
        setFormData(JSON.parse(JSON.stringify(selectedItem)));
        setIsEditing(false);
    };

    // --- HANDLERS FOR FORM DATA UPDATES ---

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    // Committee Handlers (Local State)
    const handleAddSie = () => {
        if (newSie) {
            const updatedSies = [...(formData.sies || []), { id: Date.now(), name: newSie, coordinator: '', staff: [], tupoksi: '' }];
            setFormData({ ...formData, sies: updatedSies });
            setNewSie('');
        }
    };

    const handleDeleteSie = (id: number) => {
        const updatedSies = formData.sies.filter((s: any) => s.id !== id);
        setFormData({ ...formData, sies: updatedSies });
    };

    const handleUpdateSie = (id: number, field: string, value: any) => {
        const updatedSies = formData.sies.map((s: any) => s.id === id ? { ...s, [field]: value } : s);
        setFormData({ ...formData, sies: updatedSies });
    };

    const handleToggleSieStaff = (sieId: number, memberName: string) => {
        // This is a bit tricky because it's inside a modal. 
        // If we are in "Edit Mode", we update formData.
        // If NOT in "Edit Mode", we might want to prevent changes or auto-save?
        // The user requested "Save" button for everything. So we should probably only allow this in Edit mode?
        // Or allow it always but require a "Save" action? 
        // Let's allow it but it only updates local state until "Save" is clicked if isEditing is true.
        // BUT, the modal is separate. Let's enforce Edit Mode for changing staff too.

        const sies = formData.sies || [];
        const sie = sies.find((s: any) => s.id === sieId);
        if (!sie) return;

        const exists = sie.staff.includes(memberName);
        let newStaff = exists ? sie.staff.filter((m: string) => m !== memberName) : [...sie.staff, memberName];

        const updatedSies = sies.map((s: any) => s.id === sieId ? { ...s, staff: newStaff } : s);
        setFormData({ ...formData, sies: updatedSies });

        // Update the selectedSieForStaff to reflect changes immediately in the modal
        setSelectedSieForStaff({ ...sie, staff: newStaff });
    };

    // Task Handlers
    const handleAddTask = () => {
        if (!newTask) return;
        const updatedTasks = [...(formData.tasks || []), { id: Date.now(), title: newTask, status: 'Pending' }];
        setFormData({ ...formData, tasks: updatedTasks });
        setNewTask('');
    };

    const handleToggleTask = (taskId: number) => {
        const tasks = formData.tasks || [];
        const updatedTasks = tasks.map((t: any) => t.id === taskId ? { ...t, status: t.status === 'Done' ? 'Pending' : 'Done' } : t);
        setFormData({ ...formData, tasks: updatedTasks });
    };

    const handleDeleteTask = (taskId: number) => {
        const updatedTasks = formData.tasks.filter((t: any) => t.id !== taskId);
        setFormData({ ...formData, tasks: updatedTasks });
    };

    // Helpers - Filter members: exclude BPH roles, show all functionaries
    const availableMembers = members.filter((m: any) => {
        const matchesSearch = staffSearchTerm === '' || m.name.toLowerCase().includes(staffSearchTerm.toLowerCase());
        // Exclude BPH roles
        const memberRole = m.role || '';
        const isNotBPH = !BPH_ROLES.some(bphRole => memberRole.toLowerCase().includes(bphRole.toLowerCase()));
        return matchesSearch && isNotBPH;
    });

    // Department staff only for BPK Assignment (exclude Kadep, only include same department staff)
    const deptStaffMembers = members.filter((m: any) => {
        const isDeptMember = m.dept === myDeptCode || m.department_id === myDeptCode;
        const memberRole = m.role || '';
        const isNotKadep = !KADEP_ROLES.some(kadepRole => memberRole.toLowerCase().includes(kadepRole.toLowerCase()));
        const isNotBPH = !BPH_ROLES.some(bphRole => memberRole.toLowerCase().includes(bphRole.toLowerCase()));
        return isDeptMember && isNotKadep && isNotBPH;
    });

    // Determine if we can edit
    const canEdit = true; // Kadep can always edit their own department projects

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-7xl mx-auto animate-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <Badge status={formData.status} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">{formData.title}</h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{formData.department?.name || formData.department || 'Unassigned'}</span>
                                <span>•</span>
                                <span className="flex items-center text-sm"><Calendar size={14} className="mr-1" /> {formData.deadline || 'No deadline'}</span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-colors flex items-center">
                                        <Save size={16} className="mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-sm transition-colors flex items-center">
                                    <Edit size={16} className="mr-2" /> Edit Project
                                </button>
                            )}
                        </div>
                    </div>

                    <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* TAB CONTENT */}
                    <div className="animate-fade-in mt-6">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    {/* Description Fields */}
                                    {['description', 'objectives', 'benefits', 'impact'].map((field) => (
                                        <div key={field}>
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">{field}</h3>
                                            {isEditing ? (
                                                <textarea
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    rows={4}
                                                    value={formData[field] || ''}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                                                    {formData[field] || '-'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {/* Project Leader Assignment */}
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                                        <p className="text-xs font-bold text-blue-500 uppercase mb-2">Project Leader</p>
                                        <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">👑</div>

                                        {isEditing ? (
                                            <select
                                                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-900 text-center cursor-pointer"
                                                value={formData.leader_name || ''}
                                                onChange={(e) => updateField('leader_name', e.target.value)}
                                            >
                                                <option value="">Select Leader</option>
                                                {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                            </select>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-bold text-blue-900">{formData.leader_name || formData.leader?.name || formData.leader || 'Unassigned'}</h3>
                                                <p className="text-sm text-blue-600">{formData.department?.name || formData.department || 'Unassigned'}</p>
                                            </>
                                        )}
                                    </div>

                                    {/* BPK Assignment */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                                        <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">BPK Assignment</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Sekretaris Pelaksana</label>
                                            {isEditing ? (
                                                <select
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                    value={formData.secretary_name || ''}
                                                    onChange={(e) => updateField('secretary_name', e.target.value)}
                                                >
                                                    <option value="">Select Secretary</option>
                                                    {deptStaffMembers.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                </select>
                                            ) : (
                                                <p className="font-bold text-gray-900 text-sm">{formData.secretary_name || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Bendahara Pelaksana</label>
                                            {isEditing ? (
                                                <select
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                    value={formData.treasurer_name || ''}
                                                    onChange={(e) => updateField('treasurer_name', e.target.value)}
                                                >
                                                    <option value="">Select Treasurer</option>
                                                    {deptStaffMembers.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                </select>
                                            ) : (
                                                <p className="font-bold text-gray-900 text-sm">{formData.treasurer_name || '-'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* COMMITTEE TAB */}
                        {activeTab === 'committee' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">Susunan Kepanitiaan</h3>
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="New Division Name" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" value={newSie} onChange={e => setNewSie(e.target.value)} />
                                            <button onClick={handleAddSie} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">+ Add Sie</button>
                                        </div>
                                    )}
                                </div>

                                {!formData.sies || formData.sies.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">No committee divisions created yet.</p>
                                        {isEditing && <p className="text-sm text-gray-400">Add a division (Sie) to start organizing your team.</p>}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {formData.sies.map((sie: any) => (
                                            <Card key={sie.id} className={`transition-all duration-300 border-gray-200 ${expandedSie === sie.id ? 'ring-2 ring-blue-100 shadow-md' : 'hover:shadow-sm'}`}>
                                                <div className="flex justify-between items-center cursor-pointer p-2" onClick={() => setExpandedSie(expandedSie === sie.id ? null : sie.id)}>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-lg font-bold text-gray-800">{sie.name}</h4>
                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{sie.staff.length} Staff</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isEditing && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSie(sie.id); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"><Trash2 size={16} /></button>
                                                        )}
                                                        {expandedSie === sie.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                                    </div>
                                                </div>
                                                {expandedSie === sie.id && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="block text-sm font-bold text-gray-700 mb-2">Coordinator</label>
                                                                {isEditing ? (
                                                                    <select
                                                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                                        value={sie.coordinator}
                                                                        onChange={(e) => handleUpdateSie(sie.id, 'coordinator', e.target.value)}
                                                                    >
                                                                        <option value="">Select Coordinator</option>
                                                                        {members.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <p className="text-sm text-gray-900 font-medium bg-gray-50 p-2 rounded-lg">{sie.coordinator || 'Unassigned'}</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-bold text-gray-700 mb-2">Tupoksi</label>
                                                                {isEditing ? (
                                                                    <textarea
                                                                        rows={2}
                                                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                                        placeholder="Define responsibilities..."
                                                                        value={sie.tupoksi}
                                                                        onChange={(e) => handleUpdateSie(sie.id, 'tupoksi', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{sie.tupoksi || '-'}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <label className="block text-sm font-bold text-gray-700">Assigned Staff</label>
                                                                {isEditing && (
                                                                    <button onClick={() => setSelectedSieForStaff(sie)} className="text-blue-600 text-xs font-bold hover:underline">+ Manage Staff</button>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {sie.staff.length > 0 ? sie.staff.map((staffName: string, idx: number) => <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center border border-gray-200">{staffName}</span>) : <p className="text-sm text-gray-400 italic">No staff assigned yet.</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TIMELINE TAB */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-8">
                                {/* Timeline Phases Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <CalendarDays className="text-blue-600" size={24} />
                                        <h3 className="text-xl font-bold text-gray-900">Timeline Kegiatan</h3>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="p-4 text-left text-sm font-bold text-gray-700">Fase Kegiatan</th>
                                                    <th className="p-4 text-left text-sm font-bold text-gray-700">Tanggal Mulai</th>
                                                    <th className="p-4 text-left text-sm font-bold text-gray-700">Tanggal Selesai</th>
                                                    <th className="p-4 text-center text-sm font-bold text-gray-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Konsep Kegiatan */}
                                                <tr className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                                                            <span className="font-medium text-gray-900">Konsep Kegiatan</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                                                value={formData.timeline_konsep_start || ''}
                                                                onChange={(e) => updateField('timeline_konsep_start', e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-600">{formData.timeline_konsep_start || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                                                value={formData.timeline_konsep_end || ''}
                                                                onChange={(e) => updateField('timeline_konsep_end', e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-600">{formData.timeline_konsep_end || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.timeline_konsep_start ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {formData.timeline_konsep_start ? 'Set' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Persiapan */}
                                                <tr className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-sm">2</div>
                                                            <span className="font-medium text-gray-900">Persiapan</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                                                value={formData.timeline_persiapan_start || ''}
                                                                onChange={(e) => updateField('timeline_persiapan_start', e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-600">{formData.timeline_persiapan_start || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                                                value={formData.timeline_persiapan_end || ''}
                                                                onChange={(e) => updateField('timeline_persiapan_end', e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-600">{formData.timeline_persiapan_end || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.timeline_persiapan_start ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {formData.timeline_persiapan_start ? 'Set' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Pelaksanaan (from deadline) */}
                                                <tr className="hover:bg-blue-50 bg-blue-50/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">H</div>
                                                            <div>
                                                                <span className="font-bold text-blue-900">Hari Pelaksanaan</span>
                                                                <p className="text-xs text-blue-600">Otomatis dari tanggal deadline</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4" colSpan={2}>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={16} className="text-blue-600" />
                                                            <span className="font-bold text-blue-900">{formData.deadline || 'Belum ditentukan'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.deadline ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {formData.deadline ? 'Auto' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* SPJ & LPJ (auto 5 days after) */}
                                                <tr className="hover:bg-purple-50 bg-purple-50/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">📋</div>
                                                            <div>
                                                                <span className="font-bold text-purple-900">Penyusunan SPJ & LPJ</span>
                                                                <p className="text-xs text-purple-600">Otomatis 5 hari setelah pelaksanaan</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-medium text-purple-700">
                                                            {formData.deadline ? addDays(formData.deadline, 1) : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-medium text-purple-700">
                                                            {formData.deadline ? addDays(formData.deadline, 5) : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.deadline ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {formData.deadline ? 'Auto' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tasks Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-gray-600" size={20} />
                                            <h3 className="text-lg font-bold text-gray-900">Tasks & Checklist</h3>
                                        </div>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add a new task..."
                                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-64"
                                                    value={newTask}
                                                    onChange={e => setNewTask(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                                />
                                                <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">Add</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        {!formData.tasks || formData.tasks.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Clock size={40} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 text-sm">No tasks added yet. {isEditing && 'Add tasks above.'}</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {formData.tasks.map((task: any, index: number) => (
                                                    <div key={task.id || index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${task.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                                                <p className="text-xs text-gray-500">Status: {task.status}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isEditing && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleToggleTask(task.id)}
                                                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${task.status === 'Done' ? 'bg-white border-gray-300 text-gray-500' : 'bg-green-50 border-green-200 text-green-600'}`}
                                                                    >
                                                                        {task.status === 'Done' ? 'Mark Pending' : 'Mark Done'}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {!isEditing && (
                                                                <Badge status={task.status} />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FINANCE TAB */}
                        {activeTab === 'finance' && (
                            <ProjectTreasurerView treasuryProker={selectedItem} />
                        )}

                        {/* DOCUMENTS TAB */}
                        {activeTab === 'documents' && (
                            <ProjectSecretaryView secretaryProker={selectedItem} />
                        )}

                    </div>
                </div>

                {/* Staff Selection Modal */}
                <Modal isOpen={!!selectedSieForStaff} onClose={() => { setSelectedSieForStaff(null); setStaffSearchTerm(''); }} title={`Manage Staff: ${selectedSieForStaff?.name}`}>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-full bg-transparent border-none outline-none text-sm"
                                value={staffSearchTerm}
                                onChange={(e) => setStaffSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {availableMembers.length > 0 ? availableMembers.map((m: any) => {
                                const isSelected = selectedSieForStaff?.staff.includes(m.name);
                                return (
                                    <div key={m.id} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`} onClick={() => handleToggleSieStaff(selectedSieForStaff.id, m.name)}>
                                        <div className="flex items-center gap-3">
                                            <img src={m.image} alt="" className="w-8 h-8 rounded-full" />
                                            <div><p className="font-bold text-sm text-gray-800">{m.name}</p><p className="text-xs text-gray-500">{m.dept}</p></div>
                                        </div>
                                        {isSelected && <CheckCircle size={18} className="text-blue-600" />}
                                    </div>
                                );
                            }) : <p className="text-center text-gray-500 italic py-2">No available members found.</p>}
                        </div>
                        <div className="flex justify-end pt-4"><button onClick={() => { setSelectedSieForStaff(null); setStaffSearchTerm(''); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Done</button></div>
                    </div>
                </Modal>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                            <div className="bg-green-600 p-6 text-center">
                                <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                    <Check size={32} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Success!</h3>
                                <p className="text-green-100 mt-2 text-sm">{successMessage}</p>
                            </div>
                            <div className="p-6">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
