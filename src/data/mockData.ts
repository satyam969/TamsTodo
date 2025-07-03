import { Task, TeamMember, Project } from '../types/task';

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'Project Manager'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'Developer'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'Designer'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'Developer'
  }
];

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design Landing Page',
    description: 'Create a modern, responsive landing page for the new product launch',
    priority: 'high',
    status: 'inprogress',
    assignee: 'Carol Davis',
    dueDate: '2025-01-20',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-12T15:30:00Z',
    tags: ['design', 'ui/ux', 'frontend']
  },
  {
    id: '2',
    title: 'API Integration',
    description: 'Integrate third-party payment API and handle error cases',
    priority: 'high',
    status: 'todo',
    assignee: 'Bob Smith',
    dueDate: '2025-01-25',
    createdAt: '2025-01-11T09:15:00Z',
    updatedAt: '2025-01-11T09:15:00Z',
    tags: ['backend', 'api', 'payment']
  },
  {
    id: '3',
    title: 'User Testing',
    description: 'Conduct usability testing with 10 target users and compile feedback',
    priority: 'medium',
    status: 'todo',
    assignee: 'Alice Johnson',
    dueDate: '2025-01-30',
    createdAt: '2025-01-12T14:20:00Z',
    updatedAt: '2025-01-12T14:20:00Z',
    tags: ['testing', 'ux', 'research']
  },
  {
    id: '4',
    title: 'Database Optimization',
    description: 'Optimize database queries and implement caching strategies',
    priority: 'medium',
    status: 'inprogress',
    assignee: 'David Wilson',
    dueDate: '2025-01-22',
    createdAt: '2025-01-08T11:45:00Z',
    updatedAt: '2025-01-13T16:00:00Z',
    tags: ['backend', 'database', 'performance']
  },
  {
    id: '5',
    title: 'Documentation Update',
    description: 'Update project documentation and API references',
    priority: 'low',
    status: 'completed',
    assignee: 'Alice Johnson',
    dueDate: '2025-01-15',
    createdAt: '2025-01-05T08:30:00Z',
    updatedAt: '2025-01-14T12:15:00Z',
    tags: ['documentation', 'maintenance']
  },
  {
    id: '6',
    title: 'Mobile Responsiveness',
    description: 'Ensure all components are fully responsive across devices',
    priority: 'high',
    status: 'todo',
    assignee: 'Carol Davis',
    dueDate: '2025-01-28',
    createdAt: '2025-01-13T13:10:00Z',
    updatedAt: '2025-01-13T13:10:00Z',
    tags: ['frontend', 'responsive', 'mobile']
  }
];

export const sampleProject: Project = {
  id: '1',
  name: 'Team Productivity App',
  description: 'A comprehensive team collaboration and task management application',
  members: teamMembers,
  tasks: sampleTasks
};