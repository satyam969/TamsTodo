import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TaskAttachment } from '../types';

export const useTaskAttachments = (taskId: string) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAttachments = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId);
      if (error) throw error;
      setAttachments(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const addAttachment = async (file: File, userId: string) => {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(`${userId}/${taskId}/${file.name}`, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(uploadData.path);

      const newAttachment = {
        task_id: taskId,
        user_id: userId,
        filename: file.name,
        file_url: publicUrlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
      };

      const { data, error } = await supabase
        .from('task_attachments')
        .insert([newAttachment])
        .select();
        
      if (error) throw error;
      if (data) {
        setAttachments(prev => [...prev, data[0]]);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  const removeAttachment = async (attachmentId: string, filePath: string) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);
      if (error) throw error;
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  return { attachments, loading, error, addAttachment, removeAttachment, refetch: fetchAttachments };
};
