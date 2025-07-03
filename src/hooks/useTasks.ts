import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskWithDetails } from '../types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useTasks = (teamId?: string) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user || !teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
       .select(`
  *
  //       ,
  // assignee:profiles!tasks_assignee_id_fkey(*),
  // created_by_profile:profiles!tasks_created_by_fkey(*),
  // project:projects(*),
  // team:teams(*),
  // comments:task_comments(
  //   *,
  //   user:profiles(*)
  // ),
  // attachments:task_attachments(*),
  // dependencies:task_dependencies(
  //   *,
  //   depends_on_task:tasks(*)
  // ),
  // task_labels:task_labels(
  //   label:labels(*)
  // ),
  // time_entries:time_entries(
  //   *,
  //   user:profiles(*)
  // )
`)
.eq('team_id', teamId)
        .order('created_at', { ascending: false });

        console.log(data);

      if (error) throw error;

     const transformedTasks = data?.map(task => ({
  ...task,
  labels: task.task_labels?.map((tl: any) => tl.label) || []
})) || [];


      setTasks(transformedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, teamId]);

  useEffect(() => {
    fetchTasks();

    if (!teamId) return;

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          match: { team_id: teamId }
        },
        (payload) => {
          console.log('📡 Task change received:', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, teamId]);

const addTask = useCallback(async (taskData: Partial<Task>) => {
  console.trace('addTask called with taskData:', taskData);
  if (!user || !teamId) {
    return { data: null, error: new Error('User not authenticated or no team selected') };
  }

  try {
    // Insert into tasks table
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        created_by: user.id,
        team_id: teamId,
      })
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(*),
        created_by_profile:profiles!tasks_created_by_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // ✅ Insert into task_labels junction table
    if (taskData.labels && taskData.labels.length > 0 && data?.id) {
      const labelInserts = taskData.labels.map(label => ({
        task_id: data.id,
        label_id: label.id,
      }));
      const { error: labelError } = await supabase.from('task_labels').insert(labelInserts);
      if (labelError) {
        console.error('Error inserting task_labels:', labelError);
        throw labelError;
      }
    }

    await fetchTasks();
    toast.success('Task created successfully!');
    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    toast.error(errorMessage);
    return { data: null, error: err };
  }
}, [user, teamId, fetchTasks]);


  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(*),
          created_by_profile:profiles!tasks_created_by_fkey(*)
        `)
        .single();

      if (error) throw error;

      toast.success('Task updated successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully!');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { error: err };
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    const updates: Partial<Task> = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.progress = 100;
    }
    return updateTask(taskId, updates);
  }, [updateTask]);

  const addComment = useCallback(async (taskId: string, content: string, parentId?: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content,
          parent_id: parentId,
        })
        .select(`
          *,
          user:profiles(*)
        `)
        .single();

      if (error) throw error;

      toast.success('Comment added successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [user]);

  const addTimeEntry = useCallback(async (taskId: string, hours: number, description?: string, date?: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          user_id: user.id,
          hours,
          description,
          date: date || new Date().toISOString().split('T')[0],
        })
        .select(`
          *,
          user:profiles(*)
        `)
        .single();

      if (error) throw error;

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('task_id', taskId);

      const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0;

      await supabase
        .from('tasks')
        .update({ actual_hours: totalHours })
        .eq('id', taskId);

      toast.success('Time entry added successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [user]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addComment,
    addTimeEntry,
    refetch: fetchTasks,
  };
};
