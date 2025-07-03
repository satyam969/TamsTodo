import { Database } from '../lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskComment = Database['public']['Tables']['task_comments']['Row'];
export type TaskAttachment = Database['public']['Tables']['task_attachments']['Row'];
export type TaskDependency = Database['public']['Tables']['task_dependencies']['Row'];
export type Label = Database['public']['Tables']['labels']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];

export interface TaskWithDetails extends Task {
  assignee?: Profile;
  created_by_profile?: Profile;
  project?: Project;
  team?: Team;
  comments?: (TaskComment & { user: Profile })[];
  attachments?: TaskAttachment[];
  dependencies?: (TaskDependency & { depends_on_task: Task })[];
  labels?: Label[];
  time_entries?: (TimeEntry & { user: Profile })[];
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: Profile })[];
  projects?: Project[];
  created_by_profile?: Profile;
}

export interface NotificationWithData extends Notification {
  task?: Task;
  team?: Team;
}

export type UserRole = Database['public']['Enums']['user_role'];
export type TaskPriority = Database['public']['Enums']['task_priority'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type NotificationType = Database['public']['Enums']['notification_type'];
export type ActivityType = Database['public']['Enums']['activity_type'];