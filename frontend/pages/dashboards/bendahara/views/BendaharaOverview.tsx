import React, { useState, useEffect } from 'react';
import { Plus, Eye, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Badge, Modal } from '../../../../components/ui/Shared';
import client from '../../../../src/api/client';

interface BendaharaOverviewProps {
    setView: (view: any) => void;
}

export const BendaharaOverview: React.FC<BendaharaOverviewProps> = ({ setView }) => {
    const [transactionFilter, setTransactionFilter] = useState('All');
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [cashSummary, setCashSummary] = useState(0);
    const [transactionSummary, setTransactionSummary] = useState({ program_income: 0, total_expense: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Cash Summary
        client.get('/cash-summary').then(res => setCashSummary(Number(res.data.total_collected) || 0));

        // Fetch Transaction Summary
        client.get('/transaction-summary').then(res => {
            setTransactionSummary({
                program_income: Number(res.data.program_income) || 0,
                total_expense: Number(res.data.total_expense) || 0
            });
        });

        // Fetch Transactions
        client.get('/transactions').then(res => setTransactions(res.data));
    }, []);

    const handleViewReceipt = (transaction: any) => {
        setSelectedTransaction(transaction);
        setShowReceipt(true);
    };

    const filteredTransactions = transactions.filter(t => {
        if (transactionFilter === 'All') return true;
        if (transactionFilter === 'Income' || transactionFilter === 'Expense') return t.type === transactionFilter;
        return t.category === transactionFilter || t.date === transactionFilter;
    });

    const saldoHimpunan = (transactionSummary.program_income + cashSummary) - transactionSummary.total_expense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                    <p className="text-gray-500">Manage your organization's finances effectively.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setView('addIncome')}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> Add Income
                    </button>
                    <button
                        onClick={() => setView('addExpense')}
                        className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200 flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> Add Expense
                    </button>
                </div>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saldo Himpunan - Featured Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700">
                        <Wallet size={150} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Wallet size={20} />
                            </div>
                            <span className="font-medium">Saldo Himpunan</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 tracking-tight">{formatCurrency(saldoHimpunan)}</h2>
                        <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-sm border border-white/10">
                            <TrendingUp size={14} className="mr-1" />
                            <span>Available Balance</span>
                        </div>
                    </div>
                </div>

                {/* Pemasukan Proker */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-gray-500 rounded-full">Proker</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-1">Pemasukan Proker</p>
                    <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(transactionSummary.program_income)}</h2>
                </div>

                {/* Pemasukan Kas */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-gray-500 rounded-full">Kas & Iuran</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-1">Pemasukan Kas</p>
                    <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(cashSummary)}</h2>
                </div>

                {/* Pengeluaran */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:bg-rose-100 transition-colors">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-gray-500 rounded-full">Expense</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-1">Pengeluaran</p>
                    <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(transactionSummary.total_expense)}</h2>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Recent Transactions
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{filteredTransactions.length}</span>
                    </h3>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Income', 'Expense'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTransactionFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${transactionFilter === f
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="py-5 px-6 text-sm text-gray-500 whitespace-nowrap">{t.date}</td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{t.description}</span>
                                                <span className="text-xs text-gray-400">{t.proker || t.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'Income'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                }`}>
                                                {t.category || t.type}
                                            </span>
                                        </td>
                                        <td className={`py-5 px-6 text-sm font-bold whitespace-nowrap ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {t.type === 'Income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                                        </td>
                                        <td className="py-5 px-6">
                                            <Badge status={t.status} />
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <button
                                                onClick={() => handleViewReceipt(t)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                                title="View Receipt"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <Wallet size={32} className="text-gray-300" />
                                            </div>
                                            <p>No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Modal */}
            <Modal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                title="Transaction Details"
            >
                <div className="flex flex-col items-center">
                    <div className="bg-gray-50 rounded-2xl p-8 mb-6 border-2 border-dashed border-gray-200 w-full flex items-center justify-center min-h-[300px] relative group">
                        <div className="text-center">
                            <img
                                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                alt="Receipt"
                                className="max-h-64 object-contain rounded-lg shadow-sm transition-transform group-hover:scale-105"
                            />
                            <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-wide">Receipt Preview</p>
                        </div>
                    </div>
                    {selectedTransaction && (
                        <div className="w-full bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Transaction ID</span>
                                <span className="font-mono text-sm font-bold text-gray-900">#{selectedTransaction.id}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Date</span>
                                <span className="font-medium text-gray-900">{selectedTransaction.date}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Amount</span>
                                <span className={`text-lg font-bold ${selectedTransaction.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                    {formatCurrency(Number(selectedTransaction.amount))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
