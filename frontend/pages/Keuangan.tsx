
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Badge, Modal } from '../components/ui/Shared';
import { Plus, Upload, FileText } from 'lucide-react';
import client from '../src/api/client';

export const Keuangan = () => {
    const [transactionFilter, setTransactionFilter] = useState('All');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTransaction, setNewTransaction] = useState<any>({
        amount: '', type: 'Expense', description: '', date: '', status: 'Pending', category: 'Operations', payment_method: 'Transfer', receipt: null
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = () => {
        client.get('/transactions')
            .then(res => setTransactions(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newTransaction).forEach(key => {
            if (key === 'receipt' && newTransaction[key]) {
                formData.append('receipt', newTransaction[key]);
            } else if (key !== 'receipt') {
                formData.append(key, newTransaction[key]);
            }
        });

        client.post('/transactions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                fetchTransactions();
                setShowCreateModal(false);
                setNewTransaction({ amount: '', type: 'Expense', description: '', date: '', status: 'Pending', category: 'Operations', payment_method: 'Transfer', receipt: null });
                alert('Transaction created successfully');
            })
            .catch(err => console.error(err));
    };

    // Calculate dynamic stats from transactions
    const stats = useMemo(() => {
        const income = transactions.filter(t => t.type === 'Income' && t.status === 'Approved').reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
        const expense = transactions.filter(t => t.type === 'Expense' && t.status === 'Approved').reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
        const balance = income - expense;
        return { income, expense, balance };
    }, [transactions]);

    // Filter transactions based on selected type/category
    const filteredTransactions = useMemo(() => {
        if (transactionFilter === 'All') return transactions;

        // Filter by Type
        if (transactionFilter === 'Income' || transactionFilter === 'Expense') {
            return transactions.filter(t => t.type === transactionFilter);
        }

        // Filter by Category
        return transactions.filter(t => t.category === transactionFilter);
    }, [transactionFilter, transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const filters = ['All', 'Income', 'Expense', 'Event', 'Marketing', 'Operations', 'Sponsorship', 'Donation'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center space-x-2"
                >
                    <Plus size={18} />
                    <span>Add Transaction</span>
                </button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 font-medium mb-1">Saldo Himpunan</p>
                        <h3 className="text-3xl font-bold text-blue-600">{formatCurrency(stats.balance)}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 font-medium mb-1">Pemasukan Himpunan</p>
                        <h3 className="text-3xl font-bold text-green-600">{formatCurrency(stats.income)}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 font-medium mb-1">Pengeluaran Himpunan</p>
                        <h3 className="text-3xl font-bold text-red-600">{formatCurrency(stats.expense)}</h3>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Transactions</h3>

                {/* Mobile Filter Dropdown */}
                <div className="md:hidden mb-4">
                    <select
                        value={transactionFilter}
                        onChange={(e) => setTransactionFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    >
                        {filters.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                {/* Desktop Filter Buttons */}
                <div className="hidden md:flex flex-wrap gap-2 mb-4">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setTransactionFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${transactionFilter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Payment Method</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Proker</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{t.date}</td>
                                        <td className={`py-4 px-4 text-sm font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</td>
                                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{formatCurrency(t.amount)}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{t.description}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{t.name}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{t.payment}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{t.category}</td>
                                        <td className="py-4 px-4 text-sm text-blue-600">{t.proker}</td>
                                        <td className="py-4 px-4">
                                            <Badge status={t.status} />
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-gray-500">
                                            No transactions found for filter "{transactionFilter}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Create Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Transaction">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Amount (IDR)</label>
                            <input required type="number" className="w-full p-2 border rounded-lg" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input required type="date" className="w-full p-2 border rounded-lg" value={newTransaction.date} onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <input required type="text" className="w-full p-2 border rounded-lg" value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                            <select className="w-full p-2 border rounded-lg" value={newTransaction.type} onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}>
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select className="w-full p-2 border rounded-lg" value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}>
                                <option value="Operations">Operations</option>
                                <option value="Event">Event</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sponsorship">Sponsorship</option>
                                <option value="Donation">Donation</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Upload Receipt</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <input
                                type="file"
                                className="hidden"
                                id="receipt-upload"
                                onChange={e => setNewTransaction({ ...newTransaction, receipt: e.target.files ? e.target.files[0] : null })}
                            />
                            <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-500">{newTransaction.receipt ? newTransaction.receipt.name : 'Click to upload receipt'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Save Transaction</button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};
