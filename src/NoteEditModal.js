import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';

const NoteEditModal = ({ isOpen, onClose, initialNote, onSave, taskTitle, theme }) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const getThemeClasses = () => {
    return theme === 'dark' 
      ? 'bg-gray-800 text-gray-100' 
      : 'bg-white text-gray-800';
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className={`${getThemeClasses()} w-full max-w-lg rounded-lg shadow-xl overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Note: {taskTitle}</h2>
                <Button variant="ghost" onClick={onClose}>
                  <X size={24} />
                </Button>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your note here..."
                className="w-full h-40 mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Note</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoteEditModal;