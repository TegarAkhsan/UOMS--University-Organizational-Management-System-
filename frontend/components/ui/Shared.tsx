
import React from 'react';
import { X } from 'lucide-react';

export const Card = ({ children, className = '', ...props }: { children?: React.ReactNode; className?: string;[key: string]: any }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ status }: { status: string }) => {
  const styles: { [key: string]: string } = {
    Active: 'bg-green-100 text-green-700',
    Completed: 'bg-blue-100 text-blue-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Upcoming: 'bg-purple-100 text-purple-700',
    Inactive: 'bg-gray-100 text-gray-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Done: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
    Review: 'bg-gray-100 text-gray-700',
    'To Do': 'bg-gray-100 text-gray-700',
    Income: 'bg-green-50 text-green-600 border border-green-200',
    Expense: 'bg-red-50 text-red-600 border border-red-200',
    'On Progress': 'bg-blue-100 text-blue-700',
    not_started: 'bg-gray-100 text-gray-500 italic'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Inactive}`}>
      {status === 'not_started' ? 'Not Started' : status}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[9999] transition-opacity duration-300">
      <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <div className="bg-green-500 rounded-full p-1">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="text-green-600 hover:text-green-800 ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
