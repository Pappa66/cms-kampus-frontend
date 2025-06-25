import React from 'react';

interface NotificationProps {
  message: string;
  type?: 'info' | 'error' | 'success';
  onClose: () => void; // Wajib ada untuk menutup notifikasi
}

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose }) => {
  const colorClass =
    type === 'success'
      ? 'bg-green-100 text-green-700'
      : type === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700';

  return (
    <div className={`${colorClass} p-3 rounded mb-4 flex justify-between items-center`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full text-current hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-current"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
