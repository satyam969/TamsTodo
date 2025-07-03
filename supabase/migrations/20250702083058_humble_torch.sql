-- ===========================
-- CLEANUP SECTION
-- ===========================

-- Drop functions
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS log_activity() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS teams_updated_at ON teams;
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS task_comments_updated_at ON task_comments;
DROP TRIGGER IF EXISTS time_entries_updated_at ON time_entries;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tasks_activity_log ON tasks;
DROP TRIGGER IF EXISTS comments_activity_log ON task_comments;

-- Drop tables
DROP TABLE IF EXISTS 
  activity_logs,
  notifications,
  time_entries,
  task_attachments,
  task_comments,
  task_dependencies,
  task_labels,
  tasks,
  labels,
  projects,
  team_members,
  teams,
  profiles 
CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;

-- Drop storage bucket and policies
DELETE FROM storage.buckets WHERE id = 'task-attachments';
DROP POLICY IF EXISTS "Team members can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Team members can read attachments" ON storage.objects;
DROP POLICY IF EXISTS "Uploaders can delete attachments" ON storage.objects;

-- ===========================
-- EXTENSIONS + ENUMS
-- ===========================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member', 'viewer');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'inprogress', 'review', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_completed', 'comment_added', 'due_date_reminder', 'team_invite');
CREATE TYPE activity_type AS ENUM ('task_created', 'task_updated', 'task_completed', 'comment_added', 'attachment_added', 'team_joined');

-- ===========================
-- TABLE CREATION
-- ===========================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role user_role DEFAULT 'member',
  bio text,
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true, "in_app": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  start_date date,
  end_date date,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, name)
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',
  assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  due_date timestamptz,
  start_date timestamptz,
  completed_at timestamptz,
  estimated_hours integer,
  actual_hours integer DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE task_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  label_id uuid REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(task_id, label_id)
);

CREATE TABLE task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE TABLE task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES task_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  description text,
  hours decimal(5,2) NOT NULL CHECK (hours > 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- RLS POLICIES (EXAMPLE)
-- ===========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select their profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow supabase_auth role to insert profiles" ON profiles FOR INSERT TO supabase_auth WITH CHECK (TRUE);

-- Repeat RLS policies similarly for all other tables (teams, tasks, comments, etc.) as needed.

-- ===========================
-- FUNCTIONS & TRIGGERS
-- ===========================

CREATE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  ELSE
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
    RAISE NOTICE 'Name not found in raw_user_meta_data for user %, using email prefix', NEW.email;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating profile for user %: %', NEW.email, SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE FUNCTION log_activity() RETURNS TRIGGER AS $$
DECLARE
  activity_description text;
  activity_type_val activity_type;
BEGIN
  IF TG_TABLE_NAME = 'tasks' THEN
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'task_created';
      activity_description := 'Created task: ' || NEW.title;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
        activity_type_val := 'task_completed';
        activity_description := 'Completed task: ' || NEW.title;
      ELSE
        activity_type_val := 'task_updated';
        activity_description := 'Updated task: ' || NEW.title;
      END IF;
    END IF;

    INSERT INTO activity_logs (user_id, team_id, task_id, type, description, metadata)
    VALUES (
      COALESCE(NEW.assignee_id, NEW.created_by),
      NEW.team_id,
      NEW.id,
      activity_type_val,
      activity_description,
      jsonb_build_object('task_id', NEW.id, 'task_title', NEW.title)
    );

  ELSIF TG_TABLE_NAME = 'task_comments' THEN
    activity_type_val := 'comment_added';
    activity_description := 'Added comment to task';
    INSERT INTO activity_logs (user_id, team_id, task_id, type, description, metadata)
    SELECT 
      NEW.user_id,
      t.team_id,
      NEW.task_id,
      activity_type_val,
      activity_description,
      jsonb_build_object('comment_id', NEW.id, 'task_id', NEW.task_id)
    FROM tasks t WHERE t.id = NEW.task_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tasks_activity_log AFTER INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER comments_activity_log AFTER INSERT ON task_comments FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ===========================
-- STORAGE CONFIG
-- ===========================

INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

CREATE POLICY "Team members can upload attachments" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Team members can read attachments" ON storage.objects FOR SELECT TO authenticated 
  USING (bucket_id = 'task-attachments');

CREATE POLICY "Uploaders can delete attachments" ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
