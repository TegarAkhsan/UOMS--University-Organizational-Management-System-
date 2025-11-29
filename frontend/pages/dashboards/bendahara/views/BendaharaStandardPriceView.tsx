import React, { useState, useEffect } from 'react';
import { Trash } from 'lucide-react';
import client from '../../../../src/api/client';

export const BendaharaStandardPriceView = () => {
    const [standardPrices, setStandardPrices] = useState<any[]>([]);
    const [newPrice, setNewPrice] = useState({ item_name: '', category: '', price: 0, unit: '' });

    useEffect(() => {
        fetchStandardPrices();
    }, []);

    const fetchStandardPrices = () => {
        client.get('/standard-prices').then(res => setStandardPrices(res.data));
    };

    const handleAddPrice = () => {
        client.post('/standard-prices', newPrice).then(() => {
            fetchStandardPrices();
            setNewPrice({ item_name: '', category: '', price: 0, unit: '' });
            alert("Standard price added!");
        });
    };

    const handleDeletePrice = (id: number) => {
        if (confirm('Are you sure you want to delete this price?')) {
            client.delete(`/standard-prices/${id}`).then(() => {
                fetchStandardPrices();
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Standard Price</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Item Name</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newPrice.item_name} onChange={e => setNewPrice({ ...newPrice, item_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Category</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newPrice.category} onChange={e => setNewPrice({ ...newPrice, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Price</label>
                        <input type="number" className="w-full p-2 border rounded text-sm" value={newPrice.price} onChange={e => setNewPrice({ ...newPrice, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Unit</label>
                        <input type="text" className="w-full p-2 border rounded text-sm" value={newPrice.unit} onChange={e => setNewPrice({ ...newPrice, unit: e.target.value })} />
                    </div>
                    <button onClick={handleAddPrice} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm h-10">Add Price</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Standard Prices List</h3>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-3 text-left">Item Name</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Price</th>
                            <th className="p-3 text-left">Unit</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standardPrices.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="p-3 font-medium">{p.item_name}</td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3">Rp {parseInt(p.price).toLocaleString()}</td>
                                <td className="p-3">{p.unit}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleDeletePrice(p.id)} className="text-red-600 hover:text-red-800"><Trash size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
