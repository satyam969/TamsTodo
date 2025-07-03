 import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = () => {
  const { notifications, loading } = useNotifications();

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <div key={notification.id} className="bg-white p-3 rounded-lg shadow">
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
