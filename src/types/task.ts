export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'completed';
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  created_by_profile?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithProfiles extends Task {
  assignee: Profile | null;
  created_by_profile: Profile;
}