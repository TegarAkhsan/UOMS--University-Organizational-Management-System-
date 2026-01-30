import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Shared';
import client from '../../../../src/api/client';

export const BendaharaRabView = () => {
    const [rabs, setRabs] = useState<any[]>([]);
    const [selectedRab, setSelectedRab] = useState<any>(null);
    const [showRabDetail, setShowRabDetail] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');

    useEffect(() => {
        fetchRabs();
    }, []);

    const fetchRabs = () => {
        client.get('/rabs').then(res => setRabs(res.data));
    };

    const handleApproveRab = (rab: any) => {
        if (confirm(`Approve RAB for ${rab.program?.title} and forward to Kahima?`)) {
            client.put(`/rabs/${rab.id}`, { status: 'review_kahima' }).then(() => {
                alert("RAB Approved and forwarded to Kahima for final review!");
                fetchRabs();
                setShowRabDetail(false);
            });
        }
    };

    const handleRevisionRab = () => {
        if (!selectedRab) return;
        client.put(`/rabs/${selectedRab.id}`, { status: 'revision', revision_note: revisionNote }).then(() => {
            alert("RAB returned for revision!");
            fetchRabs();
            setShowRevisionModal(false);
            setShowRabDetail(false);
            setRevisionNote('');
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">RAB Submission Review</h3>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-left">Program</th>
                                <th className="p-3 text-left">Submitted By</th>
                                <th className="p-3 text-right">Total Budget</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rabs.map(r => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-3 font-medium">{r.program?.title}</td>
                                    <td className="p-3 text-gray-500">{r.program?.treasurer_name || 'Bendahara'}</td>
                                    <td className="p-3 text-right font-bold">Rp {parseFloat(r.total_budget).toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            r.status === 'revision' ? 'bg-red-100 text-red-700' :
                                                r.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setSelectedRab(r); setShowRabDetail(true); }} className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded text-xs font-bold">Review</button>
                                    </td>
                                </tr>
                            ))}
                            {rabs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No RAB submissions found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RAB Detail Modal */}
            <Modal
                isOpen={showRabDetail}
                onClose={() => setShowRabDetail(false)}
                title={`Review RAB: ${selectedRab?.program?.title}`}
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Total Budget:</span>
                            <span className="font-bold text-blue-700">Rp {parseFloat(selectedRab?.total_budget || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-bold uppercase">{selectedRab?.status}</span>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">Item</th>
                                    <th className="p-2 text-center">Qty</th>
                                    <th className="p-2 text-right">Price</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRab?.items?.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="p-2">
                                            <div className="font-medium">{item.description}</div>
                                            <div className="text-xs text-gray-500">{item.category} ({item.type})</div>
                                        </td>
                                        <td className="p-2 text-center">{item.quantity} {item.unit}</td>
                                        <td className="p-2 text-right">{parseFloat(item.price).toLocaleString()}</td>
                                        <td className="p-2 text-right font-bold">{parseFloat(item.total).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button onClick={() => setShowRevisionModal(true)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200">Request Revision</button>
                        <button onClick={() => handleApproveRab(selectedRab)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">Approve RAB</button>
                    </div>
                </div>
            </Modal>

            {/* Revision Modal */}
            <Modal
                isOpen={showRevisionModal}
                onClose={() => setShowRevisionModal(false)}
                title="Request Revision"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Please provide a reason for the revision request:</p>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32"
                        placeholder="Enter revision notes..."
                        value={revisionNote}
                        onChange={e => setRevisionNote(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                        <button onClick={handleRevisionRab} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700">Submit Revision</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
