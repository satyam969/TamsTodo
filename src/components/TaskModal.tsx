import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Tag, Clock, Paperclip, MessageSquare } from 'lucide-react';
import { TaskWithDetails, Profile, Label } from '../types';
import { useLabels } from '../hooks/useLabels';
import { formatDistanceToNow } from 'date-fns';
import TaskComments from './TaskComments';
import TaskDependencies from './TaskDependencies';
import TaskAttachments from './TaskAttachments';
import TimeEntries from './TimeEntries';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskWithDetails>) => void;
  task?: TaskWithDetails | null;
  profiles: Profile[];
  teamId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  task, 
  profiles,
  teamId 
}) => {
  const { labels,createLabel } = useLabels(teamId);
  
  const [formData, setFormData] = useState<Partial<TaskWithDetails>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee_id: null,
    due_date: '',
    start_date: '',
    estimated_hours: null,
    progress: 0,
    tags: []
  });
  const [newLabelName, setNewLabelName] = useState('');
const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'dependencies' | 'attachments' | 'time'>('details');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee_id: task.assignee_id,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        start_date: task.start_date ? task.start_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours,
        progress: task.progress,
        tags: task.tags || []
      });
      setSelectedLabels(task.labels?.map(l => l.id) || []);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee_id: null,
        due_date: '',
        start_date: '',
        estimated_hours: null,
        progress: 0,
        tags: []
      });
      setSelectedLabels([]);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    if (formData.title && formData.title.trim()) {
      onSave({
        ...formData
        // labels: selectedLabels.map(id => labels.find(l => l.id === id)).filter(Boolean) as Label[]
      });
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'todo'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Assignee
                </label>
                <select
                  value={formData.assignee_id || ''}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} - {profile.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress || 0}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Labels */}
             {/* Labels */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Labels
  </label>

  {labels.length === 0 ? (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">No labels found for this team.</p>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          placeholder="Label name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="color"
          value={newLabelColor}
          onChange={(e) => setNewLabelColor(e.target.value)}
          className="w-10 h-10 border-2 border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={async () => {
            if (!newLabelName.trim()) return toast.error('Label name required');
            const { error } = await createLabel(newLabelName.trim(), newLabelColor);
            if (!error) {
              setNewLabelName('');
              setNewLabelColor('#3B82F6');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <button
          key={label.id}
          type="button"
          onClick={() => toggleLabel(label.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            selectedLabels.includes(label.id)
              ? 'border-transparent text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          style={{
            backgroundColor: selectedLabels.includes(label.id) ? label.color : 'transparent',
            borderColor: selectedLabels.includes(label.id) ? label.color : undefined,
          }}
        >
          {label.name}
        </button>
      ))}
    </div>
  )}
</div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-purple-500 hover:text-purple-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar for existing task */}
          {task && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4">
                <div className="flex space-x-1 mb-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeTab === 'comments' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Comments ({task.comments?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeTab === 'dependencies' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Dependencies ({task.dependencies?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeTab === 'attachments' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Attachments ({task.attachments?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('time')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeTab === 'time' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Time
                  </button>
                </div>

                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                      {task.attachments && task.attachments.length > 0 ? (
                        <div className="space-y-2">
                          {task.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate">{attachment.filename}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No attachments</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Time Tracking</h4>
                      <div className="bg-white p-3 rounded border">
                        <div className="flex justify-between text-sm">
                          <span>Estimated:</span>
                          <span>{task.estimated_hours || 0}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Actual:</span>
                          <span>{task.actual_hours || 0}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <TaskComments taskId={task.id} />
                )}

                {activeTab === 'dependencies' && (
                  <TaskDependencies taskId={task.id} projectId={task.project_id || undefined} />
                )}

                {activeTab === 'attachments' && (
                  <TaskAttachments taskId={task.id} />
                )}

                {activeTab === 'time' && (
                  <TimeEntries taskId={task.id} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
