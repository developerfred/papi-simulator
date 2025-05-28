"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  txHash?: string;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep only last 10

    // Auto-remove notification
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Individual notification component
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
  }, []);

  const handleRemove = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-green-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-red-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-yellow-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="flex-shrink-0 w-5 h-5 text-blue-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': 
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': 
      default: return 'text-blue-800';
    }
  };

  return (
    <div className={`
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`max-w-sm w-full border rounded-lg shadow-lg ${getBgColor()}`}>
        <div className="p-4">
          <div className="flex items-start">
            {getIcon()}
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${getTextColor()}`}>
                {notification.title}
              </p>
              <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>
                {notification.message}
              </p>
              {notification.txHash && (
                <div className="mt-2">
                  <code className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                    {notification.txHash.slice(0, 10)}...
                  </code>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleRemove}
                className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none`}
              >
                <span className="sr-only">Fechar</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications container
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.length > 3 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={clearAll}
            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            Limpar todas ({notifications.length})
          </button>
        </div>
      )}
      
      {notifications.slice(0, 5).map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

// Transaction-specific notification hooks
export const useTransactionNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyTransactionStart = useCallback((txHash: string, method: string) => {
    addNotification({
      type: 'info',
      title: 'Transação Iniciada',
      message: `${method} foi enviada para a rede`,
      txHash,
      autoClose: true,
      duration: 3000
    });
  }, [addNotification]);

  const notifyTransactionInBlock = useCallback((txHash: string, blockHash: string) => {
    addNotification({
      type: 'warning',
      title: 'Transação no Bloco',
      message: `Transação incluída no bloco ${blockHash.slice(0, 10)}...`,
      txHash,
      autoClose: true,
      duration: 4000
    });
  }, [addNotification]);

  const notifyTransactionFinalized = useCallback((txHash: string, blockHash: string) => {
    addNotification({
      type: 'success',
      title: 'Transação Finalizada',
      message: `Transação confirmada no bloco ${blockHash.slice(0, 10)}...`,
      txHash,
      autoClose: true,
      duration: 5000
    });
  }, [addNotification]);

  const notifyTransactionError = useCallback((txHash: string, error: string) => {
    addNotification({
      type: 'error',
      title: 'Erro na Transação',
      message: error,
      txHash,
      autoClose: false // Keep error notifications visible
    });
  }, [addNotification]);

  const notifyConnectionStatus = useCallback((status: 'connected' | 'disconnected' | 'error', network?: string) => {
    const messages = {
      connected: `Conectado à rede ${network}`,
      disconnected: `Desconectado da rede ${network}`,
      error: `Erro de conexão com a rede ${network}`
    };

    addNotification({
      type: status === 'connected' ? 'success' : status === 'error' ? 'error' : 'warning',
      title: 'Status da Conexão',
      message: messages[status],
      autoClose: true,
      duration: 3000
    });
  }, [addNotification]);

  return {
    notifyTransactionStart,
    notifyTransactionInBlock,
    notifyTransactionFinalized,
    notifyTransactionError,
    notifyConnectionStatus
  };
};

export default NotificationContainer;