import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import client from '../../../../src/api/client';

interface BendaharaTransactionFormProps {
    type: 'Income' | 'Expense';
    onBack: () => void;
}

export const BendaharaTransactionForm: React.FC<BendaharaTransactionFormProps> = ({ type, onBack }) => {
    const [formData, setFormData] = useState({
        description: '', source: '', recipient: '', amount: '', category: '', payment: '', date: ''
    });
    const [receipt, setReceipt] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddTransaction = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append('type', type);
            data.append('description', formData.description);
            data.append('amount', formData.amount);
            data.append('date', formData.date);
            data.append('status', 'Approved'); // Default status
            data.append('category', formData.category);
            data.append('payment_method', formData.payment);

            // Map source/recipient to 'name' field based on type
            if (type === 'Income') {
                data.append('name', formData.source);
            } else {
                data.append('name', formData.recipient);
            }

            if (receipt) {
                data.append('receipt', receipt);
            }

            await client.post('/transactions', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert("Transaction added successfully!");
            onBack();
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Failed to add transaction.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceipt(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in pb-10">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Add {type} Transaction</h1>

            <div className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <label className="font-bold text-gray-700">Description</label>
                    <input
                        type="text"
                        placeholder="Enter description"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700">{type === 'Income' ? 'Source' : 'Recipient'}</label>
                    <input
                        type="text"
                        placeholder={type === 'Income' ? "Enter source (e.g. Sponsorship)" : "Enter recipient (e.g. Vendor Name)"}
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={type === 'Income' ? formData.source : formData.recipient}
                        onChange={e => type === 'Income' ? setFormData({ ...formData, source: e.target.value }) : setFormData({ ...formData, recipient: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700">Amount</label>
                    <input
                        type="number"
                        placeholder="Enter amount"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="font-bold text-gray-700">Category</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option>Event</option>
                            <option>Marketing</option>
                            <option>Operations</option>
                            <option>Sponsorship</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="font-bold text-gray-700">Payment Method</label>
                        <select
                            className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={formData.payment}
                            onChange={e => setFormData({ ...formData, payment: e.target.value })}
                        >
                            <option value="">Select Method</option>
                            <option>Cash</option>
                            <option>Bank Transfer</option>
                            <option>Credit Card</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700">Date</label>
                    <input
                        type="date"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="border-2 border-dashed border-blue-100 bg-blue-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 transition-colors group relative">
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                    />
                    <Upload size={32} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-700">Upload Receipt</h4>
                    <p className="text-sm text-gray-500">{receipt ? receipt.name : "Drag and drop or browse to upload"}</p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleAddTransaction}
                        disabled={loading}
                        className={`bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};
