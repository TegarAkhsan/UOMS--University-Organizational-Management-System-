import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, ChevronDown, Download, Eye, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge, Modal } from '../../../../components/ui/Shared';
import { REQUIRED_DOCS } from '../../../../data/mockData';
import client from '../../../../src/api/client';

export const ProjectSecretaryView = ({ secretaryProker }: any) => {
    const [letters, setLetters] = useState<any[]>([]);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (secretaryProker) {
            fetchLetters();
        }
    }, [secretaryProker]);

    const fetchLetters = () => {
        client.get('/letters').then(res => {
            // Filter letters for this program
            const myLetters = res.data.filter((l: any) => String(l.program_id) === String(secretaryProker.id));
            setLetters(myLetters);
        });
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !selectedDocType) return;

        const formData = new FormData();
        formData.append('program_id', secretaryProker.id);
        formData.append('title', title);
        formData.append('type', 'Keluar'); // Always Keluar for these docs
        formData.append('category', selectedDocType); // Use category for the specific doc type
        formData.append('file', file);

        client.post('/letters', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            alert('Document uploaded successfully!');
            setUploadModalOpen(false);
            fetchLetters();
            setFile(null);
            setTitle('');
        }).catch(err => {
            console.error(err);
            alert('Upload failed. Please check console.');
        });
    };

    const getDocStatus = (docName: string) => {
        // Find the latest letter matching this document type/name
        return letters.filter(l => l.category === docName || l.title === docName).sort((a, b) => b.id - a.id)[0];
    };

    const renderStatusBadge = (letter: any) => {
        if (!letter) return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">Not Uploaded</span>;

        switch (letter.status) {
            case 'pending_assistance': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Pending Assistance</span>;
            case 'pending_kahima_sign': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Waiting Kahima Sign</span>;
            case 'pending_bph_sign': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Waiting BPH Sign</span>;
            case 'revision': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center"><AlertCircle size={12} className="mr-1" /> Revision Needed</span>;
            case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center"><CheckCircle size={12} className="mr-1" /> Completed</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{letter.status}</span>;
        }
    };

    const openUploadModal = (docName: string) => {
        setSelectedDocType(docName);
        setTitle(docName);
        setUploadModalOpen(true);
    };

    const handleDownload = (letter: any) => {
        if (!letter || letter.status !== 'completed') {
            alert("Document is not yet completed and signed.");
            return;
        }
        const url = `http://localhost:8000/storage/${letter.file_path}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">BPK Management Tools: {secretaryProker?.title}</h3>
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">Sekretaris Pelaksana</span>
            </div>
            <div className="p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-pink-700 flex items-center"><BookOpen className="mr-2" /> Administration & Docs</h4>

                    {/* Template Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors">
                            <FileText size={16} />
                            Download Templates
                            <ChevronDown size={16} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 transform translate-y-2 group-hover:translate-y-0">
                            <div className="p-2 space-y-1">
                                {['Template Proposal', 'Template Surat Peminjaman', 'Template Surat Undangan', 'Template LPJ', 'Logo Himpunan'].map((t, i) => (
                                    <button key={i} onClick={() => alert(`Downloading ${t}...`)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center transition-colors">
                                        <Download size={14} className="mr-2 text-gray-400" /> {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1: Pra-Acara */}
                <div>
                    <h5 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2 mb-4">1. Pra-Acara (Pre-Event)</h5>
                    <div className="grid grid-cols-1 gap-4">
                        {REQUIRED_DOCS.filter(d => d.type === 'Pre-Event').map(doc => {
                            const status = getDocStatus(doc.name);
                            return (
                                <div key={doc.id} className="border border-gray-200 p-6 rounded-xl bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-gray-800">{doc.name}</h5>
                                            {renderStatusBadge(status)}
                                        </div>
                                        {/* @ts-ignore */}
                                        <p className="text-sm text-gray-500 mb-1">{doc.description}</p>
                                        {/* @ts-ignore */}
                                        {doc.signatures && doc.signatures.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {/* @ts-ignore */}
                                                {doc.signatures.map((sig: string, idx: number) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium">
                                                        {sig}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {status?.feedback && (
                                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                                <strong>Feedback:</strong> {status.feedback}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleDownload(status)}
                                            disabled={status?.status !== 'completed'}
                                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${status?.status === 'completed' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            <Download size={16} /> Download Signed
                                        </button>
                                        <button onClick={() => openUploadModal(doc.name)} className="bg-pink-50 text-pink-700 border border-pink-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-100 transition-colors flex items-center">
                                            <Upload size={16} className="mr-2" /> Request Asistensi
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Pelaksanaan */}
                <div>
                    <h5 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2 mb-4">2. Pelaksanaan (Event Day)</h5>
                    <div className="grid grid-cols-1 gap-4">
                        {REQUIRED_DOCS.filter(d => d.type === 'Event').map(doc => {
                            const status = getDocStatus(doc.name);
                            return (
                                <div key={doc.id} className="border border-gray-200 p-6 rounded-xl bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-gray-800">{doc.name}</h5>
                                            {renderStatusBadge(status)}
                                        </div>
                                        {/* @ts-ignore */}
                                        <p className="text-sm text-gray-500 mb-1">{doc.description}</p>
                                        {status?.feedback && (
                                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                                <strong>Feedback:</strong> {status.feedback}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        <button onClick={() => openUploadModal(doc.name)} className="bg-pink-50 text-pink-700 border border-pink-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-100 transition-colors flex items-center">
                                            <Upload size={16} className="mr-2" /> Request Asistensi
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 3: Pasca-Acara */}
                <div>
                    <h5 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2 mb-4">3. Pasca-Acara (Post-Event)</h5>
                    <div className="grid grid-cols-1 gap-4">
                        {REQUIRED_DOCS.filter(d => d.type === 'Post-Event').map(doc => {
                            const status = getDocStatus(doc.name);
                            return (
                                <div key={doc.id} className="border border-gray-200 p-6 rounded-xl bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-gray-800">{doc.name}</h5>
                                            {renderStatusBadge(status)}
                                        </div>
                                        {/* @ts-ignore */}
                                        <p className="text-sm text-gray-500 mb-1">{doc.description}</p>
                                        {/* @ts-ignore */}
                                        {doc.signatures && doc.signatures.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {/* @ts-ignore */}
                                                {doc.signatures.map((sig: string, idx: number) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium">
                                                        {sig}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {status?.feedback && (
                                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                                <strong>Feedback:</strong> {status.feedback}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleDownload(status)}
                                            disabled={status?.status !== 'completed'}
                                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${status?.status === 'completed' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            <Download size={16} /> Download Signed
                                        </button>
                                        <button onClick={() => openUploadModal(doc.name)} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors flex items-center">
                                            <Upload size={16} className="mr-2" /> Request Asistensi
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Document for Assistance">
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                        <input
                            type="text"
                            value={selectedDocType}
                            readOnly
                            className="w-full p-2 border rounded-lg bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF/DOCX)</label>
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full p-2 border rounded-lg"
                            accept=".pdf,.doc,.docx"
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Upload</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};