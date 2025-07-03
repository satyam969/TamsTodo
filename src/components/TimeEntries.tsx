import React, { useState } from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useAuth } from '../hooks/useAuth';
import { Trash2 } from 'lucide-react';

interface TimeEntriesProps {
  taskId: string;
}

const TimeEntries: React.FC<TimeEntriesProps> = ({ taskId }) => {
  const { timeEntries, loading, error, addTimeEntry, removeTimeEntry } = useTimeEntries(taskId);
  const { user } = useAuth();
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddTimeEntry = async () => {
    if (!hours || !user) return;
    await addTimeEntry({
      task_id: taskId,
      user_id: user.id,
      hours: Number(hours),
      description,
      date,
    });
    setHours('');
    setDescription('');
  };

  if (loading) return <div>Loading time entries...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Time Entries</h3>
      <div className="space-y-2">
        {timeEntries.map(entry => (
          <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
            <div>
              <p className="font-semibold">{entry.hours} hours</p>
              <p className="text-sm text-gray-600">{entry.description}</p>
              <p className="text-xs text-gray-500">{entry.user.name} - {new Date(entry.date).toLocaleDateString()}</p>
            </div>
            <button onClick={() => removeTimeEntry(entry.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours"
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button onClick={handleAddTimeEntry} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg">
          Add Time Entry
        </button>
      </div>
    </div>
  );
};

export default TimeEntries;
