
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

export const Sidebar = ({ activeTab, isOpen, onClose }: { activeTab: string, isOpen: boolean, onClose: () => void }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
              <span className="text-xs">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UOMS</span>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
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
    </>
  );
};
