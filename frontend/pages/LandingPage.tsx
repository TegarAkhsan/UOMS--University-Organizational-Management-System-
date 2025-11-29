import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, Users, Shield, CheckCircle, Play, Star } from 'lucide-react';

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                        U
                    </div>
                    <span className="text-xl font-bold tracking-tight">UOMS</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <a href="#about" className="hover:text-blue-600 transition-colors">About us</a>
                    <a href="#platform" className="hover:text-blue-600 transition-colors">Platform</a>
                    <a href="#solution" className="hover:text-blue-600 transition-colors">Solution</a>
                    <a href="#customer" className="hover:text-blue-600 transition-colors">Customer</a>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleLoginClick} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                        Login
                    </button>
                    <button onClick={handleLoginClick} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                        Sign up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-12 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-blue-100">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Data Manage
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                        Talent Wants More. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Here's How You Win Them.
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Discover a workplace where your growth, well-being, and impact matter—right from day one. Manage your organization efficiently with UOMS.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button onClick={handleLoginClick} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:scale-105 flex items-center gap-2">
                            Book a Strategy Call <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Simplified Background - Removed heavy blur/blobs */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none"></div>

                {/* Static Stats Cards - Removed heavy animations */}
                <div className="relative max-w-6xl mx-auto mt-16 h-[400px] hidden md:block">
                    {/* Card 1: Revenue Growth */}
                    <div className="absolute left-10 top-10 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 w-64 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-500">Revenue Growth</span>
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <div className="flex items-end gap-2 h-24">
                            <div className="w-1/5 bg-blue-100 h-[40%] rounded-t-md"></div>
                            <div className="w-1/5 bg-blue-200 h-[60%] rounded-t-md"></div>
                            <div className="w-1/5 bg-blue-300 h-[50%] rounded-t-md"></div>
                            <div className="w-1/5 bg-blue-400 h-[80%] rounded-t-md"></div>
                            <div className="w-1/5 bg-blue-600 h-[100%] rounded-t-md"></div>
                        </div>
                    </div>

                    {/* Card 2: Total Subscribe */}
                    <div className="absolute left-[20%] -top-10 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold">Total Members</p>
                            <p className="text-lg font-extrabold text-gray-900">61.000</p>
                        </div>
                    </div>

                    {/* Card 3: Data Analytics */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 w-80 z-20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800">Data Analytics</h3>
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <BarChart2 size={16} />
                            </div>
                        </div>
                        <div className="relative h-32 w-full">
                            {/* Simplified Chart Line */}
                            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                <path d="M0 35 Q 10 30, 20 32 T 40 25 T 60 15 T 80 20 T 100 5" fill="none" stroke="#2563EB" strokeWidth="2" />
                                <path d="M0 35 Q 10 30, 20 32 T 40 25 T 60 15 T 80 20 T 100 5 V 40 H 0 Z" fill="#EFF6FF" opacity="0.5" />
                                {/* Tooltip Point */}
                                <circle cx="60" cy="15" r="3" fill="#2563EB" stroke="white" strokeWidth="2" />
                                <g transform="translate(45, -5)">
                                    <rect x="0" y="0" width="30" height="16" rx="4" fill="#2563EB" />
                                    <text x="15" y="11" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">48k</text>
                                </g>
                            </svg>
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                            <span>90k</span>
                            <span>60k</span>
                            <span>30k</span>
                            <span>10k</span>
                        </div>
                    </div>

                    {/* Card 4: Instagram */}
                    <div className="absolute right-[20%] top-10 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 w-48">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                <Star size={14} fill="white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Instagram</p>
                                <p className="text-[10px] text-gray-500">12,62 Followers</p>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[70%] rounded-full"></div>
                        </div>
                    </div>

                    {/* Card 5: Sales Stats */}
                    <div className="absolute right-10 top-20 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 w-56 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-gray-500 font-bold">Daily Visitor</p>
                                <p className="text-2xl font-extrabold text-gray-900">800+</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Play size={14} />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-1.5 bg-gray-100 rounded-full w-full"></div>
                                <div className="h-1.5 bg-gray-100 rounded-full w-[80%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logos Section */}
            <section className="py-10 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['monday.com', 'TED', 'Dropbox', 'Orangetheory', 'greenhouse', 'VICE', 'DELL', 'PHILIPS', 'Mural'].map((logo, i) => (
                        <span key={i} className="text-xl font-bold font-serif italic text-gray-800">{logo}</span>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="solution" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
                        How our platform process <br />
                        <span className="text-blue-600">easy to use?</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-blue-200 -z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 w-64 h-40 flex items-center justify-center relative group hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">1</div>
                                <div className="space-y-3 w-full">
                                    <div className="h-2 bg-gray-100 rounded-full w-[60%]"></div>
                                    <div className="h-2 bg-gray-100 rounded-full w-[80%]"></div>
                                    <div className="h-8 bg-blue-50 rounded-lg w-full flex items-center px-3 gap-2">
                                        <div className="w-4 h-4 bg-blue-200 rounded-full"></div>
                                        <div className="h-1.5 bg-blue-200 rounded-full w-[40%]"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Login or sign up</h3>
                            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                                You must log in first to be able to use our platform to get your product analytics.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 w-64 h-40 flex flex-col items-center justify-center relative group hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">2</div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 font-bold mb-2">12,62</p>
                                    <div className="flex gap-1 h-16 items-end justify-center">
                                        <div className="w-3 bg-blue-200 h-[40%] rounded-t-sm"></div>
                                        <div className="w-3 bg-blue-600 h-[80%] rounded-t-sm"></div>
                                        <div className="w-3 bg-red-400 h-[30%] rounded-t-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Connect your website</h3>
                            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                                Select the application you wanted to be able to connect with just a few clicks.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 w-64 h-40 flex flex-col items-center justify-center relative group hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">3</div>
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between items-end h-20 px-4">
                                        <div className="w-4 bg-gray-100 h-[30%] rounded-t-sm"></div>
                                        <div className="w-4 bg-blue-500 h-[70%] rounded-t-sm"></div>
                                        <div className="w-4 bg-gray-100 h-[50%] rounded-t-sm"></div>
                                        <div className="w-4 bg-gray-100 h-[40%] rounded-t-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Take some sales data</h3>
                            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                                You already have sales data of your product with some variants you want.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                            Your Priorities, Our Promise
                        </h2>
                        <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-10">
                            We're not just hiring for roles. We're building futures. Discover how we support students and early-career professionals with purpose, growth, and belonging.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 text-white/80 font-medium text-sm">
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-400" /> Act on real-time</span>
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-400" /> Attract technical talent</span>
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-400" /> Achieve real results</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">U</div>
                        <span className="font-bold text-gray-900">UOMS</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} UOMS. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-gray-500">
                        <a href="#" className="hover:text-blue-600"><Star size={20} /></a>
                        <a href="#" className="hover:text-blue-600"><Users size={20} /></a>
                        <a href="#" className="hover:text-blue-600"><Shield size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
