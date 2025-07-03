import React, { useState } from 'react';
import { useTaskDependencies } from '../hooks/useTaskDependencies';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types';

interface TaskDependenciesProps {
  taskId: string;
  projectId?: string;
}

const TaskDependencies: React.FC<TaskDependenciesProps> = ({ taskId, projectId }) => {
  const { dependencies, loading, error, addDependency, removeDependency } = useTaskDependencies(taskId);
  const { tasks } = useTasks(projectId);
  const [selectedTask, setSelectedTask] = useState('');

  const handleAddDependency = async () => {
    if (!selectedTask) return;
    await addDependency(selectedTask);
    setSelectedTask('');
  };

  if (loading) return <div>Loading dependencies...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Dependencies</h3>
      <div className="space-y-2">
        {dependencies.map(dep => (
          <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
            <span>{dep.depends_on_task.title}</span>
            <button onClick={() => removeDependency(dep.id)} className="text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        >
          <option value="">Select a task to add as a dependency</option>
          {tasks
            .filter(task => task.id !== taskId && !dependencies.some(d => d.depends_on_task_id === task.id))
            .map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
          ))}
        </select>
        <button onClick={handleAddDependency} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Add
        </button>
      </div>
    </div>
  );
};

export default TaskDependencies;
