export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          task_id: string | null
          type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'attachment_added' | 'team_joined'
          description: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          task_id?: string | null
          type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'attachment_added' | 'team_joined'
          description: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          task_id?: string | null
          type?: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'attachment_added' | 'team_joined'
          description?: string
          metadata?: Json
          created_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          name: string
          color: string
          team_id: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          team_id: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          team_id?: string
          created_by?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'comment_added' | 'due_date_reminder' | 'team_invite'
          title: string
          message: string
          data: Json
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'comment_added' | 'due_date_reminder' | 'team_invite'
          title: string
          message: string
          data?: Json
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'task_assigned' | 'task_completed' | 'comment_added' | 'due_date_reminder' | 'team_invite'
          title?: string
          message?: string
          data?: Json
          read?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member' | 'viewer'
          bio: string | null
          timezone: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member' | 'viewer'
          bio?: string | null
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member' | 'viewer'
          bio?: string | null
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          team_id: string
          status: string
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          team_id: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          team_id?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          filename: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          filename: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          filename?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_dependencies: {
        Row: {
          id: string
          task_id: string
          depends_on_task_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          depends_on_task_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          depends_on_task_id?: string
          created_at?: string
        }
      }
      task_labels: {
        Row: {
          id: string
          task_id: string
          label_id: string
        }
        Insert: {
          id?: string
          task_id: string
          label_id: string
        }
        Update: {
          id?: string
          task_id?: string
          label_id?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'inprogress' | 'review' | 'completed' | 'cancelled'
          assignee_id: string | null
          created_by: string
          project_id: string | null
          team_id: string
          due_date: string | null
          start_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number
          progress: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'inprogress' | 'review' | 'completed' | 'cancelled'
          assignee_id?: string | null
          created_by: string
          project_id?: string | null
          team_id: string
          due_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number
          progress?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'inprogress' | 'review' | 'completed' | 'cancelled'
          assignee_id?: string | null
          created_by?: string
          project_id?: string | null
          team_id?: string
          due_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number
          progress?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'admin' | 'manager' | 'member' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'admin' | 'manager' | 'member' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'member' | 'viewer'
          joined_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          task_id: string
          user_id: string
          description: string | null
          hours: number
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          description?: string | null
          hours: number
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          description?: string | null
          hours?: number
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'attachment_added' | 'team_joined'
      notification_type: 'task_assigned' | 'task_completed' | 'comment_added' | 'due_date_reminder' | 'team_invite'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      task_status: 'todo' | 'inprogress' | 'review' | 'completed' | 'cancelled'
      user_role: 'admin' | 'manager' | 'member' | 'viewer'
    }
  }
}