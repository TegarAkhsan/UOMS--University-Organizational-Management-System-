
import React, { useState, useEffect } from 'react';
import { Search, FileText, Check, X, Eye, Send, Inbox, Clock, Plus, Upload, Download } from 'lucide-react';
import { Card, Badge, Modal } from '../components/ui/Shared';
import client from '../src/api/client';

export const Surat = () => {
    const [activeTab, setActiveTab] = useState<'Masuk' | 'Keluar' | 'Pending'>('Masuk');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLetter, setSelectedLetter] = useState<any>(null);
    const [letters, setLetters] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newLetter, setNewLetter] = useState<any>({
        no: '', subject: '', sender: '', recipient: '', date: '', status: 'pending_assistance', type: 'Keluar', file: null
    });

    const [requests, setRequests] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);

    useEffect(() => {
        fetchLetters();
        fetchRequests();
        fetchPrograms();
    }, []);

    const fetchPrograms = () => {
        client.get('/programs').then(res => setPrograms(res.data));
    };

    const fetchLetters = () => {
        client.get('/letters')
            .then(res => setLetters(res.data))
            .catch(err => console.error(err));
    };

    const fetchRequests = () => {
        client.get('/letter-requests')
            .then(res => setRequests(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newLetter).forEach(key => {
            formData.append(key, newLetter[key]);
        });

        client.post('/letters', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                fetchLetters();
                setShowCreateModal(false);
                setNewLetter({ no: '', subject: '', sender: '', recipient: '', date: '', status: 'pending_assistance', type: 'Keluar', file: null });
                alert('Letter created successfully');
            })
            .catch(err => console.error(err));
    };

    const handleApprove = (id: number) => {
        client.put(`/letters/${id}`, { status: 'pending_bph_sign' })
            .then(() => {
                fetchLetters();
                setSelectedLetter(null);
                alert('Surat berhasil ditandatangani dan dikirim kembali ke Sekretaris.');
            })
            .catch(err => console.error(err));
    };

    const handleReject = (id: number) => {
        client.put(`/letters/${id}`, { status: 'revision', feedback: 'Rejected by Kahima' })
            .then(() => {
                fetchLetters();
                setSelectedLetter(null);
            })
            .catch(err => console.error(err));
    };

    const filteredLetters = letters.filter(l => {
        const matchesSearch = (l.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.no || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'Pending') return matchesSearch && (l.status === 'approved_secretary' || l.status === 'pending_assistance' || l.status === 'pending_kahima_sign'); // Show pending for relevant roles
        if (activeTab === 'Masuk') return matchesSearch && l.type === 'Masuk'; // Or approved_kahima?
        return matchesSearch && l.type === 'Keluar';
    });

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: '', description: '' });

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        client.post('/letter-requests', newRequest)
            .then(() => {
                alert("Letter request sent to Secretary!");
                setShowRequestModal(false);
                setNewRequest({ title: '', description: '' });
                fetchRequests();
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Surat</h1>
                    <p className="text-sm text-gray-500">Kelola surat masuk, surat keluar, dan persetujuan.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Request Surat</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Buat Surat</span>
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto md:pb-0 bg-gray-100 p-1 rounded-lg">
                    {['Masuk', 'Keluar', 'Pending', 'Requests'].map((tab: any) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'Pending' ? 'Perlu Tanda Tangan' : tab === 'Requests' ? 'My Requests' : `Surat ${tab}`}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari No. Surat atau Perihal..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Inbox size={24} /></div>
                    <div>
                        <p className="text-sm text-blue-500 font-bold">Surat Masuk</p>
                        <h3 className="text-2xl font-bold text-blue-900">{letters.filter(l => l.type === 'Masuk').length}</h3>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600"><Send size={24} /></div>
                    <div>
                        <p className="text-sm text-green-500 font-bold">Surat Keluar</p>
                        <h3 className="text-2xl font-bold text-green-900">{letters.filter(l => l.type === 'Keluar').length}</h3>
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><Clock size={24} /></div>
                    <div>
                        <p className="text-sm text-yellow-600 font-bold">Menunggu TTD</p>
                        <h3 className="text-2xl font-bold text-yellow-900">{letters.filter(l => l.status === 'pending_kahima_sign' || l.status === 'approved_secretary').length}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {activeTab === 'Requests' ? (
                                    <>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Title</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Description</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Download</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">No. Surat</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Perihal</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">{activeTab === 'Masuk' ? 'Pengirim' : 'Tujuan'}</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'Requests' ? (
                                requests.map(req => (
                                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{req.title}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{req.description}</td>
                                        <td className="py-4 px-6"><Badge status={req.status} /></td>
                                        <td className="py-4 px-6 text-right">
                                            {req.file_path ? (
                                                <a href={`http://localhost:8000/storage/${req.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold flex items-center justify-end">
                                                    <Download size={16} className="mr-1" /> Download
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Not available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredLetters.map(l => (
                                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{l.no || '-'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{l.subject || l.title}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{activeTab === 'Masuk' ? l.sender : l.recipient || '-'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{l.created_at ? new Date(l.created_at).toLocaleDateString() : '-'}</td>
                                        <td className="py-4 px-6">
                                            <Badge status={l.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {activeTab === 'Pending' ? (
                                                <button
                                                    onClick={() => setSelectedLetter(l)}
                                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
                                                >
                                                    Review & Sign
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedLetter(l)}
                                                    className="text-gray-400 hover:text-blue-600"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            {((activeTab === 'Requests' && requests.length === 0) || (activeTab !== 'Requests' && filteredLetters.length === 0)) && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Tidak ada data.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Request Modal */}
            < Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Surat ke Sekretaris" >
                <form onSubmit={handleRequest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul Surat</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={newRequest.title} onChange={e => setNewRequest({ ...newRequest, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi / Kebutuhan</label>
                        <textarea required className="w-full p-2 border rounded-lg" rows={4} value={newRequest.description} onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700">Kirim Request</button>
                    </div>
                </form>
            </Modal >

            {/* Create Modal */}
            < Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Surat Baru" >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">No. Surat</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={newLetter.no} onChange={e => setNewLetter({ ...newLetter, no: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                            <input required type="date" className="w-full p-2 border rounded-lg" value={newLetter.date} onChange={e => setNewLetter({ ...newLetter, date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Perihal</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={newLetter.subject} onChange={e => setNewLetter({ ...newLetter, subject: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Pengirim</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={newLetter.sender} onChange={e => setNewLetter({ ...newLetter, sender: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Penerima</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={newLetter.recipient} onChange={e => setNewLetter({ ...newLetter, recipient: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tipe Surat</label>
                            <select className="w-full p-2 border rounded-lg" value={newLetter.type} onChange={e => setNewLetter({ ...newLetter, type: e.target.value })}>
                                <option value="Keluar">Surat Keluar</option>
                                <option value="Masuk">Surat Masuk</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                            <select className="w-full p-2 border rounded-lg" value={newLetter.category || 'Internal'} onChange={e => setNewLetter({ ...newLetter, category: e.target.value })}>
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
                        <label className="block text-sm font-bold text-gray-700 mb-1">Program Kerja (Optional)</label>
                        <select className="w-full p-2 border rounded-lg" value={newLetter.program_id || ''} onChange={e => setNewLetter({ ...newLetter, program_id: e.target.value })}>
                            <option value="">Select Program</option>
                            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Status Awal</label>
                        <select className="w-full p-2 border rounded-lg" value={newLetter.status} onChange={e => setNewLetter({ ...newLetter, status: e.target.value })}>
                            <option value="pending_assistance">Pending Assistance</option>
                            <option value="approved_secretary">Approved by Secretary</option>
                            <option value="approved_kahima">Signed by Kahima</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Upload File (PDF/Image)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <input
                                type="file"
                                className="hidden"
                                id="file-upload"
                                onChange={e => setNewLetter({ ...newLetter, file: e.target.files ? e.target.files[0] : null })}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-500">{newLetter.file ? newLetter.file.name : 'Click to upload document'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Simpan Surat</button>
                    </div>
                </form>
            </Modal >

            {/* Review Modal */}
            < Modal
                isOpen={!!selectedLetter}
                onClose={() => setSelectedLetter(null)}
                title="Review & Tanda Tangan Surat"
            >
                {selectedLetter && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">No. Surat</span>
                                <span className="font-bold text-gray-900">{selectedLetter.no || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Perihal</span>
                                <span className="font-bold text-gray-900">{selectedLetter.subject || selectedLetter.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Tujuan</span>
                                <span className="font-bold text-gray-900">{selectedLetter.recipient || '-'}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl h-64 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                            {selectedLetter.file_path ? (
                                <iframe src={`http://localhost:8000/storage/${selectedLetter.file_path}`} className="w-full h-full" title="Document Preview"></iframe>
                            ) : (
                                <div className="text-center">
                                    <FileText size={48} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No Document Preview Available</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            {activeTab === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => handleReject(selectedLetter.id)}
                                        className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center"
                                    >
                                        <X size={18} className="mr-2" /> Tolak
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedLetter.id)}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center shadow-sm"
                                    >
                                        <Check size={18} className="mr-2" /> Tanda Tangan (Approve)
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal >
        </div >
    );
};
