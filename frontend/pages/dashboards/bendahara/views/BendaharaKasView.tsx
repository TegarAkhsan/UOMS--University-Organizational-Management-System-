import React, { useState, useEffect } from 'react';
import { Plus, Download, Save, Check, X, Trash, Edit } from 'lucide-react';
import client from '../../../../src/api/client';
import * as XLSX from 'xlsx';
import { Modal } from '../../../../components/ui/Shared';

export const BendaharaKasView = ({ user }: { user?: any }) => {
    const [collections, setCollections] = useState<any[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newCollection, setNewCollection] = useState({ title: '', amount: '' });
    const [editCollection, setEditCollection] = useState({ id: 0, title: '', amount: '' });

    // Periods (Months) - could be dynamic or fixed for a year
    const periods = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchTableData(selectedCollection.id);
        }
    }, [selectedCollection]);

    const fetchCollections = async () => {
        try {
            const res = await client.get('/cash-collections');
            setCollections(res.data);
            if (res.data.length > 0 && !selectedCollection) {
                setSelectedCollection(res.data[0]);
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        }
    };

    const fetchTableData = async (collectionId: number) => {
        setLoading(true);
        try {
            const res = await client.get(`/cash-collections/${collectionId}/payments`);
            setTableData(res.data);
        } catch (error) {
            console.error("Error fetching table data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async () => {
        try {
            await client.post('/cash-collections', {
                title: newCollection.title,
                amount: newCollection.amount === '' ? null : newCollection.amount,
                created_by: user?.id || 1
            });
            setShowCreateModal(false);
            setNewCollection({ title: '', amount: '' });
            fetchCollections();
            alert("Collection created!");
        } catch (error) {
            console.error("Error creating collection:", error);
            alert("Failed to create collection.");
        }
    };

    const togglePayment = async (userId: number, period: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setTableData(prev => prev.map(row => {
                if (row.user.id === userId) {
                    return {
                        ...row,
                        payments: {
                            ...row.payments,
                            [period]: { ...row.payments[period], is_paid: !currentStatus }
                        }
                    };
                }
                return row;
            }));

            await client.post('/cash-payments/toggle', {
                collection_id: selectedCollection.id,
                user_id: userId,
                period,
                is_paid: !currentStatus
            });
        } catch (error) {
            console.error("Error toggling payment:", error);
            fetchTableData(selectedCollection.id); // Revert on error
        }
    };

    const handleUpdateCollection = async () => {
        try {
            await client.put(`/cash-collections/${editCollection.id}`, {
                title: editCollection.title,
                amount: editCollection.amount === '' ? null : editCollection.amount,
            });
            setShowEditModal(false);
            fetchCollections();
            alert("Collection updated!");
        } catch (error) {
            console.error("Error updating collection:", error);
            alert("Failed to update collection.");
        }
    };

    const handleDeleteCollection = async () => {
        try {
            await client.delete(`/cash-collections/${selectedCollection.id}`);
            setShowDeleteModal(false);
            setSelectedCollection(null);
            fetchCollections();
            alert("Collection deleted!");
        } catch (error) {
            console.error("Error deleting collection:", error);
            alert("Failed to delete collection.");
        }
    };

    const openEditModal = (collection: any) => {
        setEditCollection({
            id: collection.id,
            title: collection.title,
            amount: collection.amount || ''
        });
        setShowEditModal(true);
    };

    const exportToExcel = () => {
        if (!selectedCollection) return;

        const dataToExport = tableData.map(row => {
            const rowData: any = {
                'Name': row.user.name,
                'Role': row.user.role,
            };
            periods.forEach(p => {
                rowData[p] = row.payments[p]?.is_paid ? 'Paid' : 'Unpaid';
            });
            return rowData;
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kas Data");
        XLSX.writeFile(wb, `${selectedCollection.title}_Export.xlsx`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Kas & Iuran</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Buat Tabel Kas Baru
                </button>
            </div>

            {/* Collection Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {collections.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedCollection(c)}
                        className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${selectedCollection?.id === c.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {c.title}
                    </button>
                ))}
            </div>

            {selectedCollection && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-bold text-gray-800">{selectedCollection.title}</h3>
                            <p className="text-xs text-gray-500">Default Amount: Rp {parseInt(selectedCollection.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase">Total Pendapatan</p>
                                <p className="text-lg font-bold text-blue-600">
                                    Rp {tableData.reduce((acc, row) => {
                                        const paidCount = periods.reduce((c, p) => c + (row.payments[p]?.is_paid ? 1 : 0), 0);
                                        return acc + (paidCount * (parseFloat(selectedCollection.amount) || 0));
                                    }, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openEditModal(selectedCollection)}
                                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-blue-200"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-red-200"
                            >
                                <Trash size={16} /> Delete
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-green-200"
                            >
                                <Download size={16} /> Export Excel
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto max-h-[75vh] relative">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-100 sticky top-0 z-20">
                                <tr>
                                    <th className="p-3 text-left sticky left-0 top-0 bg-gray-100 z-30 shadow-sm min-w-[200px] border-b border-gray-200">Nama Anggota</th>
                                    {periods.map(p => (
                                        <th key={p} className="p-3 text-center min-w-[100px] sticky top-0 bg-gray-100 z-20 border-b border-gray-200">{p}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={periods.length + 1} className="p-8 text-center text-gray-500">Loading data...</td></tr>
                                ) : tableData.map((row) => (
                                    <tr key={row.user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-3 font-medium sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">
                                            {row.user.name}
                                            <div className="text-xs text-gray-400 font-normal">{row.user.role}</div>
                                        </td>
                                        {periods.map(p => {
                                            const isPaid = row.payments[p]?.is_paid;
                                            return (
                                                <td key={p} className="p-3 text-center">
                                                    <button
                                                        onClick={() => togglePayment(row.user.id, p, isPaid)}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all mx-auto ${isPaid
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {isPaid ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Buat Tabel Kas Baru"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul Kas / Iuran</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Kas Rutin 2024, Iuran Makrab"
                            value={newCollection.title}
                            onChange={e => setNewCollection({ ...newCollection, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nominal per Orang (Opsional)</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: 10000"
                            value={newCollection.amount}
                            onChange={e => setNewCollection({ ...newCollection, amount: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleCreateCollection}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                        >
                            Buat Tabel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Tabel Kas"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul Kas / Iuran</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Kas Rutin 2024, Iuran Makrab"
                            value={editCollection.title}
                            onChange={e => setEditCollection({ ...editCollection, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nominal per Orang (Opsional)</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: 10000"
                            value={editCollection.amount}
                            onChange={e => setEditCollection({ ...editCollection, amount: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleUpdateCollection}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hapus Tabel Kas"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus tabel kas <strong>{selectedCollection?.title}</strong>?
                        Tindakan ini tidak dapat dibatalkan dan semua data pembayaran terkait akan hilang.
                    </p>
                    <div className="flex justify-end pt-4 gap-2">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDeleteCollection}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
