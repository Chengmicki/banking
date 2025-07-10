import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface NotificationToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
}

export function NotificationToast({ message, type, isVisible, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-5 right-5 z-50 transform transition-transform duration-300 ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className={`rounded-lg shadow-xl border p-4 w-80 ${
        type === 'success' 
          ? 'bg-blue-600 border-blue-700 text-white' 
          : 'bg-red-600 border-red-700 text-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            {type === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
