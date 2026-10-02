import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-[#7a93ac]';
        let iconName = 'info';
        let iconColor = 'text-[#b0c9e4]';

        if (toast.type === 'success') {
          borderClass = 'border-[#aacfb6]';
          iconName = 'check_circle';
          iconColor = 'text-[#aacfb6]';
        } else if (toast.type === 'warning') {
          borderClass = 'border-[#C9A66B]';
          iconName = 'warning';
          iconColor = 'text-[#C9A66B]';
        } else if (toast.type === 'error') {
          borderClass = 'border-[#ffb4ab]';
          iconName = 'error';
          iconColor = 'text-[#ffb4ab]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#191c20] border-l-4 ${borderClass} border-r border-t border-b border-[#272a2e] rounded-lg shadow-xl p-3 flex items-start gap-2.5 animate-in slide-in-from-right-5 duration-200`}
          >
            <span className={`material-symbols-outlined text-[18px] ${iconColor} mt-0.5`}>
              {iconName}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px] text-[#e1e2e8]">{toast.title}</div>
              <div className="text-[11px] text-[#8d9197] leading-tight mt-0.5">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8d9197] hover:text-[#e1e2e8] text-[14px] p-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
