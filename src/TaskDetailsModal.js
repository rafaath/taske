import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Target, CheckCircle, Calendar, Edit2, Save, AlertTriangle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Tooltip } from './components/ui/tooltip';

const TaskDetailsModal = ({ isOpen, onClose, task, onEditNote, onToggleComplete }) => {
  const [noteContent, setNoteContent] = useState(task?.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (task) {
      setNoteContent(task.notes || '');
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleNoteChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleSaveNote = () => {
    onEditNote(task.id, noteContent);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onToggleComplete(task);
  };

  const priorityColor = task.urgent && task.important ? 'text-red-500' :
                        task.urgent ? 'text-orange-500' :
                        task.important ? 'text-blue-500' : 'text-gray-400';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Tooltip content={`Priority: ${task.urgent && task.important ? 'High' : task.urgent || task.important ? 'Medium' : 'Low'}`}>
                  <div className={`flex items-center ${priorityColor} font-medium`}>
                    {task.urgent && task.important ? (
                      <AlertTriangle className="mr-2" size={20} />
                    ) : task.urgent ? (
                      <Clock className="mr-2" size={20} />
                    ) : task.important ? (
                      <Target className="mr-2" size={20} />
                    ) : (
                      <Clock className="mr-2" size={20} />
                    )}
                    <span>
                      {task.urgent && task.important ? 'High Priority' :
                       task.urgent ? 'Urgent' :
                       task.important ? 'Important' : 'Normal Priority'}
                    </span>
                  </div>
                </Tooltip>
                <motion.div 
                  className="flex items-center"
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleComplete}
                    className="p-0 hover:bg-transparent focus:ring-0"
                  >
                    <CheckCircle 
                      className={`mr-2 ${task.completed ? 'text-green-500' : 'text-gray-400'} transition-colors duration-300`} 
                      size={24} 
                    />
                  </Button>
                  <span className={`${task.completed ? 'text-green-500' : 'text-gray-500'} font-medium transition-colors duration-300`}>
                    {task.completed ? 'Completed' : 'Mark Complete'}
                  </span>
                </motion.div>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-2" size={20} />
                <span>Created: {new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Notes</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                  </Button>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: isEditing ? 'auto' : 160 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {isEditing ? (
                    <Textarea
                      value={noteContent}
                      onChange={handleNoteChange}
                      onBlur={handleSaveNote}
                      placeholder="Add a note..."
                      className="w-full h-40 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                      autoFocus
                    />
                  ) : (
                    <div className="w-full h-40 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                      {noteContent ? (
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          {noteContent}
                        </p>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">No notes added yet.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailsModal;