import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  PlusCircle, ChevronLeft, Edit, Trash2, ChevronRight, 
  CheckCircle, Circle, ChevronDown, X, Menu, Sun, Moon,
  Clock, Target, Zap, Coffee, Calendar, BarChart, Settings,
  ArrowRight, Gift, Home, StickyNote
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./components/ui/tooltip";
import { Textarea } from './components/ui/textarea';
import { Progress } from "./components/ui/progress";
import { supabase } from './supabaseClient';
import confetti from 'canvas-confetti';
import TaskDetailsModal from './TaskDetailsModal';

const useColorTheme = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  return [theme, setTheme];
};

const colorPalette = {
  light: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    card: 'bg-white',
    text: 'text-gray-800',
    accent: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    button: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    buttonText: 'text-white',
    hover: 'hover:bg-gray-50',
    quadrants: {
      urgentImportant: 'bg-gradient-to-br from-red-50 to-pink-50',
      urgentNotImportant: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      notUrgentImportant: 'bg-gradient-to-br from-green-50 to-emerald-50',
      notUrgentNotImportant: 'bg-gradient-to-br from-blue-50 to-indigo-50'
    }
  },
  dark: {
    background: 'bg-gradient-to-br from-gray-900 to-indigo-950',
    card: 'bg-gray-800',
    text: 'text-gray-100',
    accent: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    button: 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800',
    buttonText: 'text-white',
    hover: 'hover:bg-gray-700',
    quadrants: {
      urgentImportant: 'bg-gradient-to-br from-red-900 to-pink-900',
      urgentNotImportant: 'bg-gradient-to-br from-yellow-900 to-orange-900',
      notUrgentImportant: 'bg-gradient-to-br from-green-900 to-emerald-900',
      notUrgentNotImportant: 'bg-gradient-to-br from-blue-900 to-indigo-900'
    }
  }
};

const QuadrantIcons = {
  'Urgent & Important': <Zap className="w-6 h-6 mr-2" />,
  'Urgent & Not Important': <Clock className="w-6 h-6 mr-2" />,
  'Not Urgent & Important': <Target className="w-6 h-6 mr-2" />,
  'Not Urgent & Not Important': <Coffee className="w-6 h-6 mr-2" />
};

const Breadcrumb = ({ hierarchy, onNavigate, theme }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center mb-4 text-sm ${colorPalette[theme].text} overflow-x-auto whitespace-nowrap pb-2`}
  >
    {hierarchy.map((level, index) => (
      <React.Fragment key={level.id || index}>
        <Button 
          variant="link" 
          className={`p-0 h-auto font-normal hover:text-indigo-500 transition-colors ${colorPalette[theme].text} truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]`}
          onClick={() => onNavigate(index)}
        >
          {level.title}
        </Button>
        {index < hierarchy.length - 1 && <ChevronRight size={16} className="mx-2 text-gray-400 flex-shrink-0" />}
      </React.Fragment>
    ))}
  </motion.div>
);

const Task = ({ task, onOpenMatrix, onEditTask, onDeleteTask, onToggleComplete, onOpenDetails, theme }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  if (!task || !task.id) return null;

  const hasNote = task.notes && task.notes.trim().length > 0;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-3 rounded-lg ${colorPalette[theme].card} shadow-md hover:shadow-xl transition-all duration-300 ${task.completed ? 'opacity-60' : ''} cursor-pointer overflow-hidden`}
      onClick={() => onOpenDetails(task)}
    >
      <div className="flex items-center p-4">
        <Tooltip content={task.completed ? "Mark as incomplete" : "Mark as complete"}>
          <Button
            variant="ghost"
            size="sm"
            className="mr-3 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
          >
            {task.completed ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <Circle size={20} className="text-gray-300" />
            )}
          </Button>
        </Tooltip>
        <span className={`flex-grow truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] ${task.completed ? 'line-through text-gray-500' : colorPalette[theme].text}`}>
          {task.title}
        </span>
        <div className="flex items-center space-x-2">
          <Tooltip content="Open subtasks">
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-indigo-500 ${colorPalette[theme].hover} transition-colors hover:scale-110`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenMatrix(task);
              }}
            >
              <ChevronRight size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Edit task">
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-yellow-500 ${colorPalette[theme].hover} transition-colors hover:scale-110`}
              onClick={(e) => {
                e.stopPropagation();
                onEditTask(task);
              }}
            >
              <Edit size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete task">
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-red-500 ${colorPalette[theme].hover} transition-colors hover:scale-110`}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </Tooltip>
        </div>
      </div>
      {hasNote && (
        <div 
          className={`px-4 py-2 text-sm ${
            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          } border-t ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          } flex items-center space-x-2`}
        >
          <StickyNote size={14} className="flex-shrink-0 text-yellow-500" />
          <p className="truncate">{task.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

const QuadrantCard = ({ title, tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onEditNote, onOpenDetails, theme, color }) => {
  return (
    <Card className={`h-full overflow-hidden shadow-lg bg-gradient-to-br ${color} ${theme === 'dark' ? 'bg-opacity-20' : ''}`}>
      <CardHeader className={`font-semibold flex justify-between items-center p-4 ${colorPalette[theme].text}`}>
        <div className="flex items-center">
          {QuadrantIcons[title]}
          <span className="text-lg font-bold">{title}</span>
        </div>
        <Tooltip content="Add new task">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddTask(title)} 
            className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors hover:scale-105`}
          >
            <PlusCircle size={16} className="mr-2" />
            Add Task
          </Button>
        </Tooltip>
      </CardHeader>
      <CardContent className="p-4 max-h-[calc(50vh-100px)] overflow-y-auto">
        <AnimatePresence>
          {(tasks || []).filter(task => task && task.id).map(task => (
            <Task 
              key={task.id} 
              task={task} 
              onOpenMatrix={onOpenMatrix}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleComplete={onToggleComplete}
              onEditNote={onEditNote}
              onOpenDetails={onOpenDetails}
              theme={theme}
            />
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
const EisenhowerMatrix = ({ tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onEditNote, onOpenDetails, theme }) => {
  const filterTasks = (urgent, important) => 
    (tasks || []).filter(t => 
      t?.urgent === urgent && 
      t?.important === important
    );

  const quadrants = [
    { title: 'Urgent & Important', tasks: filterTasks(true, true), color: 'from-red-200 to-red-300' },
    { title: 'Urgent & Not Important', tasks: filterTasks(true, false), color: 'from-yellow-200 to-yellow-300' },
    { title: 'Not Urgent & Important', tasks: filterTasks(false, true), color: 'from-green-200 to-green-300' },
    { title: 'Not Urgent & Not Important', tasks: filterTasks(false, false), color: 'from-blue-200 to-blue-300' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quadrants.map(quadrant => (
        <QuadrantCard
          key={quadrant.title}
          title={quadrant.title}
          tasks={quadrant.tasks}
          onOpenMatrix={onOpenMatrix}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleComplete={onToggleComplete}
          onEditNote={onEditNote}
          onOpenDetails={onOpenDetails}
          theme={theme}
          color={quadrant.color}
        />
      ))}
    </div>
  );
};

const OverviewTask = ({ task, level, onNavigate, theme }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      className={`ml-${level * 4}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: level * 0.1 }}
    >
      <div 
        className={`flex items-center py-2 px-4 ${colorPalette[theme].hover} rounded transition-colors cursor-pointer`}
        onClick={() => onNavigate(task)}
      >
        {task.subtasks && task.subtasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? 'transform rotate-180' : ''}`}
            />
          </Button>
        )}
        <span className={`${task.completed ? 'line-through text-gray-500' : colorPalette[theme].text}`}>
          {task.title}
        </span>
      </div>
      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <div>
          {task.subtasks.map(subtask => (
            <OverviewTask
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onNavigate={onNavigate}
              theme={theme}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const Overview = ({ tasks, onNavigate, theme }) => {
  return (
    <Card className={`mt-6 shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader>
        <h2 className={`text-2xl font-bold ${colorPalette[theme].text}`}>Task Overview</h2>
      </CardHeader>
      <CardContent>
        <motion.div initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}>
          {tasks.map(task => (
            <OverviewTask
              key={task.id}
              task={task}
              level={0}
              onNavigate={onNavigate}
              theme={theme}
            />
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

const TaskAnalytics = ({ tasks, theme }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className={`mt-6 shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader>
        <h2 className={`text-2xl font-bold ${colorPalette[theme].text}`}>Task Analytics</h2>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${colorPalette[theme].text}`}>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <p className="text-lg font-semibold">Total Tasks</p>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </motion.div>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <p className="text-lg font-semibold">Completed Tasks</p>
            <p className="text-3xl font-bold">{completedTasks}</p>
          </motion.div>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <p className="text-lg font-semibold">Completion Rate</p>
            <p className="text-3xl font-bold">{completionRate.toFixed(1)}%</p>
          </motion.div>
        </div>
        <div className="mt-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${colorPalette[theme].accent} ${colorPalette[theme].buttonText}`}>
                  Progress
                </span>
              </div>
              <div className={`text-right ${colorPalette[theme].text}`}>
                <span className="text-xs font-semibold inline-block">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <motion.div 
              className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                style={{ width: `${completionRate}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${colorPalette[theme].accent}`}
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskInsights = ({ tasks, theme }) => {
  const getMotivationalMessage = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
      return "Ready to start your journey? Add your first task!";
    } else if (completedTasks === 0) {
      return "Every journey begins with a single step. Let's tackle that first task!";
    } else if (completedTasks === totalTasks) {
      return "Incredible job! You've completed all your tasks. Time to set new goals!";
    } else if (completedTasks / totalTasks > 0.75) {
      return "You're on fire! Just a few more tasks to go. Keep up the great work!";
    } else if (completedTasks / totalTasks > 0.5) {
      return "Halfway there! Your progress is impressive. Let's keep the momentum going!";
    } else if (completedTasks / totalTasks > 0.25) {
      return "You're making steady progress. Each completed task is a step towards your goals!";
    } else {
      return "Remember, small progress is still progress. You've got this!";
    }
  };

  return (
    <Card className={`mt-6 shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader>
        <h2 className={`text-2xl font-bold ${colorPalette[theme].text}`}>Task Insights</h2>
      </CardHeader>
      <CardContent>
        <motion.p 
          className={`text-lg ${colorPalette[theme].text}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getMotivationalMessage()}
        </motion.p>
      </CardContent>
    </Card>
  );
};

const StreakTracker = ({ tasks, theme }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const calculateStreak = () => {
      let streak = 0;
      let maxStreak = 0;
      const today = new Date().setHours(0, 0, 0, 0);

      for (let i = tasks.length - 1; i >= 0; i--) {
        const taskDate = new Date(tasks[i].completed_at).setHours(0, 0, 0, 0);
        if (taskDate === today - streak * 86400000) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else if (taskDate < today - streak * 86400000) {
          break;
        }
      }

      setCurrentStreak(streak);
      setLongestStreak(maxStreak);
    };

    calculateStreak();
  }, [tasks]);

  return (
    <Card className={`mt-6 shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader>
        <h2 className={`text-2xl font-bold ${colorPalette[theme].text}`}>Streak Tracker</h2>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-2 gap-4 ${colorPalette[theme].text}`}>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-lg font-semibold">Current Streak</p>
            <p className="text-3xl font-bold">{currentStreak} days</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-lg font-semibold">Longest Streak</p>
            <p className="text-3xl font-bold">{longestStreak} days</p>
          </motion.div>
        </div>
        <motion.div 
          className="mt-4 flex justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(7)].map((_, index) => (
            <div 
              key={index} 
              className={`w-8 h-8 m-1 rounded-full ${
                index < currentStreak % 7 
                  ? `${colorPalette[theme].accent} ${colorPalette[theme].buttonText}`
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

const ProductivityTips = ({ theme }) => {
  const tips = [
    "Break large tasks into smaller, manageable steps.",
    "Use the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break.",
    "Prioritize your tasks using the Eisenhower Matrix.",
    "Minimize distractions by turning off notifications during focus time.",
    "Take regular breaks to maintain productivity and avoid burnout.",
    "Set specific, achievable goals for each day.",
    "Use the 'two-minute rule': If a task takes less than two minutes, do it immediately.",
    "Regularly review and update your task list to stay organized.",
    "Celebrate your accomplishments, no matter how small.",
    "Stay hydrated and maintain a healthy work environment."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`mt-6 shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader>
        <h2 className={`text-2xl font-bold ${colorPalette[theme].text}`}>Productivity Tip</h2>
      </CardHeader>
      <CardContent>
        <motion.p
          key={currentTip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`text-lg ${colorPalette[theme].text}`}
        >
          {tips[currentTip]}
        </motion.p>
      </CardContent>
    </Card>
  );
};

const TaskTracker = ({ onTaskComplete, onError }) => {
  const [theme, setTheme] = useColorTheme();
  const [taskHierarchy, setTaskHierarchy] = useState([
    {
      id: null,
      title: 'Main Tasks',
      tasks: []
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskQuadrant, setNewTaskQuadrant] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [deletingTask, setDeletingTask] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const initialFetchRef = useRef(null);
  const isMounted = useRef(false);
  const renderCount = useRef(0);
  const dataFetched = useRef(false);

  const currentLevel = useMemo(() => taskHierarchy[taskHierarchy.length - 1] || { tasks: [] }, [taskHierarchy]);

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };


  const fetchTasks = useCallback(async (parentId = null) => {
    if (!isMounted.current) return;
    console.log('Fetching tasks...');
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });
  
      if (parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }
  
      let { data, error } = await query;
  
      if (error) throw error;
  
      console.log('Fetched tasks:', data);
  
      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        if (JSON.stringify(updated[currentLevelIndex].tasks) !== JSON.stringify(data)) {
          updated[currentLevelIndex] = {
            ...updated[currentLevelIndex],
            tasks: data || []
          };
          return updated;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
      onError(error);
    }
  }, [onError]);

  const fetchAllTasks = useCallback(async () => {
    if (!isMounted.current) return;
    console.log('Fetching all tasks...');
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Fetched all tasks:', data);

      const taskMap = new Map();
      data.forEach(task => taskMap.set(task.id, { ...task, subtasks: [] }));

      data.forEach(task => {
        if (task.parent_id && taskMap.has(task.parent_id)) {
          taskMap.get(task.parent_id).subtasks.push(taskMap.get(task.id));
        }
      });

      const rootTasks = Array.from(taskMap.values()).filter(task => !task.parent_id);
      setAllTasks(rootTasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      setError('Failed to fetch all tasks. Please try again.');
      onError(error);
    }
  }, [onError]);

  useEffect(() => {
    isMounted.current = true;
    
    if (!initialFetchRef.current) {
      initialFetchRef.current = (async () => {
        console.log('TaskTracker: Initial render');
        await fetchTasks();
        await fetchAllTasks();
        dataFetched.current = true;
        setLoading(false);
      })();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchTasks, fetchAllTasks]);

  useEffect(() => {
    if (isMounted.current && dataFetched.current && !loading) {
      console.log('Task hierarchy updated:', taskHierarchy);
    }
  }, [taskHierarchy, loading]);


  // ... rest of the compon

  const navigateToTask = async (task) => {
    if (!task || !task.id) {
      console.error('Invalid task:', task);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', task.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Fetched subtasks:', data);

      setTaskHierarchy(prev => [...prev, {
        id: task.id,
        title: task.title,
        tasks: data || []
      }]);
      setShowOverview(false);
      setShowAnalytics(false);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setError('Failed to open task matrix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateHome = () => {
    setTaskHierarchy([{
      id: null,
      title: 'Main Tasks',
      tasks: allTasks.filter(task => !task.parent_id)
    }]);
    setShowOverview(false);
    setShowAnalytics(false);
  };

  const navigateBack = () => {
    if (taskHierarchy.length > 1) {
      setTaskHierarchy(prev => prev.slice(0, -1));
    }
  };

  const navigateToBreadcrumb = (index) => {
    if (index >= 0 && index < taskHierarchy.length) {
      setTaskHierarchy(prev => prev.slice(0, index + 1));
    }
  };

  const startAddingTask = (quadrant) => {
    setAddingTask(true);
    setNewTaskQuadrant(quadrant);
  };

  const addNewTask = async () => {
    if (newTaskTitle.trim() === '') return;
  
    const [urgent, important] = {
      'Urgent & Important': [true, true],
      'Urgent & Not Important': [true, false],
      'Not Urgent & Important': [false, true],
      'Not Urgent & Not Important': [false, false],
    }[newTaskQuadrant] || [false, false];
  
    setLoading(true);
    setError(null);
    try {
      const newTask = {
        title: newTaskTitle,
        urgent,
        important,
        parent_id: currentLevel.id === null ? null : currentLevel.id,
        completed: false
      };
  
      console.log('Adding new task:', newTask);
  
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .single();
  
      if (error) throw error;
  
      console.log('Added new task:', data);
  
      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: [...(updated[currentLevelIndex].tasks || []), data]
        };
        console.log('Updated task hierarchy:', updated);
        return updated;
      });
  
      setNewTaskTitle('');
      setAddingTask(false);
      setNewTaskQuadrant(null);
  
      // Fetch tasks again to ensure consistency
      await fetchTasks(currentLevel.id === null ? null : currentLevel.id);
      await fetchAllTasks();

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEditingTask = (task) => {
    if (!task || !task.id) {
      console.error('Invalid task:', task);
      return;
    }
    setEditingTask(task);
    setEditedTaskTitle(task.title);
  };

  const saveEditedTask = async () => {
    if (editedTaskTitle.trim() === '' || !editingTask || !editingTask.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ title: editedTaskTitle })
        .eq('id', editingTask.id)
        .single();

      if (error) throw error;

      console.log('Updated task:', data);

      setTaskHierarchy(prev => {
        const updated = prev.map((level, index) => {
          if (index === prev.length - 1) {
            return {
              ...level,
              tasks: (level.tasks || []).map(task => 
                task && task.id === editingTask.id ? { ...task, title: editedTaskTitle } : task
              ).filter(Boolean)
            };
          }
          return level;
        });
        return updated;
      });

      setEditingTask(null);
      setEditedTaskTitle('');
      await fetchAllTasks();

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startDeletingTask = (task) => {
    if (!task || !task.id) {
      console.error('Invalid task:', task);
      return;
    }
    setDeletingTask(task);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask || !deletingTask.id) return;

    setLoading(true);
    setError(null);
    try {
      const deleteTaskAndSubtasks = async (taskId) => {
        console.log(`Starting deletion process for task ID: ${taskId}`);

        const { data: subtasks, error: fetchError } = await supabase
          .from('tasks')
          .select('id')
          .eq('parent_id', taskId);

        if (fetchError) throw fetchError;

        console.log(`Found ${subtasks.length} subtasks for task ID: ${taskId}`);

        for (let subtask of subtasks) {
          await deleteTaskAndSubtasks(subtask.id);
        }

        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (deleteError) throw deleteError;

        console.log(`Successfully deleted task ID: ${taskId}`);
      };

      await deleteTaskAndSubtasks(deletingTask.id);

      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: (updated[currentLevelIndex].tasks || []).filter(task => task.id !== deletingTask.id)
        };
        return updated;
      });

      setDeletingTask(null);
      await fetchAllTasks();

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSelect = (task) => {
    // Navigate to the task's parent if it has one, otherwise to the task itself
    if (task.parent_id) {
      const parentTask = allTasks.find(t => t.id === task.parent_id);
      if (parentTask) {
        navigateToTask(parentTask);
      }
    } else {
      navigateToTask(task);
    }
  };

  const toggleTaskCompletion = async (task) => {
    setLoading(true);
    setError(null);

    const updatedTask = { ...task, completed: !task.completed };

    // Optimistically update the UI
    setTaskHierarchy(prev => {
      const updated = [...prev];
      const currentLevelIndex = updated.length - 1;
      updated[currentLevelIndex] = {
        ...updated[currentLevelIndex],
        tasks: updated[currentLevelIndex].tasks.map(t => 
          t.id === task.id ? updatedTask : t
        )
      };
      return updated;
    });

    if (updatedTask.completed) {
      triggerConfetti();
    }

    try {
      console.log('Toggling task completion for task:', task);

      const { error } = await supabase
        .from('tasks')
        .update({ completed: updatedTask.completed })
        .eq('id', task.id);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('Successfully toggled task completion');

      // Refresh all tasks to ensure consistency
      await fetchAllTasks();

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      
      // Revert the optimistic update
      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: updated[currentLevelIndex].tasks.map(t => 
            t.id === task.id ? task : t
          )
        };
        return updated;
      });

      setError(`Failed to update task: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const triggerSuccessAnimation = () => {
    // You can implement a custom success animation here
    // For example, a subtle fade-in/fade-out message or a checkmark animation
    console.log('Success animation triggered');
  };

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${colorPalette[theme].background}`}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className={`w-16 h-16 border-4 ${colorPalette[theme].accent} border-t-transparent rounded-full`}
      />
    </div>
  );

  const LoadingSpinner = () => (
    <div className={`flex items-center justify-center h-screen ${colorPalette[theme].background}`}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className={`w-16 h-16 border-4 ${colorPalette[theme].accent} border-t-transparent rounded-full`}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`ml-4 text-lg font-semibold ${colorPalette[theme].text}`}
      >
        Loading your tasks...
      </motion.p>
    </div>
  );
  if (process.env.NODE_ENV === 'development') {
    console.log(`TaskTracker: Render #${++renderCount.current}${loading ? ' (loading)' : ''}`);
  }
  if (loading) {
    console.log('TaskTracker: Rendering loading spinner');
    return <LoadingSpinner theme={theme} />;
  }

  if (error) {
    console.log('TaskTracker: Rendering error message', error);
    return <ErrorMessage error={error} theme={theme} />;
  }

  console.log('TaskTracker: Rendering main content');


  const handleEditNote = async (taskId, newNote) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ notes: newNote })
        .eq('id', taskId)
        .single();

      if (error) throw error;

      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: updated[currentLevelIndex].tasks.map(task => 
            task.id === taskId ? { ...task, notes: newNote } : task
          )
        };
        return updated;
      });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, notes: newNote });
      }

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editNote = async (taskId, newNote) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ notes: newNote })
        .eq('id', taskId)
        .single();

      if (error) throw error;

      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: updated[currentLevelIndex].tasks.map(task => 
            task.id === taskId ? { ...task, notes: newNote } : task
          )
        };
        return updated;
      });

      // Show success animation
      triggerSuccessAnimation();
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };






  return (
    <TooltipProvider>
    <div className={`p-4 md:p-8 ${colorPalette[theme].background} min-h-screen`}>
      <TaskSearch tasks={allTasks} onSelectTask={handleSearchSelect} theme={theme} />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${colorPalette[theme].card} border-l-4 border-red-500 text-red-700 p-4 m-4 rounded shadow-md`}
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </motion.div>
      )}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            {taskHierarchy.length > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button variant="outline" onClick={navigateBack} className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}>
                  <ChevronLeft size={16} className="mr-2" />
                  Back
                </Button>
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}
                  onClick={navigateHome}
                >
                  <Home size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go Home</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </TooltipContent>
            </Tooltip>
            <div className="relative" ref={menuRef}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <Menu size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Menu</TooltipContent>
              </Tooltip>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 ${colorPalette[theme].card} rounded-md shadow-lg z-10`}
                >
                  <Button
                    variant="ghost"
                    className={`w-full text-left ${colorPalette[theme].text}`}
                    onClick={() => {
                      setShowOverview(!showOverview);
                      setShowAnalytics(false);
                      setMenuOpen(false);
                    }}
                  >
                    {showOverview ? 'Hide Overview' : 'Show Overview'}
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full text-left ${colorPalette[theme].text}`}
                    onClick={() => {
                      setShowAnalytics(!showAnalytics);
                      setShowOverview(false);
                      setMenuOpen(false);
                    }}
                  >
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <motion.h1 
          className={`text-2xl md:text-3xl font-bold ${colorPalette[theme].text} truncate max-w-full`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentLevel.title.length > 100 ? `${currentLevel.title.substring(0, 150)}...` : currentLevel.title}
        </motion.h1>
      </div>
      
      <Breadcrumb hierarchy={taskHierarchy} onNavigate={navigateToBreadcrumb} theme={theme} />
        <AnimatePresence>
          {addingTask && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 flex items-center ${colorPalette[theme].card} p-4 rounded-lg shadow-md`}
            >
              <Input 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter new task title"
                className={`mr-2 flex-grow ${colorPalette[theme].text}`}
              />
              <Button onClick={addNewTask} className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}>Add</Button>
              <Button variant="ghost" onClick={() => setAddingTask(false)} className="ml-2">
                <X size={16} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {editingTask && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 flex items-center ${colorPalette[theme].card} p-4 rounded-lg shadow-md`}
            >
              <Input 
                value={editedTaskTitle}
                onChange={(e) => setEditedTaskTitle(e.target.value)}
                placeholder="Edit task title"
                className={`mr-2 flex-grow ${colorPalette[theme].text}`}
              />
              <Button onClick={saveEditedTask} className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors shadow-md`}>Save</Button>
              <Button variant="ghost" onClick={() => setEditingTask(null)} className="ml-2">
                <X size={16} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showOverview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Overview tasks={allTasks} onNavigate={navigateToTask} theme={theme} />
            </motion.div>
          ) : showAnalytics ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <TaskAnalytics tasks={allTasks} theme={theme} />
              <TaskInsights tasks={allTasks} theme={theme} />
              <StreakTracker tasks={allTasks} theme={theme} />
              <ProductivityTips theme={theme} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <EisenhowerMatrix 
          tasks={currentLevel.tasks} 
          onOpenMatrix={navigateToTask}
          onAddTask={startAddingTask}
          onEditTask={startEditingTask}
          onDeleteTask={startDeletingTask}
          onToggleComplete={toggleTaskCompletion}
          onOpenDetails={handleOpenDetails}
          theme={theme}
        />
        <TaskDetailsModal
          isOpen={selectedTask !== null}
          onClose={handleCloseDetails}
          task={selectedTask}
          onEditNote={editNote}
          onToggleComplete={toggleTaskCompletion}
          theme={theme}
          colorPalette={colorPalette}
        />
            </motion.div>
          )}
        </AnimatePresence>
        <AlertDialog open={deletingTask !== null} onOpenChange={() => setDeletingTask(null)}>
          <AlertDialogContent className={`${colorPalette[theme].card} ${colorPalette[theme].text}`}>
            <AlertDialogHeader>
              <AlertDialogTitle className={`text-2xl font-bold ${colorPalette[theme].text}`}>Are you sure you want to delete this task?</AlertDialogTitle>
              <AlertDialogDescription className={`${colorPalette[theme].text} opacity-80`}>
                This action cannot be undone. This will permanently delete the task
                "{deletingTask?.title}" and ALL its subtasks at any level.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText}`}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTask} className={`bg-red-500 hover:bg-red-600 text-white transition-colors`}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

// New component for task completion celebrations
const TaskCompletionCelebration = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Gift size={64} className="text-green-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Task Completed!</h2>
        <p className="text-gray-600">Great job! Keep up the good work!</p>
      </div>
    </motion.div>
  );
};

// Enhanced loading component
const LoadingSpinner = ({ theme }) => (
  <div className={`flex items-center justify-center h-screen ${colorPalette[theme].background}`}>
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
      }}
      className={`w-16 h-16 border-4 ${colorPalette[theme].accent} border-t-transparent rounded-full`}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`ml-4 text-lg font-semibold ${colorPalette[theme].text}`}
    >
      Loading your tasks...
    </motion.p>
  </div>
);
// if (loading) return <LoadingSpinner />;
// Enhanced error component
const ErrorMessage = ({ error, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${colorPalette[theme].card} border-l-4 border-red-500 text-red-700 p-4 m-4 rounded shadow-md`}
  >
    <p className="font-bold">Error</p>
    <p>{error}</p>
    <Button 
      onClick={() => window.location.reload()} 
      className="mt-4 bg-red-500 text-white hover:bg-red-600 transition-colors"
    >
      Retry
    </Button>
  </motion.div>
);

const TaskSearch = ({ tasks, onSelectTask, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, tasks]);

  return (
    <div className={`mb-6 ${colorPalette[theme].card} p-4 rounded-lg shadow-md`}>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks..."
        className={`mb-4 ${colorPalette[theme].text}`}
      />
      {searchResults.length > 0 && (
        <ul className={`max-h-60 overflow-y-auto ${colorPalette[theme].text}`}>
          {searchResults.map(task => (
            <li 
              key={task.id}
              className={`cursor-pointer p-2 hover:bg-gray-100 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`}
              onClick={() => onSelectTask(task)}
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


// Main App component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
    <pre className="text-sm overflow-auto mb-4">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    >
      Try again
    </button>
  </div>
);

// Main App component
const App = () => {
  const [theme] = useColorTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    console.log('App: Initial render');
    const timer = setTimeout(() => {
      console.log('App: Initial loading complete');
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleError = (error) => {
    console.error('App: Error occurred', error);
    setError(error.message || 'An unexpected error occurred');
  };

  if (loading) {
    console.log('App: Rendering loading spinner');
    return <LoadingSpinner theme={theme} />;
  }

  if (error) {
    console.log('App: Rendering error message', error);
    return <ErrorMessage error={error} theme={theme} />;
  }

  console.log('App: Rendering TaskTracker');
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <TaskTracker 
        onTaskComplete={() => setShowCelebration(true)}
        onError={handleError}
      />
      <TaskCompletionCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
    </ErrorBoundary>
  );
};

export default App;