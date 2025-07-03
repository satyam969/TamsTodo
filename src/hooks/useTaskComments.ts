import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TaskComment, Profile } from '../types';

export type TaskCommentWithUser = TaskComment & { user: Profile };

export const useTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<TaskCommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*, user:profiles(*)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setComments(data as TaskCommentWithUser[] || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (comment: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([comment])
        .select('*, user:profiles(*)');
      if (error) throw error;
      if (data) {
        setComments(prev => [...prev, data[0] as TaskCommentWithUser]);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  return { comments, loading, error, addComment, refetch: fetchComments };
};
