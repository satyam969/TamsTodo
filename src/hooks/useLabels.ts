import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Label } from '../types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useLabels = (teamId?: string) => {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('team_id', teamId)
        .order('name');

      if (error) throw error;
      setLabels(data || []);
    } catch (err) {
      console.error('Error fetching labels:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = useCallback(async (name: string, color: string = '#3B82F6') => {
    if (!user || !teamId) return { data: null, error: new Error('User not authenticated or no team selected') };

    try {
      const { data, error } = await supabase
        .from('labels')
        .insert({
          name,
          color,
          team_id: teamId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchLabels();
      toast.success('Label created successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [user, teamId, fetchLabels]);

  const updateLabel = useCallback(async (labelId: string, updates: Partial<Label>) => {
    try {
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', labelId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchLabels();
      toast.success('Label updated successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [fetchLabels]);

  const deleteLabel = useCallback(async (labelId: string) => {
    try {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;
      
      await fetchLabels();
      toast.success('Label deleted successfully!');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { error: err };
    }
  }, [fetchLabels]);

  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels,
  };
};