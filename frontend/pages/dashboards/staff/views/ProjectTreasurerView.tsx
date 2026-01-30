import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Plus, File, Copy, Upload, Download, Send, Printer, Check } from 'lucide-react';
import { BUDGET_CODES } from '../../../../data/mockData';
import client from '../../../../src/api/client';

export const ProjectTreasurerView = ({ treasuryProker }: any) => {
    const [rabItems, setRabItems] = useState<any[]>([]);
    const [newRabItem, setNewRabItem] = useState({ item: '', qty: 1, price: 0, unit: 'pcs', category: 'Sie Acara', type: 'Pengeluaran' });
    const [bpkTab, setBpkTab] = useState<'RAB' | 'Recap'>('RAB');
    const [standardPrices, setStandardPrices] = useState<any[]>([]);
    const [rabStatus, setRabStatus] = useState('draft');
    const [rabId, setRabId] = useState<number | null>(null);
    const [revisionNote, setRevisionNote] = useState('');

    // Rekap Data State
    const [rekapItems, setRekapItems] = useState<any[]>([]);
    const [newRekap, setNewRekap] = useState<any>({ noBukti: '', keterangan: '', amount: 0, type: 'Kredit', file: null });
    const [showRekapSuccess, setShowRekapSuccess] = useState(false);

    useEffect(() => {
        if (treasuryProker) {
            fetchRab();
            fetchStandardPrices();
            fetchRecaps();
        }
    }, [treasuryProker]);

    const fetchRab = () => {
        client.get(`/rabs/${treasuryProker.id}`).then(res => {
            if (res.data) {
                setRabId(res.data.id);
                setRabStatus(res.data.status);
                setRevisionNote(res.data.revision_note || '');
                if (res.data.items) {
                    setRabItems(res.data.items.map((i: any) => ({
                        ...i,
                        item: i.description,
                        qty: i.quantity,
                        price: parseFloat(i.price),
                        total: parseFloat(i.total),
                        type: i.type || 'Pengeluaran' // Ensure type exists
                    })));
                }
            }
        });
    };

    const fetchStandardPrices = () => {
        client.get('/standard-prices').then(res => setStandardPrices(res.data));
    };

    const fetchRecaps = () => {
        client.get(`/programs/${treasuryProker.id}/recaps`).then(res => {
            // Calculate saldo on the fly
            let currentSaldo = 0;
            const itemsWithSaldo = res.data.map((item: any) => {
                // Use Math.round for exact integer display
                const debet = item.type === 'Debet' ? Math.round(parseFloat(item.amount)) : 0;
                const kredit = item.type === 'Kredit' ? Math.round(parseFloat(item.amount)) : 0;
                currentSaldo = currentSaldo + debet - kredit;
                return {
                    ...item,
                    debet,
                    kredit,
                    saldo: currentSaldo
                };
            });
            setRekapItems(itemsWithSaldo);
        });
    };

    const handleAddRekap = () => {
        if (!newRekap.keterangan || newRekap.amount <= 0) return;

        const formData = new FormData();
        formData.append('program_id', treasuryProker.id);
        formData.append('description', newRekap.keterangan);
        formData.append('proof_no', newRekap.noBukti || '');
        // Use Math.round to ensure exact integer value
        formData.append('amount', String(Math.round(Number(newRekap.amount))));
        formData.append('type', newRekap.type);
        if (newRekap.file) {
            formData.append('file', newRekap.file);
        }

        client.post('/recaps', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            fetchRecaps();
            setNewRekap({ noBukti: '', keterangan: '', amount: 0, type: 'Kredit', file: null });
            setShowRekapSuccess(true);
        }).catch(err => {
            console.error(err);
            alert("Failed to add realization data.");
        });
    };

    const handleExportRAB = (type: string) => {
        if (type === 'PDF') {
            window.print();
        } else if (type === 'Word') {
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
            const footer = "</body></html>";
            const sourceHTML = header + document.getElementById("rab-table-container")?.innerHTML + footer;

            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
            const fileDownload = document.createElement("a");
            document.body.appendChild(fileDownload);
            fileDownload.href = source;
            fileDownload.download = `RAB_${treasuryProker.title}.doc`;
            fileDownload.click();
            document.body.removeChild(fileDownload);
        }
    };

    const handleCopyRAB = () => {
        const text = rabItems.map(i => `${i.category}\t${i.item}\t${i.qty}\t${i.unit}\t${i.price}\t${i.total}`).join('\n');
        navigator.clipboard.writeText(text);
        alert("RAB Table copied to clipboard!");
    };

    const saveRab = (status: string = 'draft') => {
        const itemsToSave = rabItems.map(item => ({
            description: item.item,
            quantity: item.qty,
            unit: item.unit || 'pcs',
            price: item.price,
            category: item.category || 'Consumables',
            type: item.type
        }));

        client.post('/rabs', {
            program_id: treasuryProker.id,
            items: itemsToSave,
            status: status
        }).then(() => {
            alert(status === 'submitted' ? 'RAB submitted for assistance!' : 'RAB saved successfully!');
            fetchRab();
        }).catch(err => {
            console.error(err);
            alert('Failed to save RAB.');
        });
    };

    // Group items for display
    const incomeItems = rabItems.filter(i => i.type === 'Pemasukan');
    const expenseItems = rabItems.filter(i => i.type === 'Pengeluaran');

    // Group expenses by Sie (Category)
    const expensesBySie: { [key: string]: any[] } = {};
    expenseItems.forEach(item => {
        if (!expensesBySie[item.category]) expensesBySie[item.category] = [];
        expensesBySie[item.category].push(item);
    });

    const totalIncome = incomeItems.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = expenseItems.reduce((sum, i) => sum + i.total, 0);

    // Get Sies from proker for dropdown
    const availableSies = treasuryProker?.sies?.map((s: any) => s.name) || ['Sie Acara', 'Sie Perlengkapan', 'Sie Kesekretariatan', 'Sie Humas', 'Sie Konsumsi'];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">BPK Management Tools: {treasuryProker?.title}</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Bendahara Pelaksana</span>
            </div>

            <div className="p-6 space-y-8">
                <div className="flex space-x-4 mb-4">
                    <button onClick={() => setBpkTab('RAB')} className={`px-4 py-2 rounded-lg text-sm font-bold ${bpkTab === 'RAB' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'} `}>RAB Builder</button>
                    <button onClick={() => setBpkTab('Recap')} className={`px-4 py-2 rounded-lg text-sm font-bold ${bpkTab === 'Recap' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'} `}>Rekap Dana (Realization)</button>
                </div>

                {bpkTab === 'RAB' ? (
                    <>
                        <div className="mb-6 flex justify-between items-end">
                            <h4 className="font-bold text-lg text-blue-700 flex items-center"><DollarSign className="mr-2" /> Financial & RAB</h4>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rabStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                    rabStatus === 'review_kahima' ? 'bg-indigo-100 text-indigo-700' :
                                        rabStatus === 'revision' ? 'bg-red-100 text-red-700' :
                                            rabStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {rabStatus === 'review_kahima' ? 'Review Kahima' : rabStatus}
                                </span>
                            </div>
                        </div>

                        {/* Standard Prices & Budget Codes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96 overflow-y-auto">
                                <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Standard Prices (Harga Wajar)</h5>
                                {standardPrices.length > 0 ? (
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="p-2 text-left">Category</th>
                                                <th className="p-2 text-left">Item</th>
                                                <th className="p-2 text-right">Price (Est)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {standardPrices.map((sp, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="p-2 font-bold text-gray-600">{sp.category}</td>
                                                    <td className="p-2">{sp.name}</td>
                                                    <td className="p-2 text-right font-mono">{parseInt(sp.price).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p className="text-gray-400 text-sm italic text-center mt-10">No standard prices available.</p>}
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96 overflow-y-auto">
                                <h5 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Kode Anggaran (Budget Codes)</h5>
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Code</th>
                                            <th className="p-2 text-left">Category</th>
                                            <th className="p-2 text-left">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {BUDGET_CODES.map((bc, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-2 font-bold text-blue-600">{bc.code}</td>
                                                <td className="p-2 font-bold text-gray-700">{bc.category}</td>
                                                <td className="p-2 text-gray-500">{bc.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {rabStatus === 'revision' && revisionNote && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                                <h5 className="font-bold text-red-800 mb-1">Revision Note from Bendahara BPH:</h5>
                                <p className="text-red-700 text-sm">{revisionNote}</p>
                            </div>
                        )}

                        {/* RAB Builder */}
                        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h5 className="font-bold text-gray-800 text-lg">Draft RAB Input</h5>
                                <div className="flex gap-2">
                                    <button onClick={() => handleExportRAB('Word')} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"><FileText size={14} /> Word</button>
                                    <button onClick={() => handleExportRAB('PDF')} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"><Printer size={14} /> Print/PDF</button>
                                    <button onClick={handleCopyRAB} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"><Copy size={14} /> Copy Table</button>
                                </div>
                            </div>

                            {/* Input Form - Only show if not approved */}
                            {rabStatus !== 'approved' && (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                                        <select className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.type} onChange={e => setNewRabItem({ ...newRabItem, type: e.target.value, category: e.target.value === 'Pemasukan' ? 'Dana Kegiatan' : availableSies[0] })}>
                                            <option value="Pemasukan">Pemasukan</option>
                                            <option value="Pengeluaran">Pengeluaran</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Bidang/Sie</label>
                                        {newRabItem.type === 'Pemasukan' ? (
                                            <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100" value="Dana Kegiatan" disabled />
                                        ) : (
                                            <select className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.category} onChange={e => setNewRabItem({ ...newRabItem, category: e.target.value })}>
                                                {availableSies.map((sie: string) => <option key={sie} value={sie}>{sie}</option>)}
                                                <option value="Lain-lain">Lain-lain</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Item Name</label>
                                        <input type="text" placeholder="e.g. Nasi Kotak" className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.item} onChange={e => setNewRabItem({ ...newRabItem, item: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Qty</label>
                                        <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.qty} onChange={e => setNewRabItem({ ...newRabItem, qty: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                                        <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.unit} onChange={e => setNewRabItem({ ...newRabItem, unit: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Price (Rp)</label>
                                        <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm" value={newRabItem.price} onChange={e => setNewRabItem({ ...newRabItem, price: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="md:col-span-12 flex justify-end">
                                        <button onClick={() => { setRabItems([...rabItems, { ...newRabItem, total: newRabItem.qty * newRabItem.price }]); setNewRabItem({ ...newRabItem, item: '', qty: 1, price: 0, unit: 'pcs', category: newRabItem.category, type: newRabItem.type }); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm">Add</button>
                                    </div>
                                </div>
                            )}

                            {/* RAB Table Display */}
                            <div id="rab-table-container" className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left border-r border-gray-200 w-12">No</th>
                                            <th className="p-3 text-left border-r border-gray-200">Bidang Kerja/Sie</th>
                                            <th className="p-3 text-left border-r border-gray-200">Kebutuhan</th>
                                            <th className="p-3 text-center border-r border-gray-200">Satuan</th>
                                            <th className="p-3 text-right border-r border-gray-200">Harga Satuan</th>
                                            <th className="p-3 text-right">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Pemasukan Section */}
                                        <tr className="bg-green-50 font-bold"><td colSpan={6} className="p-2 text-center border-b border-green-100 text-green-800">Pemasukan</td></tr>
                                        {incomeItems.length > 0 ? incomeItems.map((item, idx) => (
                                            <tr key={`in-${idx}`} className="border-b border-gray-100">
                                                <td className="p-2 text-center border-r">{idx + 1}</td>
                                                <td className="p-2 border-r">{item.category}</td>
                                                <td className="p-2 border-r">{item.item}</td>
                                                <td className="p-2 text-center border-r">{item.qty} {item.unit}</td>
                                                <td className="p-2 text-right border-r">{item.price.toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium">{item.total.toLocaleString()}</td>
                                            </tr>
                                        )) : <tr><td colSpan={6} className="p-2 text-center text-gray-400 italic">Belum ada data pemasukan</td></tr>}
                                        <tr className="bg-green-100 font-bold">
                                            <td colSpan={5} className="p-2 text-right border-r border-green-200">Total Pemasukan</td>
                                            <td className="p-2 text-right text-green-800">{totalIncome.toLocaleString()}</td>
                                        </tr>

                                        {/* Pengeluaran Section */}
                                        <tr className="bg-red-50 font-bold"><td colSpan={6} className="p-2 text-center border-b border-red-100 text-red-800">Pengeluaran</td></tr>
                                        {Object.keys(expensesBySie).length > 0 ? Object.keys(expensesBySie).map((sie, sieIdx) => (
                                            <React.Fragment key={sie}>
                                                {expensesBySie[sie].map((item, idx) => (
                                                    <tr key={`ex-${sie}-${idx}`} className="border-b border-gray-100">
                                                        <td className="p-2 text-center border-r">{sieIdx + 1}</td>
                                                        <td className="p-2 border-r font-medium">{idx === 0 ? sie : ''}</td>
                                                        <td className="p-2 border-r">{item.item}</td>
                                                        <td className="p-2 text-center border-r">{item.qty} {item.unit}</td>
                                                        <td className="p-2 text-right border-r">{item.price.toLocaleString()}</td>
                                                        <td className="p-2 text-right font-medium">{item.total.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )) : <tr><td colSpan={6} className="p-2 text-center text-gray-400 italic">Belum ada data pengeluaran</td></tr>}
                                        <tr className="bg-red-100 font-bold">
                                            <td colSpan={5} className="p-2 text-right border-r border-red-200">Total Pengeluaran</td>
                                            <td className="p-2 text-right text-red-800">{totalExpense.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex gap-2 justify-end">
                                {rabStatus === 'draft' || rabStatus === 'revision' ? (
                                    <>
                                        <button onClick={() => saveRab('draft')} className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-700 flex items-center">
                                            <CheckCircle className="mr-2" size={16} /> Save Draft
                                        </button>
                                        <button onClick={() => saveRab('submitted')} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 flex items-center">
                                            <Send className="mr-2" size={16} /> Submit for Assistance
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">RAB has been submitted/approved. Changes are locked.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h4 className="font-bold text-lg text-indigo-700 flex items-center mb-4"><FileText className="mr-2" /> Rekap Dana (Realization)</h4>

                        {/* Input Realization Form */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 shadow-sm">
                            <div className="flex items-center mb-4 text-indigo-900">
                                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center mr-3 text-sm font-bold">1</div>
                                <h5 className="font-bold text-lg">Input Transaksi Baru</h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan Transaksi</label>
                                    <input type="text" placeholder="e.g. Pembelian Konsumsi" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" value={newRekap.keterangan} onChange={e => setNewRekap({ ...newRekap, keterangan: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">No. Bukti / Kwitansi</label>
                                    <input type="text" placeholder="e.g. 002/OUT/VIII" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" value={newRekap.noBukti} onChange={e => setNewRekap({ ...newRekap, noBukti: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nominal (Rp)</label>
                                    <input type="number" placeholder="0" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" value={newRekap.amount} onChange={e => setNewRekap({ ...newRekap, amount: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Transaksi</label>
                                    <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" value={newRekap.type} onChange={e => setNewRekap({ ...newRekap, type: e.target.value })}>
                                        <option value="Debet">Pemasukan (Debet)</option>
                                        <option value="Kredit">Pengeluaran (Kredit)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Upload Bukti / Kwitansi</label>
                                <div className="border border-dashed border-indigo-300 bg-indigo-50/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors">
                                    <input
                                        type="file"
                                        id="rekap-file"
                                        className="hidden"
                                        onChange={e => setNewRekap({ ...newRekap, file: e.target.files ? e.target.files[0] : null })}
                                    />
                                    <label htmlFor="rekap-file" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-indigo-400 mb-1" size={20} />
                                        <p className="text-xs text-indigo-600 font-medium">{newRekap.file ? newRekap.file.name : 'Click to upload image/pdf'}</p>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleAddRekap} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center">
                                    <Plus className="mr-1" size={16} /> Tambah Data
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h5 className="font-bold text-gray-800">Tabel Realisasi Dana</h5>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left">No. Bukti</th>
                                        <th className="p-3 text-left">Keterangan</th>
                                        <th className="p-3 text-right">Debet (Pemasukan)</th>
                                        <th className="p-3 text-right">Kredit (Pengeluaran)</th>
                                        <th className="p-3 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekapItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="p-3 font-mono text-xs text-gray-600">{item.proof_no || item.noBukti}</td>
                                            <td className="p-3 font-medium">{item.description || item.keterangan}</td>
                                            <td className="p-3 text-right text-green-600">{item.debet > 0 ? item.debet.toLocaleString() : '-'}</td>
                                            <td className="p-3 text-right text-red-600">{item.kredit > 0 ? item.kredit.toLocaleString() : '-'}</td>
                                            <td className="p-3 text-right font-bold text-gray-800">{item.saldo.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                        <td colSpan={4} className="p-3 text-right">Sisa Saldo Akhir</td>
                                        <td className="p-3 text-right text-blue-700">{rekapItems.length > 0 ? rekapItems[rekapItems.length - 1].saldo.toLocaleString() : '0'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center shadow-sm">
                                <Download className="mr-2" size={16} /> Export to Spreadsheet
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Rekap Dana Success Modal */}
            {showRekapSuccess && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                <Check size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Berhasil!</h3>
                            <p className="text-green-100 mt-2 text-sm">Data Rekap Berhasil Ditambahkan</p>
                        </div>
                        <div className="p-6">
                            <button
                                onClick={() => setShowRekapSuccess(false)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};