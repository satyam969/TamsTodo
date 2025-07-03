import React, { useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { TeamWithMembers } from '../types';
import TeamModal from './TeamModal';

interface TeamSelectorProps {
  onTeamChange?: (team: TeamWithMembers) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ onTeamChange }) => {
  const { teams, currentTeam, setCurrentTeam, createTeam } = useTeams();
  const [isOpen, setIsOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleTeamSelect = (team: TeamWithMembers) => {
    setCurrentTeam(team);
    onTeamChange?.(team);
    setIsOpen(false);
  };

  const handleSaveTeam = async (teamData: Partial<Omit<TeamWithMembers, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    if (teamData.name) {
      await createTeam({ name: teamData.name, description: teamData.description || undefined });
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Users className="w-5 h-5" />
        <span>No team selected</span>
        {teams.length === 0 && (
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first team</span>
          </button>
        )}
        <TeamModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {currentTeam.avatar_url ? (
            <img 
              src={currentTeam.avatar_url} 
              alt={currentTeam.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
          )}
          <span className="font-medium text-gray-900">{currentTeam.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
              Your Teams
            </div>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                  currentTeam.id === team.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {team.avatar_url ? (
                  <img 
                    src={team.avatar_url} 
                    alt={team.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium">{team.name}</div>
                  <div className="text-xs text-gray-500">
                    {team.members?.length || 0} members
                  </div>
                </div>
              </button>
            ))}
            
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button 
                onClick={() => setIsTeamModalOpen(true)}
                className="w-full flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
              >
                <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
                <span className="font-medium">Create new team</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
};
