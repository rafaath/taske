import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ChevronLeft, Edit, Trash2, ChevronRight, CheckCircle, Circle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { supabase } from './supabaseClient';

const Breadcrumb = ({ hierarchy, onNavigate }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center mb-6 text-sm text-gray-600"
  >
    {hierarchy.map((level, index) => (
      <React.Fragment key={level.id || index}>
        <Button 
          variant="link" 
          className="p-0 h-auto font-normal hover:text-blue-600 transition-colors"
          onClick={() => onNavigate(index)}
        >
          {level.title}
        </Button>
        {index < hierarchy.length - 1 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
      </React.Fragment>
    ))}
  </motion.div>
);

const Task = ({ task, onOpenMatrix, onEditTask, onDeleteTask, onToggleComplete }) => {
  if (!task || !task.id) return null;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-3 flex items-center p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ${task.completed ? 'opacity-60' : ''}`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="mr-3 p-0"
        onClick={() => onToggleComplete(task)}
      >
        {task.completed ? (
          <CheckCircle size={20} className="text-green-500" />
        ) : (
          <Circle size={20} className="text-gray-300" />
        )}
      </Button>
      <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
      <Button 
        variant="ghost" 
        size="sm"
        className="mr-2 text-blue-600 hover:text-blue-800 transition-colors"
        onClick={() => onOpenMatrix(task)}
      >
        Open Matrix
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="mr-2 text-gray-600 hover:text-gray-800 transition-colors"
        onClick={() => onEditTask(task)}
      >
        <Edit size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-red-600 hover:text-red-800 transition-colors"
        onClick={() => onDeleteTask(task)}
      >
        <Trash2 size={16} />
      </Button>
    </motion.div>
  );
};

const QuadrantCard = ({ title, tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete }) => (
  <Card className="h-full overflow-hidden">
    <CardHeader className="font-semibold flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <span className="text-lg text-gray-800">{title}</span>
      <Button variant="outline" size="sm" onClick={() => onAddTask(title)} className="bg-white hover:bg-blue-50 transition-colors">
        <PlusCircle size={16} className="mr-2" />
        Add Task
      </Button>
    </CardHeader>
    <CardContent className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <AnimatePresence>
        {(tasks || []).filter(task => task && task.id).map(task => (
          <Task 
            key={task.id} 
            task={task} 
            onOpenMatrix={onOpenMatrix}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </AnimatePresence>
    </CardContent>
  </Card>
);

const EisenhowerMatrix = ({ tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete }) => {
  const filterTasks = (urgent, important) => 
    (tasks || []).filter(t => 
      t?.urgent === urgent && 
      t?.important === important
    );

  const urgentImportant = filterTasks(true, true);
  const urgentNotImportant = filterTasks(true, false);
  const notUrgentImportant = filterTasks(false, true);
  const notUrgentNotImportant = filterTasks(false, false);

  return (
    <div className="grid grid-cols-2 gap-6">
      <QuadrantCard 
        title="Urgent & Important" 
        tasks={urgentImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
      />
      <QuadrantCard 
        title="Urgent & Not Important" 
        tasks={urgentNotImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
      />
      <QuadrantCard 
        title="Not Urgent & Important" 
        tasks={notUrgentImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
      />
      <QuadrantCard 
        title="Not Urgent & Not Important" 
        tasks={notUrgentNotImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
};

const OverviewTask = ({ task, level, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`ml-${level * 4}`}>
      <div 
        className="flex items-center py-2 px-4 hover:bg-blue-50 rounded transition-colors cursor-pointer"
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
        <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Overview = ({ tasks, onNavigate }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-800">Task Overview</h2>
      </CardHeader>
      <CardContent>
        {tasks.map(task => (
          <OverviewTask
            key={task.id}
            task={task}
            level={0}
            onNavigate={onNavigate}
          />
        ))}
      </CardContent>
    </Card>
  );
};

const TaskTracker = () => {
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
  const [allTasks, setAllTasks] = useState([]);

  const currentLevel = taskHierarchy[taskHierarchy.length - 1] || { tasks: [] };

  useEffect(() => {
    console.log('Task hierarchy updated:', taskHierarchy);
  }, [taskHierarchy]);

  const fetchTasks = useCallback(async (parentId = null) => {
    setLoading(true);
    setError(null);
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
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: data || []
        };
        console.log('Updated task hierarchy after fetch:', updated);
        return updated;
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchAllTasks();
  }, [fetchTasks, fetchAllTasks]);

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
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setError('Failed to open task matrix. Please try again.');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id)
        .single();

      if (error) throw error;

      console.log('Toggled task completion:', data);

      setTaskHierarchy(prev => {
        const updated = [...prev];
        const currentLevelIndex = updated.length - 1;
        updated[currentLevelIndex] = {
          ...updated[currentLevelIndex],
          tasks: updated[currentLevelIndex].tasks.map(t => 
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        };
        return updated;
      });

      await fetchAllTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
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
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded"
    >
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </motion.div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Breadcrumb hierarchy={taskHierarchy} onNavigate={navigateToBreadcrumb} />
      <div className="flex items-center mb-8">
        {taskHierarchy.length > 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="outline" onClick={navigateBack} className="mr-4 bg-white hover:bg-blue-50 transition-colors">
              <ChevronLeft size={16} className="mr-2" />
              Back
            </Button>
          </motion.div>
        )}
        <motion.h1 
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentLevel.title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-auto"
        >
          <Button 
            variant="outline" 
            onClick={() => setShowOverview(!showOverview)}
            className="bg-white hover:bg-blue-50 transition-colors"
          >
            {showOverview ? 'Hide Overview' : 'Show Overview'}
          </Button>
        </motion.div>
      </div>
      <AnimatePresence>
        {addingTask && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center bg-white p-4 rounded-lg shadow-md"
          >
            <Input 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter new task title"
              className="mr-2 flex-grow"
            />
            <Button onClick={addNewTask} className="bg-blue-500 hover:bg-blue-600 text-white transition-colors">Add Task</Button>
            <Button variant="ghost" onClick={() => setAddingTask(false)} className="ml-2">Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingTask && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center bg-white p-4 rounded-lg shadow-md"
          >
            <Input 
              value={editedTaskTitle}
              onChange={(e) => setEditedTaskTitle(e.target.value)}
              placeholder="Edit task title"
              className="mr-2 flex-grow"
            />
            <Button onClick={saveEditedTask} className="bg-green-500 hover:bg-green-600 text-white transition-colors">Save</Button>
            <Button variant="ghost" onClick={() => setEditingTask(null)} className="ml-2">Cancel</Button>
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
            <Overview tasks={allTasks} onNavigate={navigateToTask} />
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
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AlertDialog open={deletingTask !== null} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{deletingTask?.title}" and ALL its subtasks at any level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskTracker;
