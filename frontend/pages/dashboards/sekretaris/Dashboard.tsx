import React, { useState, useMemo, useEffect } from 'react';
import { Card, Badge, Modal } from '../../../components/ui/Shared';
import { REQUIRED_DOCS, DEPARTMENTS } from '../../../data/mockData';
import { Check, X, Bell, FileText, Send, ArrowLeft, Download, Eye, Inbox, Hash, Settings, Plus, Users, Edit, Menu, LogOut, LayoutDashboard, FolderArchive, MessageSquare, ClipboardList } from 'lucide-react';
import client from '../../../src/api/client';

export const SekretarisDashboard = ({ user, onLogout }: any) => {
    const [view, setView] = useState<'overview' | 'asistensi' | 'suratMasuk' | 'suratKeluar' | 'archives' | 'prokerDetail' | 'requests'>('overview');
    const [selectedProker, setSelectedProker] = useState<any>(null);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newTemplate, setNewTemplate] = useState({ title: '', description: '', file: null });
    const [requestFile, setRequestFile] = useState<File | null>(null);
    const [inbox, setInbox] = useState<any[]>([]);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState('');
    const [programs, setPrograms] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    // Settings State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settings, setSettings] = useState({
        letter_format: '{no}/HIMA/{roman_month}/{year}',
        last_letter_number: 0,
        auto_generate_letters: false
    });

    // Letter Management State
    const [lettersMasuk, setLettersMasuk] = useState<any[]>([]);
    const [lettersKeluar, setLettersKeluar] = useState<any[]>([]);
    const [showLetterModal, setShowLetterModal] = useState(false);
    const [letterForm, setLetterForm] = useState<any>({
        type: 'Masuk',
        no: '',
        subject: '',
        sender: '',
        recipient: '',
        date: '',
        category: 'Internal',
        file: null,
        auto_generate: false
    });

    useEffect(() => {
        fetchInbox();
        fetchRequests();
        fetchTemplates();
        fetchPrograms();
        fetchSettings();
        fetchLetters();
    }, []);

    const fetchSettings = () => {
        client.get('/settings').then(res => {
            const data = res.data;
            setSettings({
                letter_format: data.letter_format || '{no}/HIMA/{roman_month}/{year}',
                last_letter_number: parseInt(data.last_letter_number || '0'),
                auto_generate_letters: data.auto_generate_letters === '1' || data.auto_generate_letters === true
            });
        });
    };

    const fetchLetters = () => {
        client.get('/letters?type=Masuk').then(res => setLettersMasuk(res.data));
        client.get('/letters?type=Keluar').then(res => setLettersKeluar(res.data));
    };

    const fetchInbox = () => {
        Promise.all([
            client.get('/letters?status=pending_assistance'),
            client.get('/letters?status=pending_bph_sign')
        ]).then(([res1, res2]) => {
            setInbox([...res1.data, ...res2.data]);
        });
    };

    const fetchRequests = () => {
        client.get('/letter-requests').then(res => setRequests(res.data));
    };

    const fetchTemplates = () => {
        client.get('/document-templates').then(res => setTemplates(res.data));
    };

    const fetchPrograms = () => {
        client.get('/programs').then(res => setPrograms(res.data));
    };

    const saveSettings = () => {
        client.put('/settings', {
            settings: {
                letter_format: settings.letter_format,
                last_letter_number: settings.last_letter_number,
                auto_generate_letters: settings.auto_generate_letters
            }
        }).then(() => {
            alert('Settings saved successfully!');
            setShowSettingsModal(false);
        });
    };

    const handleLetterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(letterForm).forEach(key => {
            if (key === 'file' && letterForm[key]) {
                formData.append('file', letterForm[key]);
            } else {
                formData.append(key, letterForm[key]);
            }
        });

        if (letterForm.type === 'Keluar' && settings.auto_generate_letters) {
            formData.append('auto_generate', '1');
        }

        client.post('/letters', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            alert('Letter saved successfully!');
            setShowLetterModal(false);
            fetchLetters();
            setLetterForm({ type: 'Masuk', no: '', subject: '', sender: '', recipient: '', date: '', category: 'Internal', file: null, auto_generate: false });
        });
    };

    const handleApprove = (id: number) => {
        if (confirm("Approve and send to Kahima for signature?")) {
            client.put(`/letters/${id}`, { status: 'pending_kahima_sign' })
                .then(() => {
                    alert("Document forwarded to Kahima.");
                    fetchInbox();
                });
        }
    };

    const handleFinalSign = (id: number) => {
        if (confirm("Sign and complete this document?")) {
            client.put(`/letters/${id}`, { status: 'completed' })
                .then(() => {
                    alert("Document signed and completed.");
                    fetchInbox();
                });
        }
    };

    const openRejectModal = (id: number) => {
        setSelectedLetterId(id);
        setRejectModalOpen(true);
    };

    const handleReject = () => {
        if (selectedLetterId && feedback) {
            client.put(`/letters/${selectedLetterId}`, { status: 'revision', feedback: feedback })
                .then(() => {
                    alert("Document returned for revision.");
                    setRejectModalOpen(false);
                    setFeedback('');
                    fetchInbox();
                });
        }
    };

    const handleUploadRequest = (id: number) => {
        if (!requestFile) return;
        const formData = new FormData();
        formData.append('file', requestFile);

        client.post(`/letter-requests/${id}?_method=PUT`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            alert("Letter uploaded successfully!");
            setRequestFile(null);
            fetchRequests();
        });
    };

    const handleAddTemplate = () => {
        if (!newTemplate.title || !newTemplate.file) return;
        const formData = new FormData();
        formData.append('title', newTemplate.title);
        formData.append('description', newTemplate.description);
        // @ts-ignore
        formData.append('file', newTemplate.file);

        client.post('/document-templates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            alert("Template added successfully!");
            setNewTemplate({ title: '', description: '', file: null });
            fetchTemplates();
        });
    };

    const handleProkerClick = (proker: any) => {
        setSelectedProker(proker);
        setView('prokerDetail');
    };

    const handleViewDocument = (doc: any) => {
        setSelectedDocument(doc);
    };

    const handleToggleArchive = (programId: number, isArchived: boolean) => {
        const updatedPrograms = programs.map(p => p.id === programId ? { ...p, is_archived: isArchived } : p);
        setPrograms(updatedPrograms);

        client.put(`/programs/${programId}`, { is_archived: isArchived })
            .catch(err => {
                console.error("Failed to update archive status", err);
                alert("Failed to update archive status. Please try again.");
                fetchPrograms();
            });
    };

    // Helper to change view and auto-close sidebar on mobile
    const handleViewChange = (newView: typeof view) => {
        setView(newView);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'suratMasuk', icon: Inbox, label: 'Surat Masuk', count: lettersMasuk.length },
        { id: 'suratKeluar', icon: Send, label: 'Surat Keluar', count: lettersKeluar.length },
        { id: 'asistensi', icon: FileText, label: 'Asistensi', count: inbox.length },
        { id: 'requests', icon: MessageSquare, label: 'Permintaan Surat', count: requests.filter(r => r.status === 'pending').length },
        { id: 'archives', icon: FolderArchive, label: 'Templates' },
    ];

    // --- PROKER DETAIL VIEW ---
    if (view === 'prokerDetail' && selectedProker) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <button onClick={() => setView('overview')} className="text-gray-500 hover:text-gray-900 flex items-center mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button>

                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{selectedProker.title}</h1>
                            <p className="text-gray-500 text-sm">Administration Tracking & Committee</p>
                        </div>
                        <Badge status={selectedProker.status} />
                    </div>

                    {/* Committee Section */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 flex items-center mb-3"><Users className="mr-2" size={18} /> Susunan Kepanitiaan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-blue-500 font-bold">Ketua Pelaksana</p>
                                <p className="font-bold text-gray-800">{selectedProker.leader_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-500 font-bold">Sekretaris</p>
                                <p className="font-bold text-gray-800">{selectedProker.secretary_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-500 font-bold">Bendahara</p>
                                <p className="font-bold text-gray-800">{selectedProker.treasurer_name || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Tracker */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-xs font-bold text-gray-500">Proposal</p>
                            <Badge status={selectedProker.proposal_status || 'not_started'} />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-xs font-bold text-gray-500">LPJ</p>
                            <Badge status={selectedProker.lpj_status || 'not_started'} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                        <ClipboardList size={24} />
                        <span>Sekretaris</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 p-1">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleViewChange(item.id as typeof view)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${view === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{item.count}</span>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
                    >
                        <Settings size={18} />
                        <span>Pengaturan</span>
                    </button>
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {user.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Sekretaris Dashboard</h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <h1 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">Sekretaris BPH Dashboard</h1>

                    {view === 'overview' && (
                        <>
                            {/* Stats Cards - Stack on mobile */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="flex items-center space-x-4 border-l-4 border-l-green-500">
                                    <div className="p-3 bg-green-100 rounded-full text-green-600"><Inbox size={20} /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Surat Masuk</p>
                                        <h3 className="text-xl font-bold text-gray-900">{lettersMasuk.length}</h3>
                                    </div>
                                </Card>
                                <Card className="flex items-center space-x-4 border-l-4 border-l-blue-500">
                                    <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Send size={20} /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Surat Keluar</p>
                                        <h3 className="text-xl font-bold text-gray-900">{lettersKeluar.length}</h3>
                                    </div>
                                </Card>
                                <Card className="border-l-4 border-l-purple-500">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Hash size={16} /></div>
                                        <span className="text-sm text-gray-500 font-medium">Auto-Gen</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${settings.auto_generate_letters ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {settings.auto_generate_letters ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-xs text-gray-500">No: {settings.last_letter_number}</span>
                                    </div>
                                </Card>
                            </div>

                            {/* Proker Tracker Table - Scrollable */}
                            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex-shrink-0">Proker Administration Tracker</h3>
                                <div className="overflow-y-auto overflow-x-auto -mx-4 md:mx-0 flex-1">
                                    <table className="w-full text-sm min-w-[500px]">
                                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="p-3 text-left">Proker</th>
                                                <th className="p-3 text-center">Proposal</th>
                                                <th className="p-3 text-center">LPJ</th>
                                                <th className="p-3 text-center">Arsip</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programs.map(p => (
                                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => handleProkerClick(p)}>
                                                    <td className="p-3 font-medium text-blue-600">{p.title}</td>
                                                    <td className="p-3 text-center"><Badge status={p.proposal_status} /></td>
                                                    <td className="p-3 text-center"><Badge status={p.lpj_status} /></td>
                                                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input type="checkbox" checked={!!p.is_archived} onChange={(e) => handleToggleArchive(p.id, e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {(view === 'suratMasuk' || view === 'suratKeluar') && (
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    {view === 'suratMasuk' ? <Inbox className="mr-2" size={20} /> : <Send className="mr-2" size={20} />}
                                    {view === 'suratMasuk' ? 'Arsip Surat Masuk' : 'Arsip Surat Keluar'}
                                </h3>
                                <button
                                    onClick={() => { setLetterForm({ ...letterForm, type: view === 'suratMasuk' ? 'Masuk' : 'Keluar' }); setShowLetterModal(true); }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center w-full md:w-auto justify-center"
                                >
                                    <Plus size={16} className="mr-2" /> Input Surat
                                </button>
                            </div>
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left">No. Surat</th>
                                            <th className="p-3 text-left">Perihal</th>
                                            <th className="p-3 text-left">{view === 'suratMasuk' ? 'Pengirim' : 'Penerima'}</th>
                                            <th className="p-3 text-left">Tanggal</th>
                                            <th className="p-3 text-right">File</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(view === 'suratMasuk' ? lettersMasuk : lettersKeluar).map(l => (
                                            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{l.no || '-'}</td>
                                                <td className="p-3">{l.subject || l.title}</td>
                                                <td className="p-3">{view === 'suratMasuk' ? l.sender : l.recipient}</td>
                                                <td className="p-3">{l.date}</td>
                                                <td className="p-3 text-right">
                                                    {l.file_path && (
                                                        <a href={`http://localhost:8000/storage/${l.file_path}`} target="_blank" className="text-blue-600 hover:underline flex items-center justify-end">
                                                            <Download size={14} className="mr-1" /> Unduh
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'asistensi' && (
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FileText className="mr-2" size={20} /> Asistensi Inbox</h3>
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left">Proker</th>
                                            <th className="p-3 text-left">Document</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inbox.map(item => (
                                            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{item.program?.title || 'Unknown'}</td>
                                                <td className="p-3">{item.title}</td>
                                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'pending_assistance' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span></td>
                                                <td className="p-3 text-right">
                                                    {item.status === 'pending_assistance' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleApprove(item.id)} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Check size={16} /></button>
                                                            <button onClick={() => openRejectModal(item.id)} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X size={16} /></button>
                                                        </div>
                                                    )}
                                                    {item.status === 'pending_bph_sign' && (
                                                        <button onClick={() => handleFinalSign(item.id)} className="bg-blue-100 text-blue-700 p-1 rounded hover:bg-blue-200"><Check size={16} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {inbox.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No pending documents.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'requests' && (
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><MessageSquare className="mr-2" size={20} /> Permintaan Surat dari Kahima</h3>
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left">Title</th>
                                            <th className="p-3 text-left">Description</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(req => (
                                            <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{req.title}</td>
                                                <td className="p-3 text-gray-600">{req.description}</td>
                                                <td className="p-3"><Badge status={req.status} /></td>
                                                <td className="p-3 text-right">
                                                    {req.status === 'pending' && (
                                                        <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-2">
                                                            <input type="file" className="text-xs w-full md:w-auto" onChange={e => setRequestFile(e.target.files ? e.target.files[0] : null)} />
                                                            <button onClick={() => handleUploadRequest(req.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 whitespace-nowrap">Upload</button>
                                                        </div>
                                                    )}
                                                    {req.status === 'completed' && <span className="text-green-600 text-xs font-bold">Fulfilled</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No requests found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'archives' && (
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FolderArchive className="mr-2" size={20} /> Document Templates</h3>

                            {/* Upload Form - Stack on mobile */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-sm mb-3">Upload New Template</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Title</label>
                                        <input type="text" className="w-full p-2 border rounded text-sm" value={newTemplate.title} onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Description</label>
                                        <input type="text" className="w-full p-2 border rounded text-sm" value={newTemplate.description} onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">File</label>
                                        <input type="file" className="w-full text-sm" onChange={e => setNewTemplate({ ...newTemplate, file: e.target.files ? e.target.files[0] : null })} />
                                    </div>
                                    <div className="flex items-end">
                                        <button onClick={handleAddTemplate} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm w-full">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map(t => (
                                    <div key={t.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-gray-800">{t.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{t.description}</p>
                                        <a href={`http://localhost:8000/storage/${t.file_path}`} target="_blank" className="text-blue-600 text-xs font-bold flex items-center hover:underline">
                                            <Download size={14} className="mr-1" /> Download
                                        </a>
                                    </div>
                                ))}
                                {templates.length === 0 && <p className="text-gray-500 text-sm col-span-3 text-center py-4">No templates available.</p>}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Settings Modal */}
            <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Pengaturan Surat">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Format Nomor Surat</label>
                        <input type="text" className="w-full p-2 border rounded-lg" value={settings.letter_format} onChange={e => setSettings({ ...settings, letter_format: e.target.value })} />
                        <p className="text-xs text-gray-500 mt-1">Placeholder: {'{no}'}, {'{roman_month}'}, {'{year}'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Surat Terakhir</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={settings.last_letter_number} onChange={e => setSettings({ ...settings, last_letter_number: parseInt(e.target.value) })} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="autoGen" checked={settings.auto_generate_letters} onChange={e => setSettings({ ...settings, auto_generate_letters: e.target.checked })} className="w-4 h-4 text-blue-600" />
                        <label htmlFor="autoGen" className="text-sm font-bold text-gray-700">Aktifkan Auto Generate</label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Simpan</button>
                    </div>
                </div>
            </Modal>

            {/* Letter Input Modal */}
            <Modal isOpen={showLetterModal} onClose={() => setShowLetterModal(false)} title={`Input Surat ${letterForm.type}`}>
                <form onSubmit={handleLetterSubmit} className="space-y-4">
                    {(!settings.auto_generate_letters || letterForm.type === 'Masuk') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">No. Surat</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.no} onChange={e => setLetterForm({ ...letterForm, no: e.target.value })} />
                        </div>
                    )}
                    {settings.auto_generate_letters && letterForm.type === 'Keluar' && (
                        <div className="p-2 bg-blue-50 text-blue-700 text-sm rounded-lg">Nomor akan di-generate otomatis.</div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Perihal</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.subject} onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Pengirim</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.sender} onChange={e => setLetterForm({ ...letterForm, sender: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Penerima</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.recipient} onChange={e => setLetterForm({ ...letterForm, recipient: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Program Kerja</label>
                        <select className="w-full p-2 border rounded-lg" value={letterForm.program_id || ''} onChange={e => setLetterForm({ ...letterForm, program_id: e.target.value })}>
                            <option value="">Select Program</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                            <input required type="date" className="w-full p-2 border rounded-lg" value={letterForm.date} onChange={e => setLetterForm({ ...letterForm, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                            <select className="w-full p-2 border rounded-lg" value={letterForm.category} onChange={e => setLetterForm({ ...letterForm, category: e.target.value })}>
                                <option value="Internal">Internal</option>
                                <option value="Eksternal">Eksternal</option>
                                <option value="SK">Surat Keputusan</option>
                                <option value="MOU">Kerjasama (MoU)</option>
                                <option value="Universitas">Universitas</option>
                                <option value="Proposal">Proposal</option>
                                <option value="LPJ">LPJ</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Upload File</label>
                        <input type="file" className="w-full text-sm" onChange={e => setLetterForm({ ...letterForm, file: e.target.files ? e.target.files[0] : null })} />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Revision Feedback">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Please provide feedback for the revision:</p>
                    <textarea className="w-full p-3 border rounded-lg" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter feedback here..."></textarea>
                    <div className="flex justify-end">
                        <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700">Submit Revision</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};