
import React, { useState } from 'react';
import { Badge, Modal } from './ui/Shared';
import { Calendar, ChevronRight, ChevronLeft, Paperclip, CheckCircle } from 'lucide-react';

export const Kanban = ({ tasks, onUpdateTask, isEditable, customColumns, allowMarkDone = true, onTaskClick }: { tasks: any[], onUpdateTask: (task: any) => void, isEditable: boolean, customColumns?: any[], allowMarkDone?: boolean, onTaskClick?: (task: any) => void }) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);

    const columns = customColumns || [
        { id: 'ready', title: 'Ready to Start', color: 'bg-gray-100 border-gray-200' },
        { id: 'in_progress', title: 'On Progress', color: 'bg-blue-50 border-blue-200' },
        { id: 'review_coordinator', title: 'Needs Review', color: 'bg-yellow-50 border-yellow-200' },
        { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' }
    ];

    const handleMove = (e: React.MouseEvent, task: any, direction: 'next' | 'prev') => {
        e.stopPropagation();
        const currentIndex = columns.findIndex(c => c.id === task.status);
        if (currentIndex === -1) return;

        let newStatus = task.status;
        if (direction === 'next' && currentIndex < columns.length - 1) {
            newStatus = columns[currentIndex + 1].id;
        } else if (direction === 'prev' && currentIndex > 0) {
            newStatus = columns[currentIndex - 1].id;
        }

        onUpdateTask({ ...task, status: newStatus });
    };

    const handleTaskClick = (task: any) => {
        if (onTaskClick) {
            onTaskClick(task);
        } else {
            setSelectedTask(task);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 h-[600px] overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className={`flex-1 min-w-[300px] rounded-xl border p-4 flex flex-col ${col.color}`}>
                    <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                        {col.title}
                        <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200">
                            {tasks.filter(t => t.status === col.id).length}
                        </span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {tasks.filter(t => t.status === col.id).map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 text-sm">{task.title || task.task}</h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                    {task.description || "No description provided."}
                                </p>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span className="flex items-center">
                                        <Calendar size={12} className="mr-1" /> {task.deadline || task.dueDate}
                                    </span>
                                    {isEditable && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {col.id !== 'To Do' && (
                                                <button
                                                    onClick={(e) => handleMove(e, task, 'prev')}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                            )}
                                            {col.id !== 'Done' && (
                                                <button
                                                    onClick={(e) => handleMove(e, task, 'next')}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Detail">
                {selectedTask && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedTask.title || selectedTask.task}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge status={selectedTask.status} />
                                <span className="text-sm text-gray-500">Due: {selectedTask.deadline || selectedTask.dueDate}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {selectedTask.description || "This task has no detailed description provided by the coordinator."}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Evidence / Bukti</h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                <Paperclip className="mx-auto text-gray-400 mb-2" size={24} />
                                <p className="text-sm text-gray-500">Upload screenshot or document</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            {allowMarkDone && selectedTask.status !== 'Done' && (
                                <button
                                    onClick={() => {
                                        onUpdateTask({ ...selectedTask, status: 'Done' });
                                        setSelectedTask(null);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Mark as Done
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
