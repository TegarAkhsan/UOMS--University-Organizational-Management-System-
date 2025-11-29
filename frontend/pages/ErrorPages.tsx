import React from 'react';
import { AlertTriangle, Lock, FileWarning, ServerCrash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
    code: number;
    title: string;
    message: string;
    icon?: 'warning' | 'lock' | 'not-found' | 'server';
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, message, icon = 'warning' }) => {
    const navigate = useNavigate();

    const getIcon = () => {
        switch (icon) {
            case 'lock': return <Lock size={64} className="text-red-500" />;
            case 'not-found': return <FileWarning size={64} className="text-yellow-500" />;
            case 'server': return <ServerCrash size={64} className="text-red-600" />;
            default: return <AlertTriangle size={64} className="text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gray-50 rounded-full">
                        {getIcon()}
                    </div>
                </div>
                <h1 className="text-6xl font-black text-gray-900 mb-2">{code}</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-500 mb-8">{message}</p>
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export const NotFound = () => (
    <ErrorPage
        code={404}
        title="Page Not Found"
        message="Oops! The page you are looking for doesn't exist or has been moved."
        icon="not-found"
    />
);

export const Forbidden = () => (
    <ErrorPage
        code={403}
        title="Access Denied"
        message="Sorry, you don't have permission to access this area."
        icon="lock"
    />
);

export const ServerError = () => (
    <ErrorPage
        code={500}
        title="Server Error"
        message="Something went wrong on our end. Please try again later."
        icon="server"
    />
);
