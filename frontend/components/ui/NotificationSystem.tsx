import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Check, X, AlertTriangle, Info, Trash2 } from 'lucide-react';

// ==================== TYPES ====================
interface NotificationConfig {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface ConfirmConfig {
    type: 'save' | 'delete' | 'custom';
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface NotificationContextType {
    showNotification: (config: NotificationConfig) => void;
    showConfirm: (config: ConfirmConfig) => void;
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
}

// ==================== CONTEXT ====================
const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

// ==================== TOAST NOTIFICATION ====================
interface ToastProps {
    notification: NotificationConfig & { id: number };
    onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(notification.id);
        }, notification.duration || 3000);
        return () => clearTimeout(timer);
    }, [notification.id, notification.duration, onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-500',
        info: 'bg-blue-600'
    };

    const icons = {
        success: <Check size={20} />,
        error: <X size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />
    };

    return (
        <div className={`${bgColors[notification.type]} text-white rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[350px] animate-slide-in flex items-start gap-3`}>
            <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    {icons[notification.type]}
                </div>
            </div>
            <div className="flex-1">
                <p className="font-bold">{notification.title}</p>
                {notification.message && (
                    <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                )}
            </div>
            <button onClick={() => onClose(notification.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
                <X size={18} />
            </button>
        </div>
    );
};

// ==================== CONFIRMATION MODAL ====================
const ConfirmModal = ({ config, onClose }: { config: ConfirmConfig, onClose: () => void }) => {
    const handleConfirm = () => {
        config.onConfirm();
        onClose();
    };

    const handleCancel = () => {
        config.onCancel?.();
        onClose();
    };

    const getStyles = () => {
        switch (config.type) {
            case 'delete':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    icon: <Trash2 size={28} />
                };
            case 'save':
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    icon: <Check size={28} />
                };
            default:
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: <AlertTriangle size={28} />
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6 text-center">
                    <div className={`mx-auto ${styles.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.iconColor}`}>
                        {styles.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
                    {config.message && (
                        <p className="text-gray-600 text-sm">{config.message}</p>
                    )}
                </div>
                <div className="flex border-t border-gray-100">
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-4 text-gray-700 font-bold hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                        {config.cancelText || 'Batal'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 py-4 text-white font-bold ${styles.confirmBg} transition-colors`}
                    >
                        {config.confirmText || 'Ya, Lanjutkan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== VALIDATION ERROR DISPLAY ====================
export const ValidationError = ({ message }: { message: string }) => {
    if (!message) return null;
    return (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertTriangle size={12} />
            {message}
        </p>
    );
};

// ==================== STANDALONE CONFIRMATION MODAL ====================
interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal = ({
    isOpen,
    title,
    message,
    type = 'danger',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    const getStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    icon: <Trash2 size={28} />
                };
            case 'warning':
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: <AlertTriangle size={28} />
                };
            default:
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    icon: <Info size={28} />
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className={`mx-auto ${styles.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.iconColor}`}>
                        {styles.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{message}</p>
                </div>
                <div className="flex border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 text-gray-700 font-bold hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-4 text-white font-bold ${styles.confirmBg} transition-colors`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== PROVIDER ====================
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<(NotificationConfig & { id: number })[]>([]);
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

    const showNotification = useCallback((config: NotificationConfig) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { ...config, id }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showConfirm = useCallback((config: ConfirmConfig) => {
        setConfirmConfig(config);
    }, []);

    const showSuccess = useCallback((title: string, message?: string) => {
        showNotification({ type: 'success', title, message });
    }, [showNotification]);

    const showError = useCallback((title: string, message?: string) => {
        showNotification({ type: 'error', title, message });
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm, showSuccess, showError }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[101] space-y-3">
                {notifications.map(notification => (
                    <Toast key={notification.id} notification={notification} onClose={removeNotification} />
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmConfig && (
                <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
            )}
        </NotificationContext.Provider>
    );
};

// ==================== CSS ANIMATIONS (add to globals.css) ====================
/*
@keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes scale-in {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.animate-slide-in {
    animation: slide-in 0.3s ease-out;
}

.animate-scale-in {
    animation: scale-in 0.2s ease-out;
}
*/

export default NotificationProvider;
