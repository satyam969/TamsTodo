import React from 'react';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { TaskWithProfiles, Profile } from '../types/task';

interface ProjectStatsProps {
  tasks: TaskWithProfiles[];
  profiles: Profile[];
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ tasks, profiles }) => {
  const todoCount = tasks.filter(task => task.status === 'todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'inprogress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const overdueCount = tasks.filter(task => 
    task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date()
  ).length;

  const stats = [
    {
      label: 'To Do',
      value: todoCount,
      icon: AlertCircle,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Team Members',
      value: profiles.length,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {stat.label === 'Completed' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          {overdueCount > 0 && stat.label === 'To Do' && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};