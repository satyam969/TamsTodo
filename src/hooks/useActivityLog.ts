import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityLog, Profile } from '../types';

export type ActivityLogWithUser = ActivityLog & { user: Profile };

export const useActivityLog = (teamId?: string, taskId?: string) => {
  const [activities, setActivities] = useState<ActivityLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('activity_logs').select('*, user:profiles(*)');
      if (teamId) {
        query = query.eq('team_id', teamId);
      }
      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      setActivities(data as ActivityLogWithUser[] || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [teamId, taskId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities };
};
