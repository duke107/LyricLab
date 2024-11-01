import { Card, Checkbox, Button, Spinner } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function PostCard({ post }) {
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState(post.subtasks || []);
  const navigate = useNavigate();
  const completedCount = subtasks.filter((subtask) => subtask.completed).length;
  const totalCount = subtasks.length;
  const completionPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    setLoading(false);
  }, []);

  const getPriorityColor = () => {
    switch (post.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return '';
    }
  };

  const toggleSubtaskCompletion = async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}/toggle-completion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setSubtasks((prev) =>
          prev.map((subtask) =>
            subtask._id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          )
        );
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const completeAllSubtasks = async () => {
    const updatedSubtasks = subtasks.map((subtask) => ({ ...subtask, completed: true }));
    setSubtasks(updatedSubtasks);

    try {
      const res = await fetch(`/api/post/${post._id}/complete-subtasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update subtasks in the database');
      }
    } catch (error) {
      console.error('Error updating subtasks in database:', error);
    }
  };

  const deleteTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        window.location.reload();
        console.log('Task deleted');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div onClick={() => navigate(`/post/${post.slug}`)} className='cursor-pointer'>
      <Card className="max-w-sm h-[420px] p-5 shadow-lg relative">
        <div onClick={(e) => e.stopPropagation()}>
          <Link to={`/post/${post.slug}`}>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          </Link>
          <Link to={`/post/${post.slug}`}>
            <div
              className={`text-sm font-bold ${getPriorityColor()} text-white px-2 py-1 rounded inline-block mb-3`}
            >
              Priority: {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)}
            </div>
          </Link>
          <Link to={`/post/${post.slug}`}>
            <p className="text-sm mb-2">
              Status: {completedCount === totalCount ? 'Completed' : 'In Progress'}
            </p>
          </Link>
        </div>

        <div className="mb-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold text-sm mb-1">Subtasks</h3>
          {subtasks.slice(0, 3).map((subtask) => (
            <div key={subtask._id} className="flex items-center gap-2 py-0.5">
              <Checkbox
                className="cursor-pointer"
                checked={subtask.completed}
                onChange={() => toggleSubtaskCompletion(subtask._id)}
              />
              <span className={`text-xs ${subtask.completed ? 'line-through' : ''}`}>
                {subtask.title}
              </span>
            </div>
          ))}
          {totalCount > 3 && <span className="text-xs text-gray-500">+{totalCount - 3} subtasks remaining</span>}
        </div>

        <div className="relative w-full h-2 bg-gray-200 rounded" onClick={(e) => e.stopPropagation()}>
          <div
            className="absolute top-0 left-0 h-full bg-teal-500 rounded"
            style={{ width: `${completionPercentage}%` }}
          />
          <span className="text-xs">{completedCount}/{totalCount} Subtasks Completed</span>
        </div>

        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button color="success" size="sm" onClick={completeAllSubtasks} disabled={completedCount === totalCount}>
            Complete Task
          </Button>
          <Button color="failure" size="sm" onClick={deleteTask}>
            Delete Task
          </Button>
        </div>
      </Card>
    </div>
  );
}
