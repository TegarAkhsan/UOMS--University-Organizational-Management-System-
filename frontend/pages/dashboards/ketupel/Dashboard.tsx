import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, Trash2, Edit, ChevronUp, ChevronDown, Search, CheckCircle, UserPlus, Save, FileText, Calendar, Info, X } from 'lucide-react';
import { Card, Modal, Badge } from '../../../components/ui/Shared';
import { Kanban } from '../../../components/Kanban';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ProjectLeaderView = ({ currentProker: propProker, members, user, setProkers, prokers, refreshData, activeTab = 'overview' }: any) => {
    // Derive currentProker if not passed (for direct Ketupel access)
    const currentProker = propProker || prokers?.find((p: any) => p.leader_name === user?.name || p.leader === user?.name);

    // Initialize Local State from Props
    const [sies, setSies] = useState<any[]>(currentProker?.sies || []);

    const [bpk, setBpk] = useState({
        secretary: currentProker?.secretary || currentProker?.secretary_name || '',
        treasurer: currentProker?.treasurer || currentProker?.treasurer_name || ''
    });

    const [timelineStages, setTimelineStages] = useState<{ stage: string, items: { id: number, name: string, daysBefore?: number, daysAfter?: number }[] }[]>(
        currentProker?.timeline || [
            { stage: 'Pra-Acara', items: [{ id: 1, name: 'Pembentukan Panitia', daysBefore: 30 }, { id: 2, name: 'Penyusunan Proposal', daysBefore: 25 }] },
            { stage: 'Hari H', items: [{ id: 3, name: 'Pelaksanaan', daysBefore: 0 }] },
            { stage: 'Pasca-Acara', items: [{ id: 4, name: 'Penyusunan LPJ', daysAfter: 7 }, { id: 5, name: 'Asistensi LPJ', daysAfter: 14 }] }
        ]);

    // IsDirty Check
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        // Simple deep comparison (can be optimized)
        const isSiesChanged = JSON.stringify(sies) !== JSON.stringify(currentProker?.sies || []);
        const isBpkChanged = bpk.secretary !== (currentProker?.secretary || currentProker?.secretary_name || '') || bpk.treasurer !== (currentProker?.treasurer || currentProker?.treasurer_name || '');
        const isTimelineChanged = JSON.stringify(timelineStages) !== JSON.stringify(currentProker?.timeline || []);

        setIsDirty(isSiesChanged || isBpkChanged || isTimelineChanged);
    }, [sies, bpk, timelineStages, currentProker]);

    // Temp State for UI
    const [newSie, setNewSie] = useState('');
    const [newTask, setNewTask] = useState({ title: '', deadline: '', sieId: 1 });
    const [selectedSieForStaff, setSelectedSieForStaff] = useState<any>(null);
    const [expandedSie, setExpandedSie] = useState<number | null>(null);
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [timelineForm, setTimelineForm] = useState({ stageIndex: 0, name: '', days: 0, type: 'before' });
    const [editingItem, setEditingItem] = useState<any>(null);
    // const [isEditingTimeline, setIsEditingTimeline] = useState(false); // Removed toggle state

    // Roadmap / Timeline State
    const [selectedPhaseTasks, setSelectedPhaseTasks] = useState<{ phaseName: string, tasks: any[] } | null>(null);

    // Review Tasks State
    const [reviewTasks, setReviewTasks] = useState<any[]>([]);
    const [selectedReviewTask, setSelectedReviewTask] = useState<any>(null);
    const [leaderRevisionNote, setLeaderRevisionNote] = useState('');
    const [showLeaderReviewModal, setShowLeaderReviewModal] = useState(false);

    // Sync BPK state when currentProker changes
    useEffect(() => {
        if (currentProker) {
            setBpk({
                secretary: currentProker.secretary || currentProker.secretary_name || '',
                treasurer: currentProker.treasurer || currentProker.treasurer_name || ''
            });
            setSies(currentProker.sies || []);
            setTimelineStages(currentProker.timeline || [
                { stage: 'Pra-Acara', items: [{ id: 1, name: 'Pembentukan Panitia', daysBefore: 30 }, { id: 2, name: 'Penyusunan Proposal', daysBefore: 25 }] },
                { stage: 'Hari H', items: [{ id: 3, name: 'Pelaksanaan', daysBefore: 0 }] },
                { stage: 'Pasca-Acara', items: [{ id: 4, name: 'Penyusunan LPJ', daysAfter: 7 }, { id: 5, name: 'Asistensi LPJ', daysAfter: 14 }] }
            ]);
        }
    }, [currentProker]);

    // Kanban State
    const [allTasks, setAllTasks] = useState<any[]>([]);

    useEffect(() => {
        if (currentProker?.id) {
            import('../../../src/api/client').then(({ default: client }) => {
                // Fetch review tasks
                client.get(`/tasks?program_id=${currentProker.id}&status=review_ketupel`)
                    .then(res => setReviewTasks(res.data))
                    .catch(err => console.error("Failed to fetch review tasks:", err));

                // Fetch all tasks for Kanban
                client.get(`/tasks?program_id=${currentProker.id}`)
                    .then(res => setAllTasks(res.data))
                    .catch(err => console.error("Failed to fetch all tasks:", err));
            });
        }
    }, [currentProker]);

    // Map tasks to simplified statuses for Kanban
    const kanbanTasks = allTasks.map(t => {
        let simpleStatus = 'ready';
        if (t.status === 'done') simpleStatus = 'done';
        else if (t.status !== 'ready') simpleStatus = 'in_progress';
        return { ...t, status: simpleStatus };
    });

    const handleLeaderReview = (status: 'approved' | 'revision') => {
        if (!selectedReviewTask) return;

        const updateData: any = { status: status === 'approved' ? 'review_kahima' : 'revision' };
        if (status === 'revision') {
            updateData.revision_note = leaderRevisionNote;
        }

        import('../../../src/api/client').then(({ default: client }) => {
            client.put(`/tasks/${selectedReviewTask.id}`, updateData).then(res => {
                setReviewTasks(reviewTasks.filter(t => t.id !== selectedReviewTask.id));
                setShowLeaderReviewModal(false);
                setLeaderRevisionNote('');
                alert(`Task ${status === 'approved' ? 'approved to Kahima' : 'returned for revision'}!`);
                // Refresh all tasks for Kanban
                client.get(`/tasks?program_id=${currentProker.id}`).then(r => setAllTasks(r.data));
            });
        });
    };

    // --- MAIN SAVE HANDLER ---
    const handleSaveChanges = () => {
        const updatedProker = {
            ...currentProker,
            secretary_name: bpk.secretary, // Map to backend field
            treasurer_name: bpk.treasurer, // Map to backend field
            secretary: bpk.secretary, // Keep for frontend consistency
            treasurer: bpk.treasurer, // Keep for frontend consistency
            sies: sies,
            timeline: timelineStages
        };

        import('../../../src/api/client').then(({ default: client }) => {
            client.put(`/programs/${currentProker.id}`, updatedProker)
                .then(res => {
                    // Update the global state
                    const updated = res.data;
                    const updatedProkersList = prokers.map((p: any) => p.id === currentProker.id ? updated : p);
                    setProkers(updatedProkersList);

                    alert("Project configuration saved! Roles and tasks have been updated for all members.");
                    setIsDirty(false);

                    // Refresh global data to reflect role changes
                    if (refreshData) {
                        refreshData();
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Failed to save changes. Please try again.");
                });
        });
    };

    // --- EXPORT PDF HANDLER ---
    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text(`Divisi (Sie) Management Report: ${currentProker?.title || 'Project'}`, 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Summary Table
        const tableData = sies.map((sie, index) => [
            index + 1,
            sie.name,
            sie.coordinator || '-',
            sie.staff.length,
            (sie.tasks || []).length
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['No', 'Sie Name', 'Coordinator', 'Staff Count', 'Tasks Count']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [66, 135, 245] }, // Blue header
        });

        // Detailed Tables for each Sie
        let finalY = (doc as any).lastAutoTable.finalY + 15;

        sies.forEach((sie) => {
            // Check if we need a new page
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            doc.setFontSize(14);
            doc.text(`Sie: ${sie.name}`, 14, finalY);
            finalY += 5;

            doc.setFontSize(10);
            doc.text(`Coordinator: ${sie.coordinator || '-'}`, 14, finalY);
            finalY += 5;
            doc.text(`Tupoksi: ${sie.tupoksi || '-'}`, 14, finalY);
            finalY += 10;

            // Staff List
            const staffData = sie.staff.map((s: string) => [s]);
            if (staffData.length > 0) {
                autoTable(doc, {
                    startY: finalY,
                    head: [['Assigned Staff']],
                    body: staffData,
                    theme: 'striped',
                    margin: { left: 14, right: 100 }, // Narrow table
                });
                finalY = (doc as any).lastAutoTable.finalY + 10;
            } else {
                doc.text('No staff assigned.', 14, finalY);
                finalY += 10;
            }
        });

        doc.save(`Divisi_Report_${currentProker?.title || 'Project'}.pdf`);
    };

    // --- HANDLERS ---
    const handleAddSie = () => {
        if (newSie) {
            setSies([...sies, { id: Date.now(), name: newSie, coordinator: '', staff: [], tupoksi: '', tasks: [] }]);
            setNewSie('');
        }
    };
    const handleDeleteSie = (id: number) => setSies(sies.filter(s => s.id !== id));
    const handleUpdateSie = (id: number, field: string, value: any) => setSies(sies.map(s => s.id === id ? { ...s, [field]: value } : s));

    const handleAddTask = (sieId: number) => {
        if (!newTask.title) return;
        const updatedSies = sies.map(s => {
            if (s.id === sieId) {
                return { ...s, tasks: [...(s.tasks || []), { id: Date.now(), title: newTask.title, deadline: newTask.deadline, status: 'ready', description: 'New task assigned.' }] };
            }
            return s;
        });
        setSies(updatedSies);
        setNewTask({ title: '', deadline: '', sieId: 1 });
    };

    const handleToggleSieStaff = (sieId: number, memberName: string) => {
        const sie = sies.find(s => s.id === sieId);
        if (!sie) return;
        const exists = sie.staff.includes(memberName);
        let newStaff = exists ? sie.staff.filter((m: string) => m !== memberName) : [...sie.staff, memberName];
        handleUpdateSie(sieId, 'staff', newStaff);
    };

    const handleSaveTimelineItem = () => {
        const updatedStages = [...timelineStages];
        const stage = updatedStages[timelineForm.stageIndex];

        const newItem: { id: number, name: string, daysBefore?: number, daysAfter?: number } = {
            id: editingItem ? editingItem.id : Date.now(),
            name: timelineForm.name
        };

        if (timelineForm.type === 'before') {
            newItem.daysBefore = timelineForm.days;
        } else {
            newItem.daysAfter = timelineForm.days;
        }

        if (editingItem) {
            const idx = stage.items.findIndex(i => i.id === editingItem.id);
            if (idx !== -1) stage.items[idx] = newItem;
        } else {
            stage.items.push(newItem);
        }

        setTimelineStages(updatedStages);
        setShowTimelineModal(false);
        setEditingItem(null);
    };

    const handleDeleteTimelineItem = (stageIndex: number, itemId: number) => {
        const updatedStages = [...timelineStages];
        updatedStages[stageIndex].items = updatedStages[stageIndex].items.filter(i => i.id !== itemId);
        setTimelineStages(updatedStages);
    };

    const openTimelineModal = (stageIdx: number, item: any = null) => {
        setEditingItem(item);
        setTimelineForm({
            stageIndex: stageIdx,
            name: item ? item.name : '',
            days: item ? (item.daysBefore !== undefined ? item.daysBefore : item.daysAfter) : 0,
            type: item ? (item.daysBefore !== undefined ? 'before' : 'after') : (stageIdx === 2 ? 'after' : 'before')
        });
        setShowTimelineModal(true);
    };

    // Filter available members: Exclude self and BPH
    const availableMembers = members.filter((m: any) => {
        const isNotSelf = m.name !== user.name;
        const isNotBPH = m.dept !== 'BPH';
        const matchesSearch = staffSearchTerm === '' || m.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) || m.dept.toLowerCase().includes(staffSearchTerm.toLowerCase());
        return isNotSelf && isNotBPH && matchesSearch;
    });

    // --- TIMELINE / ROADMAP CALCULATIONS (Top Level) ---
    // Assume event date is 30 days from now for visualization base
    const eventDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
    }, []);

    // Calculate Phase Dates
    const phases = useMemo(() => {
        const praAcaraItems = timelineStages.find(s => s.stage === 'Pra-Acara')?.items || [];
        const pascaAcaraItems = timelineStages.find(s => s.stage === 'Pasca-Acara')?.items || [];

        const maxDaysBefore = Math.max(...praAcaraItems.map(i => i.daysBefore || 0), 30); // Default at least 30 days
        const maxDaysAfter = Math.max(...pascaAcaraItems.map(i => i.daysAfter || 0), 14); // Default at least 14 days

        const startDate = new Date(eventDate);
        startDate.setDate(startDate.getDate() - maxDaysBefore);

        const endDate = new Date(eventDate);
        endDate.setDate(endDate.getDate() + maxDaysAfter);

        return [
            { name: 'Pra-Acara', start: startDate, end: new Date(eventDate.getTime() - 86400000), color: 'bg-blue-200 text-blue-800 border-blue-300' },
            { name: 'Hari H', start: eventDate, end: eventDate, color: 'bg-red-500 text-white border-red-600' },
            { name: 'Pasca-Acara', start: new Date(eventDate.getTime() + 86400000), end: endDate, color: 'bg-green-200 text-green-800 border-green-300' }
        ];
    }, [eventDate, timelineStages]);

    // --- TIMELINE / ROADMAP VISUALIZATION ---
    const renderTimelineView = () => {
        // Helper to get position %
        const getPosition = (date: Date) => {
            const totalDuration = phases[2].end.getTime() - phases[0].start.getTime();
            const offset = date.getTime() - phases[0].start.getTime();
            return (offset / totalDuration) * 100;
        };

        // Helper to get width %
        const getWidth = (start: Date, end: Date) => {
            const totalDuration = phases[2].end.getTime() - phases[0].start.getTime();
            const duration = end.getTime() - start.getTime();
            // Minimum width for visibility (e.g., 1 day)
            const minWidth = (86400000 / totalDuration) * 100;
            return Math.max((duration / totalDuration) * 100, minWidth);
        };

        // Aggregate Tasks for Inspection
        const handlePhaseClick = (phase: any) => {
            const activeTasks: any[] = [];
            sies.forEach(sie => {
                (sie.tasks || []).forEach((task: any) => {
                    const taskDate = new Date(task.deadline);
                    // Simple check if task deadline falls within phase (or close to it)
                    if (taskDate >= phase.start && taskDate <= phase.end) {
                        activeTasks.push({ ...task, sieName: sie.name });
                    }
                });
            });
            setSelectedPhaseTasks({ phaseName: phase.name, tasks: activeTasks });
        };

        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center"><Clock className="mr-2 text-blue-600" /> Project Timeline & Roadmap</h3>
                </div>

                {/* 1. List View for Editing (Always Visible) */}
                <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-gray-900">Project Phases (Timeline)</h4>
                    </div>
                    {timelineStages.map((stage, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-blue-200">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-900">{stage.stage}</h4>
                                <button onClick={() => openTimelineModal(idx)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-blue-600 font-bold">+ Add Item</button>
                            </div>
                            <div className="space-y-2">
                                {stage.items.map((item: any, i) => (
                                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm group">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{item.daysBefore !== undefined ? `H-${item.daysBefore}` : `H+${item.daysAfter}`}</span>
                                            <button onClick={() => openTimelineModal(idx, item)} className="p-1 text-gray-400 hover:text-blue-500"><Edit size={12} /></button>
                                            <button onClick={() => handleDeleteTimelineItem(idx, item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. GANTT CHART CONTAINER (Roadmap) */}
                <div className="border-t pt-8">
                    <h4 className="font-bold text-lg text-gray-900 mb-6 flex items-center"><Calendar className="mr-2 text-blue-600" /> Roadmap Visualization (Gantt)</h4>
                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[1000px] relative">
                            {/* Header: Dates */}
                            <div className="flex border-b border-gray-200 pb-2 mb-4 text-xs text-gray-500 font-mono">
                                <span className="flex-1 text-left">{phases[0].start.toLocaleDateString()}</span>
                                <span className="flex-1 text-center">Roadmap Timeline</span>
                                <span className="flex-1 text-right">{phases[2].end.toLocaleDateString()}</span>
                            </div>

                            {/* Global Phases Bars */}
                            <div className="h-12 relative mb-8 w-full bg-gray-50 rounded-lg overflow-hidden flex">
                                {phases.map((phase, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handlePhaseClick(phase)}
                                        className={`h-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:opacity-90 ${phase.color}`}
                                        style={{ width: `${getWidth(phase.start, phase.end)}%` }}
                                        title={`Click to see tasks in ${phase.name}`}
                                    >
                                        {phase.name}
                                    </div>
                                ))}
                            </div>

                            {/* Division Rows (Swimlanes) */}
                            <div className="space-y-4">
                                {sies.map((sie) => (
                                    <div key={sie.id} className="relative group">
                                        {/* Row Label */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-700 w-32 truncate" title={sie.name}>{sie.name}</span>
                                            <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        </div>

                                        {/* Task Track */}
                                        <div className="h-8 bg-gray-50 rounded relative w-full border border-gray-100">
                                            {(sie.tasks || []).map((task: any) => {
                                                const taskDate = new Date(task.deadline);
                                                // Clamp date to view range
                                                if (taskDate < phases[0].start || taskDate > phases[2].end) return null;

                                                const left = getPosition(taskDate);
                                                // Simulate duration of 3 days for visualization if only deadline exists
                                                const width = 3; // %

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="absolute top-1 h-6 rounded bg-blue-500 border border-blue-600 shadow-sm cursor-pointer hover:bg-blue-600 transition-colors group/task"
                                                        style={{ left: `${left}%`, width: `${width}%`, maxWidth: '100px', minWidth: '20px' }}
                                                    >
                                                        {/* Tooltip */}
                                                        <div className="hidden group-hover/task:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded z-20 pointer-events-none">
                                                            <p className="font-bold">{task.title}</p>
                                                            <p className="opacity-80">Deadline: {task.deadline}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Current Time Indicator (Vertical Line) */}
                            <div className="absolute top-0 bottom-0 w-[2px] bg-red-400 opacity-50 pointer-events-none z-0" style={{ left: `${getPosition(new Date())}%` }}>
                                <span className="absolute -top-4 -left-6 text-[10px] text-red-500 font-bold bg-white px-1">Today</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phase Task Inspection Modal */}
                <Modal isOpen={!!selectedPhaseTasks} onClose={() => setSelectedPhaseTasks(null)} title={`Tasks in Phase: ${selectedPhaseTasks?.phaseName}`}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {selectedPhaseTasks?.tasks.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No tasks scheduled for this phase.</p>
                        ) : (
                            selectedPhaseTasks?.tasks.map((task, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{task.title}</p>
                                        <p className="text-xs text-gray-500">Division: <span className="font-medium text-blue-600">{task.sieName}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-700">{task.deadline}</p>
                                        <Badge status={task.status} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in relative pb-20">

            {/* Floating Save Button */}
            {isDirty && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
                    <button
                        onClick={handleSaveChanges}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 flex items-center transition-transform hover:scale-105"
                    >
                        <Save className="mr-2" /> Save Configuration
                    </button>
                </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    {/* Task Review Section */}
                    {reviewTasks.length > 0 && (
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                            <h3 className="text-xl font-bold text-purple-900 flex items-center mb-4">
                                <CheckCircle className="mr-2 text-purple-600" /> Tasks Pending Approval
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {reviewTasks.map(task => (
                                    <Card key={task.id} className="p-4 bg-white border border-purple-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{task.title}</h4>
                                                <p className="text-sm text-gray-600">Assigned to: <strong>{task.assigned_to}</strong></p>
                                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                                {task.submission_link && (
                                                    <a href={task.submission_link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-1 block">View Submission Link</a>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setSelectedReviewTask(task); setShowLeaderReviewModal(true); }}
                                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project Overview Kanban */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                            <Clock className="mr-2 text-blue-600" /> Project Task Overview
                        </h3>
                        <Kanban
                            tasks={kanbanTasks}
                            onUpdateTask={() => { }}
                            isEditable={false}
                            allowMarkDone={false}
                            customColumns={[
                                { id: 'ready', title: 'Ready to Start', color: 'bg-gray-100 border-gray-200' },
                                { id: 'in_progress', title: 'On Progress', color: 'bg-blue-50 border-blue-200' },
                                { id: 'done', title: 'Completed', color: 'bg-green-50 border-green-200' }
                            ]}
                        />
                    </div>
                </>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && renderTimelineView()}

            {/* MEMBERS TAB */}
            {activeTab === 'members' && (
                <>
                    {/* BPK Management Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6"><UserPlus className="mr-2 text-purple-600" /> BPK Management (Badan Pengurus Kegiatan)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Sekretaris Pelaksana</label>
                                <select
                                    className="w-full p-3 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={bpk.secretary}
                                    onChange={(e) => setBpk({ ...bpk, secretary: e.target.value })}
                                >
                                    <option value="">Select Secretary</option>
                                    {availableMembers.map((m: any) => (
                                        <option key={m.id} value={m.name}>{m.name} ({m.dept})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Bendahara Pelaksana</label>
                                <select
                                    className="w-full p-3 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={bpk.treasurer}
                                    onChange={(e) => setBpk({ ...bpk, treasurer: e.target.value })}
                                >
                                    <option value="">Select Treasurer</option>
                                    {availableMembers.map((m: any) => (
                                        <option key={m.id} value={m.name}>{m.name} ({m.dept})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Sie Management Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center"><Users className="mr-2 text-blue-600" /> Divisi (Sie) Management</h3>
                            <div className="flex gap-2">
                                <button onClick={handleExportPDF} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2">
                                    <FileText size={16} /> Export PDF
                                </button>
                                <input type="text" placeholder="New Division Name" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" value={newSie} onChange={e => setNewSie(e.target.value)} />
                                <button onClick={handleAddSie} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">+ Add Sie</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {sies.map((sie) => (
                                <Card key={sie.id} className={`transition-all duration-300 ${expandedSie === sie.id ? 'ring-2 ring-blue-100' : ''}`}>
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedSie(expandedSie === sie.id ? null : sie.id)}>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-bold text-gray-800">{sie.name}</h4>
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{sie.staff.length} Staff</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{(sie.tasks || []).length} Tasks</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSie(sie.id); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"><Trash2 size={16} /></button>
                                            {expandedSie === sie.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                        </div>
                                    </div>
                                    {
                                        expandedSie === sie.id && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">Coordinator (Excl. BPH)</label>
                                                        <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg" value={sie.coordinator} onChange={(e) => handleUpdateSie(sie.id, 'coordinator', e.target.value)}>
                                                            <option value="">Select Coordinator</option>
                                                            {availableMembers.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tupoksi</label>
                                                        <textarea rows={2} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Define responsibilities..." value={sie.tupoksi} onChange={(e) => handleUpdateSie(sie.id, 'tupoksi', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-2"><label className="block text-sm font-bold text-gray-700">Assigned Staff</label><button onClick={() => setSelectedSieForStaff(sie)} className="text-blue-600 text-xs font-bold hover:underline">+ Manage Staff</button></div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sie.staff.length > 0 ? sie.staff.map((staffName: string, idx: number) => <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">{staffName}</span>) : <p className="text-sm text-gray-400 italic">No staff assigned yet.</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tasks & Deadlines</label>
                                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                        {(sie.tasks || []).map((task: any) => (
                                                            <div key={task.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                                                                <span className="text-sm font-medium text-gray-800">{task.title}</span>
                                                                <div className="flex items-center gap-3"><span className="text-xs text-gray-500">{task.deadline}</span></div>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2 pt-2">
                                                            <input type="text" placeholder="New Task" className="flex-1 p-2 text-sm border border-gray-300 rounded-lg" value={newTask.sieId === sie.id ? newTask.title : ''} onChange={(e) => setNewTask({ ...newTask, title: e.target.value, sieId: sie.id })} />
                                                            <input type="date" className="w-32 p-2 text-sm border border-gray-300 rounded-lg" value={newTask.sieId === sie.id ? newTask.deadline : ''} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value, sieId: sie.id })} />
                                                            <button onClick={() => handleAddTask(sie.id)} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-green-700">Add</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Modal isOpen={showTimelineModal} onClose={() => setShowTimelineModal(false)} title="Edit Timeline Item">
                <div className="space-y-4">
                    <div><label className="block text-sm font-bold text-gray-700">Activity Name</label><input type="text" className="w-full p-2 border rounded" value={timelineForm.name} onChange={e => setTimelineForm({ ...timelineForm, name: e.target.value })} /></div>
                    <div className="flex gap-2">
                        <div className="flex-1"><label className="block text-sm font-bold text-gray-700">Timing (Days)</label><input type="number" className="w-full p-2 border rounded" value={timelineForm.days} onChange={e => setTimelineForm({ ...timelineForm, days: parseInt(e.target.value) })} /></div>
                        <div className="flex-1"><label className="block text-sm font-bold text-gray-700">Type</label><select className="w-full p-2 border rounded" value={timelineForm.type} onChange={e => setTimelineForm({ ...timelineForm, type: e.target.value })}><option value="before">Before Event (H-)</option><option value="after">After Event (H+)</option></select></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveTimelineItem} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save</button></div>
                </div>
            </Modal>

            <Modal isOpen={!!selectedSieForStaff} onClose={() => { setSelectedSieForStaff(null); setStaffSearchTerm(''); }} title={`Manage Staff: ${selectedSieForStaff?.name}`}>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <Search className="text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search members (excluding BPH)..."
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

            {/* Leader Review Modal */}
            <Modal isOpen={showLeaderReviewModal} onClose={() => setShowLeaderReviewModal(false)} title="Review Task (Ketua Pelaksana)">
                <div className="space-y-4">
                    <p>Reviewing task: <strong>{selectedReviewTask?.title}</strong></p>
                    <div>
                        <label className="block text-sm font-bold mb-1">Revision Note (if rejecting)</label>
                        <textarea className="w-full p-2 border rounded-lg" rows={3} value={leaderRevisionNote} onChange={e => setLeaderRevisionNote(e.target.value)} placeholder="Explain what needs to be fixed..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => handleLeaderReview('revision')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Request Revision</button>
                        <button onClick={() => handleLeaderReview('approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Approve to Kahima</button>
                    </div>
                </div>
            </Modal>

            <div className="hidden">
                <Badge status="dummy" />
            </div>
        </div>
    );
};