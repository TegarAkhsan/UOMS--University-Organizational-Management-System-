import React, { useEffect, useState } from 'react';
import client from '../src/api/client';
import { Calendar, Archive, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Period {
    id: number;
    name: string;
    start_year: number;
    end_year: number;
    is_active: boolean;
    archived_at: string | null;
}

export const ArchivedPeriods = () => {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/periods')
            .then(res => setPeriods(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Archive className="mr-3 h-8 w-8 text-blue-600" />
                Arsip Periode
            </h1>
            <p className="text-gray-600 mb-8">Riwayat kepengurusan sebelumnya.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {periods.map(period => (
                    <div key={period.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${period.is_active ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Calendar size={24} />
                            </div>
                            {period.is_active ? (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Aktif</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">Arsip</span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{period.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{period.start_year} - {period.end_year}</p>

                        {!period.is_active && (
                            <div className="border-t pt-4 mt-2">
                                {/* Feature to view archive details could be added here */}
                                <button className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                                    <Eye size={16} className="mr-2" />
                                    Lihat Data (Coming Soon)
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-2">Mode Read-Only</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
