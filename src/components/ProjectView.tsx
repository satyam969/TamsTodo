import React from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Project, Task } from '../types';
import { TaskCard } from './TaskCard';

interface ProjectViewProps {
  projectId: string;
  teamId: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId, teamId }) => {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects(teamId);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(projectId);

  if (projectsLoading || tasksLoading) return <div>Loading...</div>;
  if (projectsError) return <div>Error loading project: {projectsError.message}</div>;
  if (tasksError) return <div>Error loading tasks.</div>;

  const project = projects.find(p => p.id === projectId);

  if (!project) return <div>Project not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="text-gray-600 mb-4">{project.description}</p>
      
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusChange={() => {}} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
