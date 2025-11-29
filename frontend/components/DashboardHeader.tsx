
import React from 'react';
import { LogOut } from 'lucide-react';

export const DashboardHeader = ({ user, onLogout }: { user: any, onLogout: () => void }) => (
  <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center mb-8 sticky top-0 z-10 shadow-sm">
    <div className="flex items-center space-x-3">
       <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
       <div>
         <h1 className="text-xl font-bold text-gray-900">UOMS</h1>
         <p className="text-xs text-gray-500">{user.role} Dashboard</p>
       </div>
    </div>
    <div className="flex items-center space-x-4">
       <div className="text-right">
         <p className="font-bold text-gray-900">{user.email}</p>
         <p className="text-xs text-blue-500">{user.status}</p>
       </div>
       <button 
         onClick={onLogout}
         className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
         title="Logout"
       >
         <LogOut size={20} />
       </button>
    </div>
  </header>
);
