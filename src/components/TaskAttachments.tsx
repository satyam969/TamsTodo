import React, { useState } from 'react';
import { useTaskAttachments } from '../hooks/useTaskAttachments';
import { useAuth } from '../hooks/useAuth';
import { Paperclip, Trash2 } from 'lucide-react';

interface TaskAttachmentsProps {
  taskId: string;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const { attachments, loading, error, addAttachment, removeAttachment } = useTaskAttachments(taskId);
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    await addAttachment(file, user.id);
    setFile(null);
  };

  const getFilePath = (fileUrl: string) => {
    const url = new URL(fileUrl);
    return url.pathname.split('/task-attachments/')[1];
  }

  if (loading) return <div>Loading attachments...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Attachments</h3>
      <div className="space-y-2">
        {attachments.map(attachment => (
          <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
            <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4" />
              <span>{attachment.filename}</span>
            </a>
            <button onClick={() => removeAttachment(attachment.id, getFilePath(attachment.file_url))} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <input
          type="file"
          onChange={handleFileChange}
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Upload
        </button>
      </div>
    </div>
  );
};

export default TaskAttachments;
