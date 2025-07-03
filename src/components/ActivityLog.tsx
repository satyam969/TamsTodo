import React from 'react';
import { useActivityLog } from '../hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogProps {
  teamId?: string;
  taskId?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ teamId, taskId }) => {
  const { activities, loading, error } = useActivityLog(teamId, taskId);

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3">
          <img 
            src={activity.user?.avatar_url || ''} 
            alt={activity.user?.name || 'User'} 
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{activity.user?.name}</span> {activity.description}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
