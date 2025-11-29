import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, BarChart2, DollarSign, Mail,
    MessageSquare, Calendar, CheckCircle, Clock, TrendingUp, Activity,
    Award, ArrowUpRight, ArrowDownRight, Wallet, Briefcase, UserPlus, Settings
} from 'lucide-react';
import { Card, Badge, Modal } from '../../../components/ui/Shared';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { DEPARTMENTS } from '../../../data/mockData';

// Mock data for charts (can be replaced with real data later)
const activityData = [
    { name: 'Jan', prokers: 4, completed: 2 },
    { name: 'Feb', prokers: 6, completed: 3 },
    { name: 'Mar', prokers: 8, completed: 5 },
    { name: 'Apr', prokers: 5, completed: 4 },
    { name: 'May', prokers: 9, completed: 6 },
    { name: 'Jun', prokers: 12, completed: 8 },
];

const financeData = [
    { name: 'Week 1', income: 500000, expense: 200000 },
    { name: 'Week 2', income: 750000, expense: 400000 },
    { name: 'Week 3', income: 1200000, expense: 800000 },
    { name: 'Week 4', income: 900000, expense: 300000 },
];

export const KahimaDashboard = ({ user, onLogout }: any) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeProkers: 0,
        completedProkers: 0,
        totalBalance: 0,
        pendingAssistance: 0
    });
    const [loading, setLoading] = useState(true);

    // Regeneration & Cabinet Setup State
    const [showRegenerationModal, setShowRegenerationModal] = useState(false);
    const [showCabinetSetupModal, setShowCabinetSetupModal] = useState(false);
    const [nextYear, setNextYear] = useState(new Date().getFullYear() + 1);
    const [cabinetData, setCabinetData] = useState<any>({
        sekum: '',
        bendum: '',
        kadeps: {}
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { default: client } = await import('../../../src/api/client');

                // Fetch Programs
                const prokersRes = await client.get('/programs');
                const prokers = prokersRes.data;
                console.log('Fetched Prokers:', prokers);

                // Normalize status to lowercase for comparison
                const active = prokers.filter((p: any) => {
                    const s = (p.status || '').toLowerCase();
                    return s === 'on progress' || s === 'pending' || s === 'on_progress';
                }).length;

                const completed = prokers.filter((p: any) => {
                    const s = (p.status || '').toLowerCase();
                    return s === 'done' || s === 'completed' || s === 'finish';
                }).length;

                // Fetch Transactions for Saldo Himpunan (Matching Keuangan Page Logic)
                const transactionsRes = await client.get('/transactions');
                const transactions = transactionsRes.data;
                console.log('Fetched Transactions:', transactions);

                const income = transactions.filter((t: any) => t.type === 'Income' && t.status === 'Approved').reduce((acc: number, curr: any) => Number(acc) + Number(curr.amount), 0);
                const expense = transactions.filter((t: any) => t.type === 'Expense' && t.status === 'Approved').reduce((acc: number, curr: any) => Number(acc) + Number(curr.amount), 0);
                const totalSaldo = income - expense;

                // Fetch Assistance (Mock or Real if endpoint exists)
                // const assistRes = await client.get('/assistances?status=pending');
                const pendingAssist = 0; // Placeholder

                setStats({
                    activeProkers: active,
                    completedProkers: completed,
                    totalBalance: totalSaldo,
                    pendingAssistance: pendingAssist
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const handleRegenerate = async () => {
        try {
            const { default: client } = await import('../../../src/api/client');
            const email = `kahima.${nextYear}@himaforticunesa.com`;
            const password = `himafortic${nextYear}`;

            const formData = new FormData();
            formData.append('name', `Ketua Himpunan ${nextYear}`);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', 'Kahima');
            formData.append('status', 'superadmin');
            formData.append('department_id', 'BPH');
            formData.append('nim', `${nextYear}00000`); // Dummy NIM

            await client.post('/users', formData);
            alert(`Success! Account created:\nEmail: ${email}\nPassword: ${password}`);
            setShowRegenerationModal(false);
        } catch (error) {
            console.error(error);
            alert('Failed to create account. It might already exist.');
        }
    };

    const handleCabinetSetup = async () => {
        try {
            const { default: client } = await import('../../../src/api/client');
            const year = new Date().getFullYear(); // Current year context for setup
            const password = `himafortic${year}`;

            const createAccount = async (role: string, dept: string, status: string, name: string, emailPrefix: string) => {
                if (!name) return;
                const email = `${emailPrefix}.${year}@himaforticunesa.com`;
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('role', role);
                formData.append('status', status);
                formData.append('department_id', dept);
                formData.append('nim', `${year}${Math.floor(Math.random() * 10000)}`);

                try {
                    await client.post('/users', formData);
                    console.log(`Created: ${email}`);
                } catch (e) {
                    console.error(`Failed: ${email}`, e);
                }
            };

            // Create Sekum
            await createAccount('Sekretaris Umum', 'BPH', 'sub_super_admin_2', cabinetData.sekum, 'sekum');

            // Create Bendum
            await createAccount('Bendahara Umum', 'BPH', 'sub_super_admin_1', cabinetData.bendum, 'bendum');

            // Create Kadeps
            for (const [deptId, name] of Object.entries(cabinetData.kadeps)) {
                await createAccount('Ketua Departemen', deptId, 'admin', name as string, `kadep.${deptId.toLowerCase()}`);
            }

            alert('Cabinet setup complete! Accounts created with default password: ' + password);
            setShowCabinetSetupModal(false);
        } catch (error) {
            console.error(error);
            alert('An error occurred during setup.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Removed DashboardHeader as requested */}

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">

                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2">Welcome back, {user?.name}! 👋</h1>
                            <p className="text-blue-100 text-lg max-w-2xl">Here's what's happening in Himaforstic today. You have <span className="font-bold text-white">{stats.activeProkers} active projects</span> requiring your attention.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCabinetSetupModal(true)}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-all"
                            >
                                <Users size={18} />
                                <span>Setup Kabinet</span>
                            </button>
                            <button
                                onClick={() => setShowRegenerationModal(true)}
                                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-50 flex items-center space-x-2 transition-all"
                            >
                                <UserPlus size={18} />
                                <span>Regenerasi</span>
                            </button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 transform skew-x-12 translate-x-12"></div>
                    <div className="absolute right-20 bottom-0 h-64 w-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Prokers"
                        value={stats.activeProkers}
                        icon={Briefcase}
                        color="blue"
                        trend="+2 this week"
                        trendUp={true}
                    />
                    <StatCard
                        title="Completed Prokers"
                        value={stats.completedProkers}
                        icon={CheckCircle}
                        color="green"
                        trend="On track"
                        trendUp={true}
                    />
                    <StatCard
                        title="Saldo Himpunan"
                        value={formatCurrency(stats.totalBalance)}
                        icon={Wallet}
                        color="purple"
                        trend="+15% vs last month"
                        trendUp={true}
                    />
                    <StatCard
                        title="Pending Assistance"
                        value={stats.pendingAssistance}
                        icon={MessageSquare}
                        color="orange"
                        trend="Needs review"
                        trendUp={false}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Charts & Analytics */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Proker Progress Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Project Activity</h3>
                                    <p className="text-sm text-gray-500">Overview of project initiation and completion</p>
                                </div>
                                <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg p-2">
                                    <option>Last 6 Months</option>
                                    <option>This Year</option>
                                </select>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <defs>
                                            <linearGradient id="colorProkers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                                        />
                                        <Area type="monotone" dataKey="prokers" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorProkers)" />
                                        <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} fill="none" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Financial Overview */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
                                    <p className="text-sm text-gray-500">Income vs Expenses</p>
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financeData} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Top Contributors */}
                    <div className="space-y-8">

                        {/* Top Contributor Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
                                        <Award className="text-yellow-400" size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg">Top Contributor</h3>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full border-2 border-yellow-400 p-1">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Top User" className="w-full h-full rounded-full bg-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">Tegar Eka Pambudi</p>
                                        <p className="text-gray-400 text-sm">1180 Points Earned</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Projects Led</span>
                                        <span className="font-bold">5</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Tasks Completed</span>
                                        <span className="font-bold">42</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button onClick={() => navigate('/proker')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                            <Briefcase size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">Manage Prokers</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500" />
                                </button>
                                <button onClick={() => navigate('/keuangan')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-purple-700">Financial Reports</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-500" />
                                </button>
                                <button onClick={() => navigate('/surat')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-orange-700">Letter Requests</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Regeneration Modal */}
            <Modal isOpen={showRegenerationModal} onClose={() => setShowRegenerationModal(false)} title="Regenerasi Kepengurusan">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Create an account for the next <strong>Kahima</strong> ({nextYear}).
                        This will allow them to log in and set up their cabinet.
                    </p>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Periode Tahun</label>
                        <input
                            type="number"
                            value={nextYear}
                            onChange={(e) => setNextYear(parseInt(e.target.value))}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p><strong>Auto-Generated Credentials:</strong></p>
                        <p>Email: kahima.{nextYear}@himaforticunesa.com</p>
                        <p>Password: himafortic{nextYear}</p>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleRegenerate}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cabinet Setup Modal */}
            <Modal isOpen={showCabinetSetupModal} onClose={() => setShowCabinetSetupModal(false)} title="Setup Kabinet">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-gray-600 text-sm">
                        Batch create accounts for your core team. They will receive default credentials.
                    </p>

                    {/* BPH Inti */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 border-b pb-1">BPH Inti</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Sekretaris Umum</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full p-2 border rounded text-sm"
                                value={cabinetData.sekum}
                                onChange={(e) => setCabinetData({ ...cabinetData, sekum: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Bendahara Umum</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full p-2 border rounded text-sm"
                                value={cabinetData.bendum}
                                onChange={(e) => setCabinetData({ ...cabinetData, bendum: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Departments */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 border-b pb-1 mt-4">Kepala Departemen</h3>
                        {DEPARTMENTS.filter(d => d.id !== 'BPH').map(dept => (
                            <div key={dept.id}>
                                <label className="block text-xs font-bold text-gray-600">Kadep {dept.name}</label>
                                <input
                                    type="text"
                                    placeholder={`Full Name for Kadep ${dept.name}`}
                                    className="w-full p-2 border rounded text-sm"
                                    value={cabinetData.kadeps[dept.id] || ''}
                                    onChange={(e) => setCabinetData({
                                        ...cabinetData,
                                        kadeps: { ...cabinetData.kadeps, [dept.id]: e.target.value }
                                    })}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleCabinetSetup}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
                        >
                            Create All Accounts
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper Component for Stat Cards
const StatCard = ({ title, value, icon: Icon, color, trend, trendUp }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trendUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

// Simple Chevron Icon
const ChevronRight = ({ size, className }: any) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
