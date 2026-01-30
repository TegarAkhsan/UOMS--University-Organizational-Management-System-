import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Plus, File, Copy, Upload, Download, Send, Printer, Check, ChevronDown, ChevronUp } from 'lucide-react';
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

    // Collapsible sections for mobile
    const [showPrices, setShowPrices] = useState(false);
    const [showBudgetCodes, setShowBudgetCodes] = useState(false);
    const [showInputForm, setShowInputForm] = useState(true);

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
                        type: i.type || 'Pengeluaran'
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
            let currentSaldo = 0;
            const itemsWithSaldo = res.data.map((item: any) => {
                const debet = item.type === 'Debet' ? Math.round(parseFloat(item.amount)) : 0;
                const kredit = item.type === 'Kredit' ? Math.round(parseFloat(item.amount)) : 0;
                currentSaldo = currentSaldo + debet - kredit;
                return { ...item, debet, kredit, saldo: currentSaldo };
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
        formData.append('amount', String(Math.round(Number(newRekap.amount))));
        formData.append('type', newRekap.type);
        if (newRekap.file) formData.append('file', newRekap.file);

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
    const expensesBySie: { [key: string]: any[] } = {};
    expenseItems.forEach(item => {
        if (!expensesBySie[item.category]) expensesBySie[item.category] = [];
        expensesBySie[item.category].push(item);
    });

    const totalIncome = incomeItems.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = expenseItems.reduce((sum, i) => sum + i.total, 0);

    const availableSies = treasuryProker?.sies?.map((s: any) => s.name) || ['Sie Acara', 'Sie Perlengkapan', 'Sie Kesekretariatan', 'Sie Humas', 'Sie Konsumsi'];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
            {/* Header - Responsive */}
            <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">BPK Management</h3>
                    <p className="text-xs text-gray-500 md:hidden">{treasuryProker?.title}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Bendahara Pelaksana</span>
            </div>

            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
                {/* Tab Buttons - Full width on mobile */}
                <div className="flex gap-2">
                    <button onClick={() => setBpkTab('RAB')} className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold ${bpkTab === 'RAB' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>RAB Builder</button>
                    <button onClick={() => setBpkTab('Recap')} className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold ${bpkTab === 'Recap' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Rekap Dana</button>
                </div>

                {bpkTab === 'RAB' ? (
                    <>
                        {/* Header with Status */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <h4 className="font-bold text-base md:text-lg text-blue-700 flex items-center"><DollarSign className="mr-2" size={18} /> Financial & RAB</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rabStatus === 'approved' ? 'bg-green-100 text-green-700' : rabStatus === 'revision' ? 'bg-red-100 text-red-700' : rabStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{rabStatus}</span>
                        </div>

                        {/* Collapsible Reference Sections - Collapsed by default on mobile */}
                        <div className="space-y-3">
                            {/* Standard Prices - Collapsible */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button onClick={() => setShowPrices(!showPrices)} className="w-full flex justify-between items-center p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <h5 className="font-bold text-gray-800 text-sm">Harga Wajar ({standardPrices.length})</h5>
                                    {showPrices ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {showPrices && (
                                    <div className="max-h-60 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left">Item</th>
                                                    <th className="p-2 text-right">Harga</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standardPrices.map((sp, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50">
                                                        <td className="p-2">{sp.name}</td>
                                                        <td className="p-2 text-right font-mono">{parseInt(sp.price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Budget Codes - Collapsible */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button onClick={() => setShowBudgetCodes(!showBudgetCodes)} className="w-full flex justify-between items-center p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <h5 className="font-bold text-gray-800 text-sm">Kode Anggaran ({BUDGET_CODES.length})</h5>
                                    {showBudgetCodes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {showBudgetCodes && (
                                    <div className="max-h-60 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left">Code</th>
                                                    <th className="p-2 text-left">Desc</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {BUDGET_CODES.map((bc, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50">
                                                        <td className="p-2 font-bold text-blue-600">{bc.code}</td>
                                                        <td className="p-2 text-gray-600">{bc.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {rabStatus === 'revision' && revisionNote && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                <h5 className="font-bold text-red-800 text-sm mb-1">Revision Note:</h5>
                                <p className="text-red-700 text-sm">{revisionNote}</p>
                            </div>
                        )}

                        {/* RAB Input Form - Collapsible */}
                        {rabStatus !== 'approved' && (
                            <div className="bg-white p-3 md:p-4 rounded-xl border border-blue-200">
                                <button onClick={() => setShowInputForm(!showInputForm)} className="w-full flex justify-between items-center mb-3">
                                    <h5 className="font-bold text-gray-800 text-sm">Input RAB Item</h5>
                                    {showInputForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {showInputForm && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                                                <select className="w-full p-2 border rounded text-sm" value={newRabItem.type} onChange={e => setNewRabItem({ ...newRabItem, type: e.target.value, category: e.target.value === 'Pemasukan' ? 'Dana Kegiatan' : availableSies[0] })}>
                                                    <option value="Pemasukan">Pemasukan</option>
                                                    <option value="Pengeluaran">Pengeluaran</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Sie</label>
                                                {newRabItem.type === 'Pemasukan' ? (
                                                    <input type="text" className="w-full p-2 border rounded text-sm bg-gray-100" value="Dana Kegiatan" disabled />
                                                ) : (
                                                    <select className="w-full p-2 border rounded text-sm" value={newRabItem.category} onChange={e => setNewRabItem({ ...newRabItem, category: e.target.value })}>
                                                        {availableSies.map((sie: string) => <option key={sie} value={sie}>{sie}</option>)}
                                                        <option value="Lain-lain">Lain-lain</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Item Name</label>
                                            <input type="text" placeholder="e.g. Nasi Kotak" className="w-full p-2 border rounded text-sm" value={newRabItem.item} onChange={e => setNewRabItem({ ...newRabItem, item: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Qty</label>
                                                <input type="number" className="w-full p-2 border rounded text-sm" value={newRabItem.qty} onChange={e => setNewRabItem({ ...newRabItem, qty: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm" value={newRabItem.unit} onChange={e => setNewRabItem({ ...newRabItem, unit: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Price</label>
                                                <input type="number" className="w-full p-2 border rounded text-sm" value={newRabItem.price} onChange={e => setNewRabItem({ ...newRabItem, price: parseInt(e.target.value) || 0 })} />
                                            </div>
                                        </div>
                                        <button onClick={() => { setRabItems([...rabItems, { ...newRabItem, total: newRabItem.qty * newRabItem.price }]); setNewRabItem({ ...newRabItem, item: '', qty: 1, price: 0, unit: 'pcs' }); }} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                            <Plus size={16} className="inline mr-1" /> Add Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* RAB Table - Scrollable */}
                        <div id="rab-table-container" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
                                <button onClick={() => handleExportRAB('Word')} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded border hover:bg-gray-100"><FileText size={14} /> Word</button>
                                <button onClick={() => handleExportRAB('PDF')} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded border hover:bg-gray-100"><Printer size={14} /> PDF</button>
                                <button onClick={handleCopyRAB} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded border hover:bg-gray-100"><Copy size={14} /> Copy</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="p-2 text-left w-10">No</th>
                                            <th className="p-2 text-left">Sie</th>
                                            <th className="p-2 text-left">Item</th>
                                            <th className="p-2 text-center">Qty</th>
                                            <th className="p-2 text-right">Harga</th>
                                            <th className="p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Pemasukan */}
                                        <tr className="bg-green-50 font-bold"><td colSpan={6} className="p-2 text-center text-green-800">Pemasukan</td></tr>
                                        {incomeItems.length > 0 ? incomeItems.map((item, idx) => (
                                            <tr key={`in-${idx}`} className="border-b border-gray-100">
                                                <td className="p-2 text-center">{idx + 1}</td>
                                                <td className="p-2">{item.category}</td>
                                                <td className="p-2">{item.item}</td>
                                                <td className="p-2 text-center">{item.qty}</td>
                                                <td className="p-2 text-right">{item.price.toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium">{item.total.toLocaleString()}</td>
                                            </tr>
                                        )) : <tr><td colSpan={6} className="p-2 text-center text-gray-400 italic">Belum ada data</td></tr>}
                                        <tr className="bg-green-100 font-bold">
                                            <td colSpan={5} className="p-2 text-right">Total Pemasukan</td>
                                            <td className="p-2 text-right text-green-800">{totalIncome.toLocaleString()}</td>
                                        </tr>

                                        {/* Pengeluaran */}
                                        <tr className="bg-red-50 font-bold"><td colSpan={6} className="p-2 text-center text-red-800">Pengeluaran</td></tr>
                                        {Object.keys(expensesBySie).length > 0 ? Object.keys(expensesBySie).map((sie, sieIdx) => (
                                            <React.Fragment key={sie}>
                                                {expensesBySie[sie].map((item, idx) => (
                                                    <tr key={`ex-${sie}-${idx}`} className="border-b border-gray-100">
                                                        <td className="p-2 text-center">{sieIdx + 1}</td>
                                                        <td className="p-2 font-medium">{idx === 0 ? sie : ''}</td>
                                                        <td className="p-2">{item.item}</td>
                                                        <td className="p-2 text-center">{item.qty}</td>
                                                        <td className="p-2 text-right">{item.price.toLocaleString()}</td>
                                                        <td className="p-2 text-right font-medium">{item.total.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )) : <tr><td colSpan={6} className="p-2 text-center text-gray-400 italic">Belum ada data</td></tr>}
                                        <tr className="bg-red-100 font-bold">
                                            <td colSpan={5} className="p-2 text-right">Total Pengeluaran</td>
                                            <td className="p-2 text-right text-red-800">{totalExpense.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons - Stack on mobile */}
                        <div className="flex flex-col md:flex-row gap-2 md:justify-end">
                            {rabStatus === 'draft' || rabStatus === 'revision' ? (
                                <>
                                    <button onClick={() => saveRab('draft')} className="bg-gray-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-700 flex items-center justify-center">
                                        <CheckCircle className="mr-2" size={16} /> Save Draft
                                    </button>
                                    <button onClick={() => saveRab('submitted')} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center">
                                        <Send className="mr-2" size={16} /> Submit
                                    </button>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center">RAB submitted/approved. Changes locked.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h4 className="font-bold text-base md:text-lg text-indigo-700 flex items-center"><FileText className="mr-2" size={18} /> Rekap Dana (Realization)</h4>

                        {/* Input Form - More compact for mobile */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 md:p-4">
                            <h5 className="font-bold text-sm mb-3 text-indigo-900">Input Transaksi Baru</h5>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan</label>
                                    <input type="text" placeholder="e.g. Pembelian Konsumsi" className="w-full p-2 border rounded text-sm" value={newRekap.keterangan} onChange={e => setNewRekap({ ...newRekap, keterangan: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">No. Bukti</label>
                                        <input type="text" placeholder="002/OUT/VIII" className="w-full p-2 border rounded text-sm" value={newRekap.noBukti} onChange={e => setNewRekap({ ...newRekap, noBukti: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nominal</label>
                                        <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm" value={newRekap.amount} onChange={e => setNewRekap({ ...newRekap, amount: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Jenis</label>
                                    <select className="w-full p-2 border rounded text-sm" value={newRekap.type} onChange={e => setNewRekap({ ...newRekap, type: e.target.value })}>
                                        <option value="Debet">Pemasukan (Debet)</option>
                                        <option value="Kredit">Pengeluaran (Kredit)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Bukti</label>
                                    <div className="border border-dashed border-indigo-300 bg-white rounded-lg p-3 text-center">
                                        <input type="file" id="rekap-file" className="hidden" onChange={e => setNewRekap({ ...newRekap, file: e.target.files ? e.target.files[0] : null })} />
                                        <label htmlFor="rekap-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="text-indigo-400 mb-1" size={18} />
                                            <p className="text-xs text-indigo-600">{newRekap.file ? newRekap.file.name : 'Upload file'}</p>
                                        </label>
                                    </div>
                                </div>
                                <button onClick={handleAddRekap} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">
                                    <Plus className="inline mr-1" size={16} /> Tambah Data
                                </button>
                            </div>
                        </div>

                        {/* Rekap Table - Scrollable */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <h5 className="font-bold text-gray-800 text-sm">Tabel Realisasi</h5>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[400px]">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Keterangan</th>
                                            <th className="p-2 text-right">Debet</th>
                                            <th className="p-2 text-right">Kredit</th>
                                            <th className="p-2 text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rekapItems.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-50">
                                                <td className="p-2 font-medium">{item.description || item.keterangan}</td>
                                                <td className="p-2 text-right text-green-600">{item.debet > 0 ? item.debet.toLocaleString() : '-'}</td>
                                                <td className="p-2 text-right text-red-600">{item.kredit > 0 ? item.kredit.toLocaleString() : '-'}</td>
                                                <td className="p-2 text-right font-bold">{item.saldo.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-bold border-t">
                                            <td colSpan={3} className="p-2 text-right">Saldo Akhir</td>
                                            <td className="p-2 text-right text-blue-700">{rekapItems.length > 0 ? rekapItems[rekapItems.length - 1].saldo.toLocaleString() : '0'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <button className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center justify-center">
                            <Download className="mr-2" size={16} /> Export
                        </button>
                    </>
                )}
            </div>

            {/* Success Modal */}
            {showRekapSuccess && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Check size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Berhasil!</h3>
                            <p className="text-green-100 mt-2 text-sm">Data Rekap Berhasil Ditambahkan</p>
                        </div>
                        <div className="p-4">
                            <button onClick={() => setShowRekapSuccess(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800">OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};