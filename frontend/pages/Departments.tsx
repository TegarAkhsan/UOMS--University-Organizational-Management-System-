
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Users, ClipboardList, Settings, Plus, ChevronRight } from 'lucide-react';
import { Badge, Modal } from '../components/ui/Shared';
import { DEPARTMENTS, DEPARTMENT_TEXTS } from '../data/mockData';

export const Departments = ({ members, prokers, setProkers }: { members: any[], prokers: any[], setProkers?: (p: any[]) => void }) => {
    const [view, setView] = useState<'list' | 'detail' | 'create' | 'edit' | 'editProject'>('list');
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [projectForm, setProjectForm] = useState<any>({});

    // Local state to hold editable department texts
    const [deptTexts, setDeptTexts] = useState<any>(DEPARTMENT_TEXTS);

    const [formData, setFormData] = useState<any>({
        name: '', fullName: '', description: '', head: '', fungsi: '', arahan: ''
    });

    const handleCardClick = (dept: any) => {
        setSelectedDept(dept);
        setView('detail');
    };

    const handleEditClick = (dept: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const texts = deptTexts[dept.id] || { fungsi: '', arahan: [] };
        setFormData({
            id: dept.id,
            name: dept.name,
            fullName: dept.fullName,
            head: dept.head,
            fungsi: texts.fungsi,
            arahan: texts.arahan.join('\n')
        });
        setSelectedDept(dept);
        setView('edit');
    };

    const handleEditProjectClick = (project: any) => {
        setSelectedProject(project);
        setProjectForm({ ...project });
        setView('editProject');
    };

    const handleAddClick = () => {
        setFormData({ name: '', fullName: '', head: '', fungsi: '', arahan: '' });
        setView('create');
    };

    const handleSave = () => {
        if (view === 'edit' && selectedDept) {
            // Update the local state
            const updatedTexts = {
                ...deptTexts,
                [selectedDept.id]: {
                    fungsi: formData.fungsi,
                    arahan: formData.arahan.split('\n').filter((line: string) => line.trim() !== '')
                }
            };
            setDeptTexts(updatedTexts);

            // Also update basic info (mock update since we can't persist to file)
            selectedDept.name = formData.name;
            selectedDept.fullName = formData.fullName;
            selectedDept.head = formData.head;

            setView('detail');
        } else {
            // Create logic (mock)
            setView('list');
        }
    };

    const handleSaveProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (setProkers && selectedProject) {
            // Optimistic update
            const updatedProkers = prokers.map(p => p.id === selectedProject.id ? { ...projectForm } : p);
            setProkers(updatedProkers);

            // API Call
            import('../src/api/client').then(({ default: client }) => {
                client.put(`/programs/${selectedProject.id}`, projectForm)
                    .then(res => {
                        console.log('Project updated', res.data);
                    })
                    .catch(err => {
                        console.error('Failed to update project', err);
                        // Revert on failure if needed, or show alert
                        alert('Failed to save project changes to backend.');
                    });
            });
        }
        setView('detail');
    };

    // Moved components outside
    if (view === 'create') return <DepartmentForm mode="create" formData={formData} setFormData={setFormData} handleSave={handleSave} setView={setView} />;
    if (view === 'edit') return <DepartmentForm mode="edit" formData={formData} setFormData={setFormData} handleSave={handleSave} setView={setView} />;
    if (view === 'editProject') return <ProjectEditForm projectForm={projectForm} setProjectForm={setProjectForm} handleSaveProject={handleSaveProject} setView={setView} />;

    // DETAIL VIEW
    if (view === 'detail' && selectedDept) {
        const texts = deptTexts[selectedDept.id] || { fungsi: 'No description available.', arahan: [] };
        const deptProkers = prokers.filter(p => (p.department_id || p.department) === selectedDept.id);
        const deptMembers = members.filter(m => (m.department_id === selectedDept.id || m.dept === selectedDept.id));

        return (
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Department View</h1>
                    <p className="text-blue-500">Manage department details, staff, projects, and reports.</p>
                </div>

                <button
                    onClick={() => setView('list')}
                    className="text-gray-500 hover:text-gray-900 flex items-center mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>

                {/* Department Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-3xl font-bold text-gray-900">{selectedDept.fullName}</h3>
                        <p className="text-blue-600 text-lg">{selectedDept.head} (Head of Department)</p>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Fungsi Departemen</h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{texts.fungsi}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Arahan Kerja</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                    {texts.arahan.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={(e) => handleEditClick(selectedDept, e)}
                            className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                        >
                            <span>Edit Department Details</span>
                            <Edit size={14} />
                        </button>
                    </div>
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                            alt="Department Building"
                            className="rounded-xl w-full h-40 object-cover mb-4"
                        />
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Department ID</p>
                            <p className="font-bold text-gray-900 mb-4">DPT{selectedDept.id}</p>
                            <p className="text-sm text-gray-500 mb-1">Staff Count</p>
                            <p className="font-bold text-gray-900">{deptMembers.length} Members</p>
                        </div>
                    </div>
                </div>

                {/* Projects */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Department Projects</h2>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Project Name</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Progress</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptProkers.map(p => (
                                    <tr key={p.id} className="border-b border-gray-50">
                                        <td className="py-4 px-6 text-gray-900">{p.title}</td>
                                        <td className="py-4 px-6">
                                            <Badge status={p.status} />
                                        </td>
                                        <td className="py-4 px-6 w-1/3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${p.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${p.progress}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{p.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                className="text-blue-600 font-medium text-sm hover:underline"
                                                onClick={() => handleEditProjectClick(p)}
                                            >
                                                Edit Project
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Members */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Department Members</h2>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Name</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">NIM</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Role</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptMembers.map(m => (
                                    <tr key={m.id} className="border-b border-gray-50">
                                        <td className="py-4 px-6 text-blue-600 font-medium">{m.name}</td>
                                        <td className="py-4 px-6 text-gray-600">{m.nim}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {(() => {
                                                // 1. BPH Logic
                                                if (m.dept === 'BPH' || m.department_id === 'BPH' || m.department?.name === 'BPH') {
                                                    if (m.status === 'superadmin') return 'Ketua Himpunan';
                                                    if (m.status === 'sub_super_admin_1') return 'Bendahara Umum';
                                                    if (m.status === 'sub_super_admin_2') return 'Sekretaris Umum';
                                                }

                                                // 2. Head of Department Check
                                                if (selectedDept && m.name === selectedDept.head) {
                                                    return 'Ketua Departemen';
                                                }

                                                // 3. Normalize project roles to Department roles
                                                const projectRoles = ['staff_sie', 'coordinator_sie', 'sekretaris_bpk', 'bendahara_bpk', 'ketupel'];
                                                if (projectRoles.includes(m.role)) return 'Staff';

                                                return m.role;
                                            })()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="text-blue-600 font-medium text-sm hover:underline" onClick={() => setSelectedMember(m)}>View Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reuse existing Member Modal logic */}
                <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Profile">
                    {selectedMember && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                            <p>{selectedMember.nim}</p>
                            <p>{selectedMember.dept} - {selectedMember.role}</p>
                        </div>
                    )}
                </Modal>

            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                >
                    <Plus size={16} />
                    <span>Add Department</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEPARTMENTS.map(dept => (
                    <div
                        key={dept.id}
                        onClick={() => handleCardClick(dept)}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer flex flex-col items-start space-y-4 group relative"
                    >
                        {/* Manage Button on Card */}
                        <button
                            onClick={(e) => handleEditClick(dept, e)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10"
                            title="Manage Department"
                        >
                            <Settings size={18} />
                        </button>

                        <div className={`p-3 rounded-xl ${dept.color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                            <dept.icon size={28} />
                        </div>
                        <div className="w-full">
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{dept.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{dept.fullName}</p>
                        </div>
                        <div className="w-full pt-4 border-t border-gray-100 mt-2 flex justify-between text-sm text-gray-500 font-medium">
                            <span className="flex items-center"><Users size={14} className="mr-1" /> {members.filter(m => m.dept === dept.id || m.department_id === dept.id || m.department?.name === dept.id).length} Members</span>
                            <span className="flex items-center"><ClipboardList size={14} className="mr-1" /> {prokers.filter(p => (p.department_id || p.department) === dept.id).length} Projects</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DepartmentForm = ({ mode, formData, setFormData, handleSave, setView }: any) => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        <div className="flex items-center space-x-4 mb-6">
            <button
                onClick={() => setView(mode === 'edit' ? 'detail' : 'list')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Add New Department' : 'Edit Department'}</h1>
                <p className="text-gray-500 text-sm">{mode === 'create' ? 'Create a new department.' : `Editing ${formData.name}`}</p>
            </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Department Name (Short)</label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. PSDM"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Full Name</label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Pengembangan Sumber Daya Mahasiswa"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Head of Department</label>
                <input
                    type="text"
                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={formData.head}
                    onChange={e => setFormData({ ...formData, head: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Fungsi Departemen</label>
                <textarea
                    rows={4}
                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={formData.fungsi}
                    onChange={e => setFormData({ ...formData, fungsi: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Arahan Kerja (Line separated)</label>
                <textarea
                    rows={6}
                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={formData.arahan}
                    onChange={e => setFormData({ ...formData, arahan: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>

            <div className="flex justify-end pt-8">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
                    {mode === 'create' ? 'Create Department' : 'Save Changes'}
                </button>
            </div>
        </form>
    </div>
);

const ProjectEditForm = ({ projectForm, setProjectForm, handleSaveProject, setView }: any) => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        <div className="flex items-center space-x-4 mb-6">
            <button
                onClick={() => setView('detail')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                <p className="text-gray-500 text-sm">Update project details for {projectForm.title}</p>
            </div>
        </div>

        <form onSubmit={handleSaveProject} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200">
            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Project Name</label>
                <input
                    type="text"
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={projectForm.title}
                    onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Status</label>
                    <select
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        value={projectForm.status}
                        onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                    >
                        <option value="On Progress">On Progress</option>
                        <option value="Done">Done</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Progress (%) <span className="text-xs font-normal text-gray-500">(System Generated)</span></label>
                    <input
                        type="number"
                        disabled
                        className="w-full p-4 bg-gray-200 rounded-xl border-none text-gray-500 cursor-not-allowed"
                        value={projectForm.progress}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Leader Name</label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        value={projectForm.leader_name || ''}
                        onChange={e => setProjectForm({ ...projectForm, leader_name: e.target.value })}
                        placeholder="Project Leader"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-base font-bold text-gray-900">Deadline</label>
                    <input
                        type="date"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        value={projectForm.deadline || ''}
                        onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Description</label>
                <textarea
                    rows={3}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={projectForm.description || ''}
                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Objectives</label>
                <textarea
                    rows={3}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={projectForm.objectives || ''}
                    onChange={e => setProjectForm({ ...projectForm, objectives: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Benefits</label>
                <textarea
                    rows={3}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={projectForm.benefits || ''}
                    onChange={e => setProjectForm({ ...projectForm, benefits: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-base font-bold text-gray-900">Impact</label>
                <textarea
                    rows={3}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={projectForm.impact || ''}
                    onChange={e => setProjectForm({ ...projectForm, impact: e.target.value })}
                />
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
);