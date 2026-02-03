import React, { useState } from 'react';
import client from '../src/api/client';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const Regenerasi = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        new_kahima_name: '',
        new_kahima_nim: '',
        new_kahima_email: '',
        new_kahima_password: '',
        current_password: '',
        period_name: '',
        start_year: new Date().getFullYear().toString(),
        end_year: (new Date().getFullYear() + 1).toString(),
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!confirm('PERINGATAN: Tindakan ini akan mengarsipkan kepengurusan saat ini. Anda tidak bisa membatalkannya. Lanjutkan?')) {
            setLoading(false);
            return;
        }

        try {
            await client.post('/regenerasi', formData);
            setSuccess('Regenerasi berhasil! Silakan login dengan akun Kahima baru.');
            setTimeout(() => {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat regenerasi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Regenerasi Kepengurusan</h1>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Halaman ini digunakan untuk pergantian periode kepengurusan.
                            Data saat ini (Users, Proker, dll) akan diarsipkan dan periode baru akan dimulai dengan data bersih.
                            Struktur Departemen tidak akan berubah.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Periode Baru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Periode</label>
                            <input
                                type="text"
                                name="period_name"
                                value={formData.period_name}
                                onChange={handleChange}
                                placeholder="Contoh: Kepengurusan 2025-2026"
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Mulai</label>
                                <input
                                    type="number"
                                    name="start_year"
                                    value={formData.start_year}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Selesai</label>
                                <input
                                    type="number"
                                    name="end_year"
                                    value={formData.end_year}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Akun Kahima Baru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                name="new_kahima_name"
                                value={formData.new_kahima_name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                            <input
                                type="text"
                                name="new_kahima_nim"
                                value={formData.new_kahima_nim}
                                onChange={handleChange}
                                placeholder="Contoh: 23091397123"
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="new_kahima_email"
                                value={formData.new_kahima_email}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="new_kahima_password"
                                value={formData.new_kahima_password}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">3. Konfirmasi Keamanan</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Anda Saat Ini</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                placeholder="Masukkan password Anda untuk konfirmasi"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Memproses...' : 'Lakukan Regenerasi'}
                    </button>
                </div>
            </form>
        </div>
    );
};
