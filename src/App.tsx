import React, { useState, useMemo } from 'react';
import { Plus, CheckSquare, Users, BarChart3, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { TaskFilters } from './components/TaskFilters';
import { TeamMemberCard } from './components/TeamMemberCard';
import { ProjectStats } from './components/ProjectStats';
import { AuthForm } from './components/AuthForm';
import { TeamSelector } from './components/TeamSelector';
import { NotificationCenter } from './components/NotificationCenter';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import ProjectModal from './components/ProjectModal';
import ActivityLog from './components/ActivityLog';
import InviteMemberModal from './components/InviteMemberModal';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { useTeams } from './hooks/useTeams';
import { useAuth } from './hooks/useAuth';
import { TaskWithDetails } from './types';

function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { teams, currentTeam, inviteMember } = useTeams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'team' | 'stats' | 'activity'>('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { projects, addProject } = useProjects(currentTeam?.id ?? '');
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, updateTaskStatus } = useTasks(currentTeam?.id);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const teamMembers = useMemo(() => {
    return currentTeam?.members?.map(member => member.user) || [];
  }, [currentTeam]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesAssignee = !assigneeFilter || task.assignee_id === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TaskWithDetails) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<TaskWithDetails>) => {
    console.log('handleSaveTask called with taskData:', taskData);
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getTaskCountByMember = (memberId: string) => {
    return tasks.filter(task => task.assignee_id === memberId && task.status !== 'completed').length;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster position="top-right" />
      </>
    );
  }

  const loading = tasksLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TeamTasks</h1>
              </div>
              
              <TeamSelector />
              
              <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'tasks' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 inline mr-2" />
                  Tasks
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setSelectedProjectId(undefined);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'projects' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 inline mr-2" />
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'team' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Team
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'stats' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'activity' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Activity
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Hamburger menu icon (hidden on medium and larger screens) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* Replace with an actual hamburger menu icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              
              <div className="text-sm text-gray-600">
                Welcome, {profile?.name}
              </div>
              
              {currentTeam && (
                <button
                  onClick={handleCreateTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              )}
              {currentTeam && activeTab === 'projects' && (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              )}
              {currentTeam && activeTab === 'team' && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu (hidden on medium and larger screens) */}
        <div className={`md:hidden absolute top-16 right-0 bg-white border border-gray-200 rounded-lg shadow-md p-4 ${isMenuOpen ? '' : 'hidden'}`}>
          <button
            onClick={() => setActiveTab('tasks')}
            className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full text-left"
          >
            Tasks
          </button>
          <button
            onClick={() => {
              setActiveTab('projects');
              setSelectedProjectId(undefined);
            }}
            className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full text-left"
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full text-left"
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full text-left"
          >
            Analytics
          </button>
           <button
            onClick={() => setActiveTab('activity')}
            className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full text-left"
          >
            Activity
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentTeam ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team selected</h3>
            <p className="text-gray-600 mb-4">
              Please select a team to start managing tasks
            </p>
          </div>
        ) : (
          <>
            {/* Project Stats */}
            <ProjectStats tasks={tasks as any} profiles={teamMembers} />

            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'tasks' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => {
                  setActiveTab('projects');
                  setSelectedProjectId(undefined);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'projects' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'team' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Team
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stats' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {/* Content based on active tab */}
                {activeTab === 'tasks' && (
                  <div>
                    <TaskFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      priorityFilter={priorityFilter}
                      setPriorityFilter={setPriorityFilter}
                      assigneeFilter={assigneeFilter}
                      setAssigneeFilter={setAssigneeFilter}
                      profiles={teamMembers}
                    />

                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Tasks ({filteredTasks.length})
                      </h2>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-4">
                          {tasks.length === 0 
                            ? "Get started by creating your first task" 
                            : "Try adjusting your filters or search terms"
                          }
                        </p>
                        <button
                          onClick={handleCreateTask}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Create Task
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={updateTaskStatus}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div>
                    {selectedProjectId ? (
                      <ProjectView projectId={selectedProjectId} teamId={currentTeam.id} />
                    ) : (
                      <ProjectList teamId={currentTeam.id} onSelectProject={setSelectedProjectId} />
                    )}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Team Members ({teamMembers.length})
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teamMembers.map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          taskCount={getTaskCountByMember(member.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Project Analytics</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Task Distribution by Status */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
                        <div className="space-y-4">
                          {['todo', 'inprogress', 'review', 'completed', 'cancelled'].map((status) => {
                            const count = tasks.filter(task => task.status === status).length;
                            const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                            const statusLabels = {
                              todo: 'To Do',
                              inprogress: 'In Progress',
                              review: 'Review',
                              completed: 'Completed',
                              cancelled: 'Cancelled'
                            };
                            const statusColors = {
                              todo: 'bg-blue-500',
                              inprogress: 'bg-yellow-500',
                              review: 'bg-purple-500',
                              completed: 'bg-green-500',
                              cancelled: 'bg-gray-500'
                            };
                            
                            return (
                              <div key={status}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">
                                    {statusLabels[status as keyof typeof statusLabels]}
                                  </span>
                                  <span className="text-gray-600">{count} tasks ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${statusColors[status as keyof typeof statusColors]}`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Team Workload */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
                        <div className="space-y-4">
                          {teamMembers.map((member) => {
                            const activeTasks = getTaskCountByMember(member.id);
                            const maxTasks = Math.max(...teamMembers.map(m => getTaskCountByMember(m.id)), 1);
                            const percentage = (activeTasks / maxTasks) * 100;
                            
                            return (
                              <div key={member.id}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <div className="flex items-center space-x-2">
                                    <img 
                                      src={member.avatar_url || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`} 
                                      alt={member.name} 
                                      className="w-6 h-6 rounded-full" 
                                    />
                                    <span className="font-medium text-gray-700">{member.name}</span>
                                  </div>
                                  <span className="text-gray-600">{activeTasks} active tasks</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
                    </div>
                    <ActivityLog teamId={currentTeam?.id} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        profiles={teamMembers}
        teamId={currentTeam?.id}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={async (projectData) => {
          if (editingProject) {
            // await updateProject(editingProject.id, projectData);
          } else {
            if (currentTeam && projectData.name) {
              await addProject({
                ...projectData,
                name: projectData.name,
                description: projectData.description || '',
                status: 'active',
                team_id: currentTeam.id,
                created_by: user.id,
                start_date: null,
                end_date: null,
              });
            }
          }
        }}
        project={editingProject}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={async (email, role) => {
          if (currentTeam) {
            await inviteMember(currentTeam.id, email, role);
          }
        }}
      />
    </div>
  );
}

export default App;
