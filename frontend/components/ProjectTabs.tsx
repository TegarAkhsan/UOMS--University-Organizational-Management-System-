import React from 'react';
import { LayoutDashboard, Users, Calendar, DollarSign, FileText } from 'lucide-react';

export const ProjectTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'committee', label: 'Committee', icon: Users },
        { id: 'timeline', label: 'Timeline', icon: Calendar },
        { id: 'finance', label: 'Finance', icon: DollarSign },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${isActive
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Icon size={16} className={`mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
