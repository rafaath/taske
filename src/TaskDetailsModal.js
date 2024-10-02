import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Target, CheckCircle, Calendar, Edit2, Save, AlertTriangle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Tooltip } from './components/ui/tooltip';

const TaskDetailsModal = ({ isOpen, onClose, task, onEditNote, onToggleComplete, theme, colorPalette }) => {
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
                        task.important ? 'text-blue-500' : 'text-gray-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`${colorPalette[theme].card} w-full max-w-lg rounded-lg shadow-xl overflow-hidden`}
        >
          <div className={`p-6 ${colorPalette[theme].text}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{task.title}</h2>
              <Button variant="ghost" onClick={onClose}>
                <X size={24} />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Tooltip content={`Priority: ${task.urgent && task.important ? 'High' : task.urgent || task.important ? 'Medium' : 'Low'}`}>
                  <div className={`flex items-center ${priorityColor}`}>
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
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleComplete}
                    className="p-0 hover:bg-transparent"
                  >
                    <CheckCircle className={`mr-2 ${task.completed ? 'text-green-500' : 'text-gray-500'}`} size={20} />
                  </Button>
                  <span>{task.completed ? 'Completed' : 'Not Completed'}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2" size={20} />
                <span>Created: {new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Notes:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={noteContent}
                    onChange={handleNoteChange}
                    onBlur={handleSaveNote}
                    placeholder="Add a note..."
                    className="w-full h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                ) : (
                  <div className="w-full h-32 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md shadow-inner">
                    {noteContent ? (
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                        {noteContent}
                      </p>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 italic">No notes added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailsModal;