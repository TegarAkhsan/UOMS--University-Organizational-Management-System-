
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Save } from 'lucide-react';
import { Badge, Modal } from '../components/ui/Shared';
import { DEPARTMENTS } from '../data/mockData';

export const Calendar = ({ prokers, setProkers, members }: { prokers: any[], setProkers?: (p: any[]) => void, members?: any[] }) => {
    // State for navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState<{ date: string, events: any[] } | null>(null);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

    // State for scheduling
    const [isScheduling, setIsScheduling] = useState(false);
    const [newProker, setNewProker] = useState({
        title: '',
        description: '',
        leader: '',
        department: 'BPH',
        deadline: ''
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Calendar Logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (dateStr: string, events: any[]) => {
        setSelectedDateEvents({ date: dateStr, events });
    };

    const handleOpenSchedule = (dateStr?: string) => {
        setNewProker({
            title: '',
            description: '',
            leader: '',
            department: 'BPH',
            deadline: dateStr || new Date().toISOString().split('T')[0]
        });
        setIsScheduling(true);
    };

    const handleSaveProker = (e: React.FormEvent) => {
        e.preventDefault();
        if (setProkers && newProker.title && newProker.deadline) {
            const newEntry = {
                id: Date.now().toString(),
                ...newProker,
                status: 'On Progress',
                progress: 0,
                objectives: '-',
                benefits: '-',
                impact: '-'
            };
            setProkers([...prokers, newEntry]);
            setIsScheduling(false);
            alert(`Successfully scheduled "${newProker.title}" on ${newProker.deadline}`);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Program Calendar</h1>
                    <p className="text-sm text-blue-500">Schedule and manage event timelines.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleOpenSchedule()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Schedule Proker
                    </button>

                    <div className="flex items-center space-x-4 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-lg text-gray-900 w-40 text-center">
                            {months[month]} {year}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 mb-4 border-b pb-2">
                    {days.map(d => (
                        <div key={d} className="text-center font-bold text-gray-400 text-sm uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                    {/* Empty cells for previous month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-50/30 rounded-lg"></div>
                    ))}

                    {/* Days of current month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                        // Filter prokers matching this date
                        const dayEvents = prokers.filter(p => p.deadline === dateStr);
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(dateStr, dayEvents)}
                                className={`
                            border rounded-lg p-1 flex flex-col min-h-[80px] transition-all relative group
                            ${hasEvents ? 'bg-blue-50 border-blue-200 hover:shadow-md cursor-pointer' : 'bg-white border-gray-100 hover:bg-gray-50'}
                            ${isToday ? 'ring-2 ring-blue-600 ring-inset' : ''}
                        `}
                            >
                                {/* Header of Cell */}
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`
                                  font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full
                                  ${isToday ? 'bg-blue-600 text-white' : hasEvents ? 'bg-blue-200 text-blue-800' : 'text-gray-400'}
                              `}>
                                        {day}
                                    </span>
                                    {/* Quick Add Button (Visible on Hover) */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenSchedule(dateStr); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 bg-gray-200 hover:bg-blue-600 hover:text-white rounded text-gray-600 transition-all"
                                        title="Add Event Here"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>

                                <div className="space-y-1 overflow-y-auto no-scrollbar">
                                    {dayEvents.slice(0, 3).map(ev => (
                                        <div
                                            key={ev.id}
                                            className="relative"
                                            onMouseEnter={() => setHoveredEvent(ev.id)}
                                            onMouseLeave={() => setHoveredEvent(null)}
                                        >
                                            <div className={`
                                          text-[10px] px-2 py-1 rounded truncate font-bold shadow-sm
                                          ${ev.status === 'Done' ? 'bg-green-100 text-green-700' :
                                                    ev.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-white text-blue-700 border border-blue-100'}
                                      `}>
                                                {ev.title}
                                            </div>

                                            {/* Hover Tooltip */}
                                            {hoveredEvent === ev.id && (
                                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in">
                                                    <h4 className="font-bold text-gray-900 mb-1">{ev.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{ev.description?.substring(0, 50) || 'No desc'}...</p>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ev.department}</span>
                                                        <span className={`font-bold ${ev.status === 'Done' ? 'text-green-600' :
                                                            ev.status === 'Cancelled' ? 'text-red-600' :
                                                                'text-blue-600'
                                                            }`}>{ev.status}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-blue-600 pl-1 font-bold">
                                            + {dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal for Date Details */}
            <Modal
                isOpen={!!selectedDateEvents}
                onClose={() => setSelectedDateEvents(null)}
                title={selectedDateEvents ? `Events: ${new Date(selectedDateEvents.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
            >
                <div className="space-y-4">
                    {selectedDateEvents?.events.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <CalendarIcon size={48} className="mx-auto text-gray-300 mb-2" />
                            <p>No events scheduled for this day.</p>
                            <button
                                onClick={() => {
                                    handleOpenSchedule(selectedDateEvents.date);
                                    setSelectedDateEvents(null);
                                }}
                                className="mt-4 text-blue-600 font-bold hover:underline"
                            >
                                Schedule One Now
                            </button>
                        </div>
                    )}

                    {selectedDateEvents?.events.map((ev, idx) => (
                        <div key={idx} className="flex flex-col p-4 border border-gray-100 rounded-xl bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{ev.title}</h3>
                                <Badge status={ev.status === 'Active' ? 'On Progress' : ev.status} />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{ev.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Department</p>
                                    <p className="font-medium text-gray-700">{ev.department}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Project Leader</p>
                                    <p className="font-medium text-blue-600">{ev.leader}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Modal for Scheduling Proker */}
            <Modal isOpen={isScheduling} onClose={() => setIsScheduling(false)} title="Schedule Program Kerja">
                <form onSubmit={handleSaveProker} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Project Name</label>
                        <input
                            required
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. WORKSHOP PRO"
                            value={newProker.title}
                            onChange={e => setNewProker({ ...newProker, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Brief description..."
                            value={newProker.description}
                            onChange={e => setNewProker({ ...newProker, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                                value={newProker.department}
                                onChange={e => setNewProker({ ...newProker, department: e.target.value })}
                            >
                                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input
                                required
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-xl"
                                value={newProker.deadline}
                                onChange={e => setNewProker({ ...newProker, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Leader (Ketua Pelaksana)</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                            value={newProker.leader}
                            onChange={e => setNewProker({ ...newProker, leader: e.target.value })}
                        >
                            <option value="">Select Leader</option>
                            {members && members.map(m => (
                                <option key={m.id} value={m.name}>{m.name} ({m.dept})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center shadow hover:bg-blue-700">
                            <Save size={18} className="mr-2" /> Schedule Event
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
