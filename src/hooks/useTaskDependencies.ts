import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TaskDependency, Task } from '../types';

export const useTaskDependencies = (taskId: string) => {
  const [dependencies, setDependencies] = useState<(TaskDependency & { depends_on_task: Task })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDependencies = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*, depends_on_task:tasks!depends_on_task_id(*)')
        .eq('task_id', taskId);
      if (error) throw error;
      setDependencies(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const addDependency = async (dependsOnTaskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert([{ task_id: taskId, depends_on_task_id: dependsOnTaskId }])
        .select('*, depends_on_task:tasks!depends_on_task_id(*)');
      if (error) throw error;
      if (data) {
        setDependencies(prev => [...prev, data[0]]);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);
      if (error) throw error;
      setDependencies(prev => prev.filter(d => d.id !== dependencyId));
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  return { dependencies, loading, error, addDependency, removeDependency, refetch: fetchDependencies };
};
