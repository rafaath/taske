import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';

const AppleInspiredTaskInput = ({ onAddTask, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const inputRef = useRef(null);

  const quadrants = [
    { name: 'Urgent & Important', color: 'bg-red-500' },
    { name: 'Urgent & Not Important', color: 'bg-yellow-500' },
    { name: 'Not Urgent & Important', color: 'bg-green-500' },
    { name: 'Not Urgent & Not Important', color: 'bg-blue-500' }
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAddTask = () => {
    if (taskTitle.trim() && selectedQuadrant) {
      onAddTask(taskTitle, selectedQuadrant);
      setTaskTitle('');
      setSelectedQuadrant(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 pointer-events-auto`}
          >
            <motion.input
              ref={inputRef}
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              className={`w-full text-2xl font-light mb-6 bg-transparent border-none outline-none text-${theme === 'dark' ? 'white' : 'gray-800'}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            <motion.div 
              className="flex justify-between mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {quadrants.map((quadrant) => (
                <motion.button
                  key={quadrant.name}
                  onClick={() => setSelectedQuadrant(quadrant.name)}
                  className={`w-12 h-12 rounded-full ${quadrant.color} ${
                    selectedQuadrant === quadrant.name ? 'ring-4 ring-offset-4' : ''
                  } transition-all duration-300 ease-in-out transform hover:scale-110`}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </motion.div>
            <motion.div 
              className="flex justify-end"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className={`mr-4 text-${theme === 'dark' ? 'gray-300' : 'gray-500'} hover:text-${theme === 'dark' ? 'white' : 'gray-800'}`}
              >
                <X size={24} />
              </button>
              <button
                onClick={handleAddTask}
                disabled={!taskTitle.trim() || !selectedQuadrant}
                className={`bg-${theme === 'dark' ? 'white' : 'gray-800'} text-${theme === 'dark' ? 'gray-800' : 'white'} rounded-full p-2 disabled:opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                <Check size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`absolute bottom-8 right-8 bg-${theme === 'dark' ? 'white' : 'gray-800'} text-${theme === 'dark' ? 'gray-800' : 'white'} rounded-full p-4 shadow-lg pointer-events-auto transition-all duration-300 ease-in-out transform hover:scale-110`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={32} />
      </motion.button>
    </div>
  );
};

export default AppleInspiredTaskInput;