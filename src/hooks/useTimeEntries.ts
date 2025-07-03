import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TimeEntry, Profile } from '../types';

export type TimeEntryWithUser = TimeEntry & { user: Profile };

export const useTimeEntries = (taskId: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeEntries = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, user:profiles(*)')
        .eq('task_id', taskId)
        .order('date', { ascending: false });
      if (error) throw error;
      setTimeEntries(data as TimeEntryWithUser[] || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  const addTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entry])
        .select('*, user:profiles(*)');
      if (error) throw error;
      if (data) {
        setTimeEntries(prev => [data[0] as TimeEntryWithUser, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  const removeTimeEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
      setTimeEntries(prev => prev.filter(e => e.id !== entryId));
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  return { timeEntries, loading, error, addTimeEntry, removeTimeEntry, refetch: fetchTimeEntries };
};
