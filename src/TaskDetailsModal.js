import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Target, CheckCircle, Calendar, Edit2, Save } from 'lucide-react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';

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
                <div className="flex items-center">
                  {task.urgent ? (
                    <Clock className="mr-2 text-red-500" size={20} />
                  ) : (
                    <Clock className="mr-2 text-gray-500" size={20} />
                  )}
                  <span>{task.urgent ? 'Urgent' : 'Not Urgent'}</span>
                </div>
                <div className="flex items-center">
                  {task.important ? (
                    <Target className="mr-2 text-blue-500" size={20} />
                  ) : (
                    <Target className="mr-2 text-gray-500" size={20} />
                  )}
                  <span>{task.important ? 'Important' : 'Not Important'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleComplete}
                    className="p-0 hover:bg-transparent"
                  >
                    {task.completed ? (
                      <CheckCircle className="mr-2 text-green-500" size={20} />
                    ) : (
                      <CheckCircle className="mr-2 text-gray-500" size={20} />
                    )}
                  </Button>
                  <span>{task.completed ? 'Completed' : 'Not Completed'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2" size={20} />
                  <span>Created: {new Date(task.created_at).toLocaleString()}</span>
                </div>
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
                    className="w-full h-32"
                    autoFocus
                  />
                ) : (
                  <p className="w-full h-32 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    {noteContent || "No notes added yet."}
                  </p>
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