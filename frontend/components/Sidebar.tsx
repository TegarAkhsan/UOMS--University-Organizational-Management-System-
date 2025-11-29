
import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  DollarSign,
  FileText,
  HelpCircle,
  Building2,
  Calendar as CalendarIcon,
  Video,
  MessageSquare,
  BarChart2
} from 'lucide-react';

import { Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, active, to }: { icon: any; label: string; active: boolean; to: string }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-6 py-3 cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Sidebar = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
          <span className="text-xs">U</span>
        </div>
        <span className="text-xl font-bold text-gray-900">UOMS</span>
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} to="/dashboard" />
        <SidebarItem icon={ClipboardList} label="Program Kerja" active={activeTab === 'Program Kerja'} to="/proker" />
        <SidebarItem icon={Users} label="SDM" active={activeTab === 'SDM'} to="/sdm" />
        <SidebarItem icon={BarChart2} label="Work Dist." active={activeTab === 'Work Dist.'} to="/work-distribution" />
        <SidebarItem icon={DollarSign} label="Keuangan" active={activeTab === 'Keuangan'} to="/keuangan" />
        <SidebarItem icon={FileText} label="Surat" active={activeTab === 'Surat'} to="/surat" />
        <SidebarItem icon={HelpCircle} label="Asistensi" active={activeTab === 'Asistensi'} to="/asistensi" />
        <SidebarItem icon={Building2} label="Departments" active={activeTab === 'Departments'} to="/departments" />
        <SidebarItem icon={CalendarIcon} label="Calendar" active={activeTab === 'Calendar'} to="/calendar" />
        <SidebarItem icon={Video} label="Meetings" active={activeTab === 'Meetings'} to="/meetings" />
        <SidebarItem icon={MessageSquare} label="Chat" active={activeTab === 'Chat'} to="/chat" />
      </nav>
    </div>
  );
};
