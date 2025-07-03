import React from 'react';
import { Mail, UserCheck } from 'lucide-react';
import { Profile } from '../types/task';

interface TeamMemberCardProps {
  member: Profile;
  taskCount: number;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, taskCount }) => {
  const getAvatarUrl = (profile: Profile) => {
    if (profile.avatar_url) return profile.avatar_url;
    return `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={getAvatarUrl(member)}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <UserCheck className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{member.role}</p>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Mail className="w-3 h-3" />
            <span>{member.email}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{taskCount}</div>
          <div className="text-xs text-gray-500">Active Tasks</div>
        </div>
      </div>
    </div>
  );
};