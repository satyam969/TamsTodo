import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Team, TeamWithMembers, TeamMember } from '../types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [currentTeam, setCurrentTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching teams...');
      const { data: teamIds, error: teamIdsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (teamIdsError) throw teamIdsError;

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          created_by_profile:profiles!teams_created_by_fkey(*),
          members:team_members(
            *,
            user:profiles(*)
          ),
          projects(*)
        `)
        .in('id', teamIds.map(teamId => teamId.team_id))
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeams(data || []);

      console.log('Teams fetched:', data);
      
      // Set current team if none selected
      if (!currentTeam && data && data.length > 0) {
        setCurrentTeam(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [user, currentTeam]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(async (teamData: { name: string; description?: string }, projectIds: string[] = []) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Associate projects with team
      for (const projectId of projectIds) {
        const { error: teamProjectError } = await supabase
          .from('team_projects')
          .insert({
            team_id: team.id,
            project_id: projectId,
          });

        if (teamProjectError) {
          console.error('Error associating project with team:', teamProjectError);
          toast.error(`Failed to associate project ${projectId} with team`);
        }
      }

      await fetchTeams();
      toast.success('Team created successfully!');
      return { data: team, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [user, fetchTeams]);

  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      await fetchTeams();
      toast.success('Team updated successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [fetchTeams]);

  const inviteMember = useCallback(async (teamId: string, email: string, role: TeamMember['role'] = 'member') => {
    try {
      // First, check if user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) {
        toast.error('User not found with this email');
        return { data: null, error: profileError };
      }

      console.log('Inviting member:', profile.id, 'to team:', teamId);

      // Add to team
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: profile.id,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTeams();
      toast.success('Member invited successfully!');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { data: null, error: err };
    }
  }, [fetchTeams]);

  const removeMember = useCallback(async (teamId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchTeams();
      toast.success('Member removed successfully!');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { error: err };
    }
  }, [fetchTeams]);

  const updateMemberRole = useCallback(async (teamId: string, userId: string, role: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchTeams();
      toast.success('Member role updated successfully!');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      toast.error(error);
      return { error: err };
    }
  }, [fetchTeams]);

  return {
    teams,
    currentTeam,
    setCurrentTeam,
    loading,
    error,
    createTeam,
    updateTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    refetch: fetchTeams,
  };
};
