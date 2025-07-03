import React, { useState } from 'react';
import { useTaskComments } from '../hooks/useTaskComments';
import { useAuth } from '../hooks/useAuth';
import { TaskComment } from '../types';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { comments, loading, error, addComment } = useTaskComments(taskId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    await addComment({
      task_id: taskId,
      user_id: user.id,
      content: newComment,
      parent_id: null,
    });
    setNewComment('');
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start space-x-3">
            <img 
              src={comment.user?.avatar_url || ''} 
              alt={comment.user?.name || 'User'} 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {comment.user?.name} - {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Send
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
