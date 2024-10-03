import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Zap, Clock, Target, Coffee, ChevronRight } from 'lucide-react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const AppleInspiredTaskInput = ({ onAddTask, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quadrants = [
    { name: 'Urgent & Important', color: 'bg-red-500', icon: Zap },
    { name: 'Urgent & Not Important', color: 'bg-yellow-500', icon: Clock },
    { name: 'Not Urgent & Important', color: 'bg-green-500', icon: Target },
    { name: 'Not Urgent & Not Important', color: 'bg-blue-500', icon: Coffee },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() && selectedQuadrant) {
      setIsSubmitting(true);
      await onAddTask(newTaskTitle, selectedQuadrant);
      setIsSubmitting(false);
      setNewTaskTitle('');
      setSelectedQuadrant(null);
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.floating-input-container')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="fixed bottom-6 right-6 z-50 floating-input-container">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`p-6 rounded-3xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 w-96`}
          >
            <button
              onClick={() => setIsExpanded(false)}
              className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
            >
              <X size={20} />
            </button>
            <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What do you need to do?"
                  className={`w-full border-0 border-b-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'} focus:ring-0 focus:border-blue-500 transition-all duration-300 text-lg p-3 pl-4 rounded-xl`}
                  autoFocus
                />
                {newTaskTitle && (
                  <ChevronRight size={20} className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
              <div className="flex justify-between items-center">
                {quadrants.map((quadrant) => {
                  const Icon = quadrant.icon;
                  return (
                    <motion.button
                      key={quadrant.name}
                      type="button"
                      onClick={() => setSelectedQuadrant(quadrant.name)}
                      className={`w-12 h-12 rounded-2xl ${quadrant.color} flex items-center justify-center ${selectedQuadrant === quadrant.name ? 'ring-4 ring-offset-2 ring-blue-500' : ''} transition-all duration-300 ease-in-out`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={24} color="white" />
                    </motion.button>
                  );
                })}
              </div>
              <Button
                type="submit"
                disabled={!selectedQuadrant || !newTaskTitle.trim() || isSubmitting}
                className={`w-full py-3 px-4 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${(!selectedQuadrant || !newTaskTitle.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-4 rounded-full shadow-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} transition-all duration-300`}
            onClick={() => setIsExpanded(true)}
          >
            <Plus size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppleInspiredTaskInput;