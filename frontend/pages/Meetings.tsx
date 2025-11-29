
import React, { useState } from 'react';
import { Video, Clock, Link, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Card } from '../components/ui/Shared';
import { INITIAL_MEETINGS } from '../data/mockData';

export const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', platform: 'Google Meet', link: '' });

    const handleCreate = (e: any) => {
        e.preventDefault();
        setMeetings([...meetings, { id: Date.now(), ...newMeeting }]);
        setIsCreating(false);
        setNewMeeting({ title: '', date: '', time: '', platform: 'Google Meet', link: '' });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Schedule Meeting</span>
                </button>
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
