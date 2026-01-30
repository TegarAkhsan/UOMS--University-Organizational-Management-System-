import React, { useState, useEffect } from 'react';
import { Video, Clock, Link, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Card } from '../components/ui/Shared';
// import { INITIAL_MEETINGS } from '../data/mockData';
import { useNotification } from '../components/ui/NotificationSystem';
import client from '../src/api/client';

export const Meetings = ({ user, managedProkers, prokers }: { user?: any, managedProkers?: any[], prokers?: any[] }) => {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newMeeting, setNewMeeting] = useState({
        title: '', date: '', time: '', platform: 'Google Meet', link: '',
        audience: 'all', program_id: ''
    });
    const { showSuccess, showError } = useNotification();

    // Derive managed prokers if not explicitly passed but prokers list is available
    const effectiveManagedProkers = managedProkers || (user && prokers ? prokers.filter((p: any) => {
        const isLeader = p.leader_name === user.name || p.leader === user.name;
        // Optionally include other roles if they can manage meetings, but sticking to leader for 'Ketupel' definition
        return isLeader;
    }) : []);

    // Check if user is Ketupel (Manage at least 1 proker)
    const isKetupel = effectiveManagedProkers.length > 0;
    // Check if user is Admin/Kahima
    const isAdmin = user?.status === 'superadmin' || user?.status === 'admin' || user?.department_id === 'BPH';

    const canCreateMeeting = isKetupel || isAdmin;

    useEffect(() => {
        fetchMeetings();
    }, []);

    // Set default audience/program if Ketupel opens create form
    useEffect(() => {
        if (isCreating && isKetupel && effectiveManagedProkers.length > 0) {
            setNewMeeting(prev => ({
                ...prev,
                audience: 'proker_all',
                program_id: String(effectiveManagedProkers[0].id)
            }));
        }
    }, [isCreating, isKetupel, effectiveManagedProkers]);

    const fetchMeetings = () => {
        client.get('/meetings')
            .then(res => setMeetings(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = (e: any) => {
        e.preventDefault();

        // Prepare payload (convert program_id to int if present)
        const payload = {
            ...newMeeting,
            program_id: newMeeting.program_id ? parseInt(newMeeting.program_id) : null
        };

        client.post('/meetings', payload)
            .then(res => {
                setMeetings([res.data, ...meetings]);
                setIsCreating(false);
                setNewMeeting({
                    title: '', date: '', time: '', platform: 'Google Meet', link: '',
                    audience: 'all', program_id: ''
                });
                showSuccess('Meeting scheduled successfully!');
                fetchMeetings(); // Refresh to ensure order
            })
            .catch(err => {
                showError('Failed to schedule meeting.');
                console.error(err);
            });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                {/* Removed duplicate title as requested by user if rendered in dashboard with own title.
                    However, if used standalone, it might need one.
                    Given the request "tidak perlu ada dua tittle meetings", assuming parent handles header or we use a smaller one.
                    Let's keep a smaller header or none if context implies.
                    Using a smaller H2 for section title effectively. */}
                <h2 className="text-xl font-bold text-gray-800">Scheduled Meetings</h2>

                {canCreateMeeting && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        <span>Schedule Meeting</span>
                    </button>
                )}
            </div>

            {/* Reminder Banner Removed as requested */}

            {isCreating && (
                <Card className="mb-6 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Schedule New Meeting</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            required type="text" placeholder="Meeting Title" className="w-full p-3 bg-gray-50 rounded-lg"
                            value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required type="date" className="w-full p-3 bg-gray-50 rounded-lg"
                                value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                            />
                            <input
                                required type="time" className="w-full p-3 bg-gray-50 rounded-lg"
                                value={newMeeting.time} onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                className="w-full p-3 bg-gray-50 rounded-lg"
                                value={newMeeting.platform} onChange={e => setNewMeeting({ ...newMeeting, platform: e.target.value })}
                            >
                                <option>Google Meet</option>
                                <option>Zoom</option>
                            </select>
                            <input
                                required type="text" placeholder="Meeting Link" className="w-full p-3 bg-gray-50 rounded-lg"
                                value={newMeeting.link} onChange={e => setNewMeeting({ ...newMeeting, link: e.target.value })}
                            />
                        </div>

                        {/* Audience Selection Logic */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Target Peserta</label>

                            {/* If Ketupel (and NOT Admin, to simplify view for Ketupel roles) */}
                            {isKetupel && !isAdmin ? (
                                <div className="space-y-3">
                                    {/* Select Project if multiple */}
                                    {effectiveManagedProkers.length > 1 && (
                                        <div>
                                            <label className="text-xs text-gray-500">Program Kerja</label>
                                            <select
                                                className="w-full p-3 bg-gray-50 rounded-lg"
                                                value={newMeeting.program_id}
                                                onChange={e => setNewMeeting({ ...newMeeting, program_id: e.target.value })}
                                            >
                                                {effectiveManagedProkers.map((p: any) => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {/* Ketupel Specific Options */}
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-lg"
                                        value={newMeeting.audience} onChange={e => setNewMeeting({ ...newMeeting, audience: e.target.value })}
                                    >
                                        <option value="proker_coord">Koordinasi Sie (Ketupel & Coordinator)</option>
                                        <option value="proker_all">Rapat Umum (Seluruh Staff Panitia)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        *Case A: Koordinasi Sie notifies Coordinators & Kadep.<br />
                                        *Case B: Rapat Umum notifies all staff in this project.
                                    </p>
                                </div>
                            ) : (
                                // Admin / Global View
                                <select
                                    className="w-full p-3 bg-gray-50 rounded-lg"
                                    value={newMeeting.audience} onChange={e => setNewMeeting({ ...newMeeting, audience: e.target.value })}
                                >
                                    <option value="all">Seluruh Fungsionaris (All Staff)</option>
                                    <option value="kadep_bph">Rapat Pimpinan (Kadep & BPH Only)</option>
                                </select>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 mr-2 text-gray-500">Cancel</button>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Create</button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid gap-4">
                {meetings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">Belum ada Jadwal Meeting</p>
                    </div>
                ) : (
                    meetings.map(meeting => (
                        <div key={meeting.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${meeting.platform === 'Zoom' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{meeting.title}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center"><CalendarIcon size={14} className="mr-1" /> {meeting.date}</span>
                                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {meeting.time}</span>
                                        <span>{meeting.platform}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {meeting.program ? (
                                            <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg font-bold border border-blue-100">
                                                Project: {meeting.program.title}
                                            </div>
                                        ) : (
                                            <div className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-lg font-bold border border-purple-100">
                                                {meeting.audience === 'kadep_bph' ? 'Rapat Pimpinan' : 'Global Meeting'}
                                            </div>
                                        )}
                                        {meeting.audience === 'proker_coord' && (
                                            <div className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-lg font-bold border border-orange-100">
                                                Koordinasi Sie
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={`https://${meeting.link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-bold transition-colors"
                            >
                                <Link size={16} />
                                <span>Join</span>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
