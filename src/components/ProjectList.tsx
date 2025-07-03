import React from 'react';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';

interface ProjectListProps {
  teamId: string;
  onSelectProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ teamId, onSelectProject }) => {
  const { projects, loading, error } = useProjects(teamId);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      <ul>
        {projects.map(project => (
          <li key={project.id} onClick={() => onSelectProject(project.id)} className="cursor-pointer hover:bg-gray-200 p-2 rounded">
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
