import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Scheduler() {
  const [tasks, setTasks] = useLocalStorage('greenvibe_tasks', [
    { id: '1', title: 'Check pH levels', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: '2', title: 'Add AB Mix nutrients', completed: true, date: new Date().toISOString().split('T')[0] }
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="scheduler animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar /> Maintenance Scheduler</h2>
        <p className="text-muted">Local task manager for daily operations</p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input 
            type="text" 
            className="input-field" 
            placeholder="Add new maintenance task..." 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit" className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={18}/> Add
          </button>
        </form>

        <div className="task-list">
          <AnimatePresence>
            {tasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted py-4">
                No tasks for today.
              </motion.div>
            )}
            {tasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center justify-between p-3 mb-2 rounded border ${task.completed ? 'bg-bg-50 border-bg-200' : 'bg-card border-bg-200 shadow-sm'}`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle className="text-primary" />
                  ) : (
                    <Circle className="text-muted" />
                  )}
                  <span className={`${task.completed ? 'line-through text-muted' : 'text-text-dark font-medium'}`}>
                    {task.title}
                  </span>
                </div>
                <button 
                  className="icon-btn text-muted hover:text-[red]"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
