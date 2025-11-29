import React, { useState, useEffect } from 'react';
import { Trash } from 'lucide-react';
import client from '../../../../src/api/client';

export const BendaharaBudgetCodeView = () => {
    const [budgetCodes, setBudgetCodes] = useState<any[]>([]);
    const [newCode, setNewCode] = useState({ code: '', category: '', description: '' });

    useEffect(() => {
        fetchBudgetCodes();
    }, []);

    const fetchBudgetCodes = () => {
        client.get('/budget-codes').then(res => setBudgetCodes(res.data));
    };

    const handleAddCode = () => {
        client.post('/budget-codes', newCode).then(() => {
            fetchBudgetCodes();
            setNewCode({ code: '', category: '', description: '' });
            alert("Budget code added!");
        });
    };

    const handleDeleteCode = (id: number) => {
        if (confirm('Are you sure you want to delete this budget code?')) {
            client.delete(`/budget-codes/${id}`).then(() => {
                fetchBudgetCodes();
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Budget Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Code</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newCode.code} onChange={e => setNewCode({ ...newCode, code: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Category</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newCode.category} onChange={e => setNewCode({ ...newCode, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Description</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newCode.description} onChange={e => setNewCode({ ...newCode, description: e.target.value })} />
                    </div>
                    <button onClick={handleAddCode} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm h-10">Add Code</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Codes List</h3>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-3 text-left">Code</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgetCodes.map(c => (
                            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="p-3 font-bold text-blue-600">{c.code}</td>
                                <td className="p-3">{c.category}</td>
                                <td className="p-3">{c.description}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleDeleteCode(c.id)} className="text-red-600 hover:text-red-800"><Trash size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
