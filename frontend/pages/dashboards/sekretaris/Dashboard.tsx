import React, { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '../../../components/DashboardHeader';
import { Card, Badge, Modal } from '../../../components/ui/Shared';
import { REQUIRED_DOCS, DEPARTMENTS } from '../../../data/mockData';
import { Check, X, Bell, FileText, Send, ArrowLeft, Download, Eye, Inbox, Hash, Settings, Plus, Users, Edit } from 'lucide-react';
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

        // If auto-generate is on for Keluar, we pass a flag
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
        // Optimistic update
        const updatedPrograms = programs.map(p => p.id === programId ? { ...p, is_archived: isArchived } : p);
        setPrograms(updatedPrograms);

        client.put(`/programs/${programId}`, { is_archived: isArchived })
            .then(() => {
                // Success, no action needed as we optimistically updated
            })
            .catch(err => {
                console.error("Failed to update archive status", err);
                alert("Failed to update archive status. Please try again.");
                // Revert on failure
                fetchPrograms();
            });
    };

    // --- PROKER DETAIL VIEW ---
    if (view === 'prokerDetail' && selectedProker) {
        return (
            <div className="min-h-screen bg-gray-50 animate-fade-in">
                <DashboardHeader user={user} onLogout={onLogout} />
                <main className="px-8 pb-8 max-w-5xl mx-auto space-y-8">
                    <button
                        onClick={() => setView('overview')}
                        className="text-gray-500 hover:text-gray-900 flex items-center mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </button>

                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedProker.title}</h1>
                                <p className="text-gray-500 text-sm">Administration Tracking & Committee</p>
                            </div>
                            <Badge status={selectedProker.status} />
                        </div>

                        {/* Committee Section */}
                        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-blue-900 flex items-center"><Users className="mr-2" /> Susunan Kepanitiaan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase">Ketua Pelaksana</p>
                                    <p className="font-bold text-gray-800">{selectedProker.leader_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase">Sekretaris</p>
                                    <p className="font-bold text-gray-800">{selectedProker.secretary_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase">Bendahara</p>
                                    <p className="font-bold text-gray-800">{selectedProker.treasurer_name || '-'}</p>
                                </div>
                            </div>
                            {/* Detailed Sies List */}
                            {selectedProker.sies && (
                                <div className="mt-4 space-y-3">
                                    {selectedProker.sies.map((sie: any, idx: number) => (
                                        <div key={idx} className="border-t border-blue-200 pt-2">
                                            <p className="font-bold text-sm text-blue-800">{sie.name}</p>
                                            <p className="text-xs text-gray-600">Koord: {sie.coordinator}</p>
                                            <p className="text-xs text-gray-500">Staff: {sie.staff?.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Tracker Status */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-bold text-gray-500">Proposal Status</p>
                                    <Badge status={selectedProker.proposal_status || 'not_started'} />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-bold text-gray-500">LPJ Status</p>
                                    <Badge status={selectedProker.lpj_status || 'not_started'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- MAIN DASHBOARD VIEW ---
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onLogout={onLogout} />
            <main className="px-8 pb-8 max-w-7xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Sekretaris BPH Dashboard</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setView('overview')} className={`px-4 py-2 rounded-lg font-bold ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Overview</button>
                        <button onClick={() => setView('suratMasuk')} className={`px-4 py-2 rounded-lg font-bold ${view === 'suratMasuk' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Surat Masuk</button>
                        <button onClick={() => setView('suratKeluar')} className={`px-4 py-2 rounded-lg font-bold ${view === 'suratKeluar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Surat Keluar</button>
                        <button onClick={() => setView('asistensi')} className={`px-4 py-2 rounded-lg font-bold relative ${view === 'asistensi' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                            Asistensi
                            {inbox.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                    {inbox.length}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setView('requests')} className={`px-4 py-2 rounded-lg font-bold relative ${view === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                            Permintaan Surat
                            {requests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                    {requests.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setView('archives')} className={`px-4 py-2 rounded-lg font-bold ${view === 'archives' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Templates</button>
                        <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"><Settings size={20} /></button>
                    </div>
                </div>

                {view === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="flex items-center space-x-4 border-l-4 border-l-green-500">
                                <div className="p-3 bg-green-100 rounded-full text-green-600"><Inbox size={24} /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Surat Masuk</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{lettersMasuk.length}</h3>
                                </div>
                            </Card>
                            <Card className="flex items-center space-x-4 border-l-4 border-l-blue-500">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Send size={24} /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Surat Keluar</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{lettersKeluar.length}</h3>
                                </div>
                            </Card>
                            <Card className="border-l-4 border-l-purple-500">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Hash size={18} /></div>
                                    <span className="text-sm text-gray-500 font-medium">Auto-Gen Status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${settings.auto_generate_letters ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {settings.auto_generate_letters ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500">Last No: {settings.last_letter_number}</span>
                                </div>
                            </Card>
                        </div>

                        {/* Proker Progress Tracker */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Proker Administration Tracker</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left">Proker Name</th>
                                            <th className="p-3 text-center">Proposal</th>
                                            <th className="p-3 text-center">LPJ</th>
                                            <th className="p-3 text-center">Arsip</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {programs.map(p => (
                                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => handleProkerClick(p)}>
                                                <td className="p-3 font-medium text-blue-600 hover:underline">{p.title}</td>
                                                <td className="p-3 text-center"><Badge status={p.proposal_status} /></td>
                                                <td className="p-3 text-center"><Badge status={p.lpj_status} /></td>
                                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!p.is_archived}
                                                        onChange={(e) => handleToggleArchive(p.id, e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3 text-center"><span className="text-gray-400">{p.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {(view === 'suratMasuk' || view === 'suratKeluar') && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                {view === 'suratMasuk' ? <Inbox className="mr-2" /> : <Send className="mr-2" />}
                                {view === 'suratMasuk' ? 'Arsip Surat Masuk' : 'Arsip Surat Keluar'}
                            </h3>
                            <button
                                onClick={() => {
                                    setLetterForm({ ...letterForm, type: view === 'suratMasuk' ? 'Masuk' : 'Keluar' });
                                    setShowLetterModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center"
                            >
                                <Plus size={16} className="mr-2" /> Input Surat
                            </button>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-3 text-left">No. Surat</th>
                                    <th className="p-3 text-left">Perihal</th>
                                    <th className="p-3 text-left">{view === 'suratMasuk' ? 'Pengirim' : 'Penerima'}</th>
                                    <th className="p-3 text-left">Tanggal</th>
                                    <th className="p-3 text-left">Kategori</th>
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
                                        <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{l.category}</span></td>
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
                )}

                {view === 'asistensi' && (
                    <div className="space-y-8">
                        {/* Asistensi Inbox */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FileText className="mr-2" /> Asistensi Inbox</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 text-left">Proker</th>
                                        <th className="p-3 text-left">Document</th>
                                        <th className="p-3 text-left">Sender</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inbox.map(item => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.program?.title || 'Unknown'}</td>
                                            <td className="p-3">{item.title}</td>
                                            <td className="p-3 text-gray-500">{item.user?.name || 'Unknown'}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'pending_assistance' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span></td>
                                            <td className="p-3 text-right">
                                                {item.status === 'pending_assistance' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleApprove(item.id)} title="Approve & Send to Kahima" className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Check size={16} /></button>
                                                        <button onClick={() => openRejectModal(item.id)} title="Reject / Revision" className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X size={16} /></button>
                                                    </div>
                                                )}
                                                {item.status === 'pending_bph_sign' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleFinalSign(item.id)} title="Sign & Complete" className="bg-blue-100 text-blue-700 p-1 rounded hover:bg-blue-200"><Check size={16} /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {inbox.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No pending documents.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'requests' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Inbox className="mr-2" /> Permintaan Surat dari Kahima</h3>
                        <table className="w-full text-sm">
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
                                                <div className="flex justify-end items-center gap-2">
                                                    <input type="file" className="text-xs" onChange={e => setRequestFile(e.target.files ? e.target.files[0] : null)} />
                                                    <button onClick={() => handleUploadRequest(req.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700">Upload & Fulfill</button>
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
                )}

                {view === 'archives' && (
                    <div className="space-y-8">
                        {/* Templates Section */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FileText className="mr-2" /> Document Templates</h3>

                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-sm mb-2">Upload New Template</h4>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500">Title</label>
                                        <input type="text" className="w-full p-2 border rounded text-sm" value={newTemplate.title} onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500">Description</label>
                                        <input type="text" className="w-full p-2 border rounded text-sm" value={newTemplate.description} onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500">File</label>
                                        <input type="file" className="w-full text-sm" onChange={e => setNewTemplate({ ...newTemplate, file: e.target.files ? e.target.files[0] : null })} />
                                    </div>
                                    <button onClick={handleAddTemplate} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">Add Template</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map(t => (
                                    <div key={t.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-gray-800">{t.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{t.description}</p>
                                        <a href={`http://localhost:8000/storage/${t.file_path}`} target="_blank" className="text-blue-600 text-xs font-bold flex items-center hover:underline">
                                            <Download size={14} className="mr-1" /> Download Template
                                        </a>
                                    </div>
                                ))}
                                {templates.length === 0 && <p className="text-gray-500 text-sm col-span-3 text-center py-4">No templates available.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Settings Modal */}
            <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Pengaturan Surat">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Format Nomor Surat</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            value={settings.letter_format}
                            onChange={e => setSettings({ ...settings, letter_format: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Gunakan placeholder: {'{no}'}, {'{roman_month}'}, {'{year}'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Surat Terakhir</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-lg"
                            value={settings.last_letter_number}
                            onChange={e => setSettings({ ...settings, last_letter_number: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="autoGen"
                            checked={settings.auto_generate_letters}
                            onChange={e => setSettings({ ...settings, auto_generate_letters: e.target.checked })}
                            className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor="autoGen" className="text-sm font-bold text-gray-700">Aktifkan Auto Generate Nomor Surat</label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Simpan Pengaturan</button>
                    </div>
                </div>
            </Modal>

            {/* Letter Input Modal */}
            <Modal isOpen={showLetterModal} onClose={() => setShowLetterModal(false)} title={`Input Surat ${letterForm.type}`}>
                <form onSubmit={handleLetterSubmit} className="space-y-4">
                    {/* Only show No. Surat if NOT auto-generated or if it is Surat Masuk */}
                    {(!settings.auto_generate_letters || letterForm.type === 'Masuk') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">No. Surat</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.no} onChange={e => setLetterForm({ ...letterForm, no: e.target.value })} />
                        </div>
                    )}
                    {settings.auto_generate_letters && letterForm.type === 'Keluar' && (
                        <div className="p-2 bg-blue-50 text-blue-700 text-sm rounded-lg">
                            Nomor Surat akan di-generate otomatis oleh sistem.
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Perihal</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={letterForm.subject} onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <label className="block text-sm font-bold text-gray-700 mb-1">Program Kerja (Optional)</label>
                        <select className="w-full p-2 border rounded-lg" value={letterForm.program_id || ''} onChange={e => setLetterForm({ ...letterForm, program_id: e.target.value })}>
                            <option value="">Select Program</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    <textarea
                        className="w-full p-3 border rounded-lg"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter feedback here..."
                    ></textarea>
                    <div className="flex justify-end">
                        <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700">Submit Revision</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};