import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Chat = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500 animate-fade-in">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <MessageSquare size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Chat Feature Coming Soon</h2>
            <p className="text-center max-w-md">
                We are currently building a secure and real-time chat system for Himaforstic.
                Stay tuned for updates!
            </p>
        </div>
    );
};
