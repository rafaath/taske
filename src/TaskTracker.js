import React, { useState, useEffect } from 'react';
import { PlusCircle, ChevronLeft, Edit, Trash2, ChevronRight } from 'lucide-react';
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
import { getTasks, addTask, updateTask, deleteTask } from './kv';

const Breadcrumb = ({ hierarchy, onNavigate }) => (
  <div className="flex items-center mb-4 text-sm text-gray-600">
    {hierarchy.map((level, index) => (
      <React.Fragment key={level.id}>
        <Button 
          variant="link" 
          className="p-0 h-auto font-normal"
          onClick={() => onNavigate(index)}
        >
          {level.title}
        </Button>
        {index < hierarchy.length - 1 && <ChevronRight size={16} className="mx-2" />}
      </React.Fragment>
    ))}
  </div>
);

const Task = ({ task, onOpenMatrix, onEditTask, onDeleteTask }) => {
  return (
    <div className="mb-2 flex items-center">
      <span className="flex-grow">{task.title}</span>
      <Button 
        variant="ghost" 
        size="sm"
        className="mr-2"
        onClick={() => onOpenMatrix(task)}
      >
        Open Matrix
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="mr-2"
        onClick={() => onEditTask(task)}
      >
        <Edit size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onDeleteTask(task)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

const QuadrantCard = ({ title, tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask }) => (
  <Card className="h-full">
    <CardHeader className="font-semibold flex justify-between items-center">
      <span>{title}</span>
      <Button variant="outline" size="sm" onClick={() => onAddTask(title)}>
        <PlusCircle size={16} className="mr-2" />
        Add Task
      </Button>
    </CardHeader>
    <CardContent>
      {tasks.map(task => (
        <Task 
          key={task.id} 
          task={task} 
          onOpenMatrix={onOpenMatrix}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </CardContent>
  </Card>
);

const EisenhowerMatrix = ({ tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask }) => {
  const urgentImportant = tasks.filter(t => t.urgent && t.important);
  const urgentNotImportant = tasks.filter(t => t.urgent && !t.important);
  const notUrgentImportant = tasks.filter(t => !t.urgent && t.important);
  const notUrgentNotImportant = tasks.filter(t => !t.urgent && !t.important);

  return (
    <div className="grid grid-cols-2 gap-4">
      <QuadrantCard 
        title="Urgent & Important" 
        tasks={urgentImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
      <QuadrantCard 
        title="Urgent & Not Important" 
        tasks={urgentNotImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
      <QuadrantCard 
        title="Not Urgent & Important" 
        tasks={notUrgentImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
      <QuadrantCard 
        title="Not Urgent & Not Important" 
        tasks={notUrgentNotImportant} 
        onOpenMatrix={onOpenMatrix}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

const TaskTracker = () => {
  const [taskHierarchy, setTaskHierarchy] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskQuadrant, setNewTaskQuadrant] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTaskHierarchy(tasks);
    };
    fetchTasks();
  }, []);

  const currentLevel = taskHierarchy[taskHierarchy.length - 1];

  const navigateToTask = (task) => {
    setTaskHierarchy(prev => [...prev, {
      id: task.id,
      title: task.title,
      tasks: task.subtasks
    }]);
  };

  const navigateBack = () => {
    if (taskHierarchy.length > 1) {
      setTaskHierarchy(prev => prev.slice(0, -1));
    }
  };

  const navigateToBreadcrumb = (index) => {
    setTaskHierarchy(prev => prev.slice(0, index + 1));
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
    }[newTaskQuadrant];

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      urgent,
      important,
      subtasks: []
    };

    const updatedTasks = await addTask(currentLevel.id, newTask);
    setTaskHierarchy(updatedTasks);

    setNewTaskTitle('');
    setAddingTask(false);
    setNewTaskQuadrant(null);
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
    setEditedTaskTitle(task.title);
  };

  const saveEditedTask = async () => {
    if (editedTaskTitle.trim() === '') return;

    const updatedTask = { ...editingTask, title: editedTaskTitle };
    const updatedTasks = await updateTask(editingTask.id, updatedTask);
    setTaskHierarchy(updatedTasks);

    setEditingTask(null);
    setEditedTaskTitle('');
  };

  const startDeletingTask = (task) => {
    setDeletingTask(task);
  };

  const confirmDeleteTask = async () => {
    const updatedTasks = await deleteTask(deletingTask.id);
    setTaskHierarchy(updatedTasks);
    setDeletingTask(null);
  };

  if (!currentLevel) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <Breadcrumb hierarchy={taskHierarchy} onNavigate={navigateToBreadcrumb} />
      <div className="flex items-center mb-4">
        {taskHierarchy.length > 1 && (
          <Button variant="ghost" onClick={navigateBack} className="mr-4">
            <ChevronLeft size={16} className="mr-2" />
            Back
          </Button>
        )}
        <h1 className="text-2xl font-bold">{currentLevel.title}</h1>
      </div>
      {addingTask && (
        <div className="mb-4 flex items-center">
          <Input 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter new task title"
            className="mr-2"
          />
          <Button onClick={addNewTask}>Add Task</Button>
          <Button variant="ghost" onClick={() => setAddingTask(false)} className="ml-2">Cancel</Button>
        </div>
      )}
      {editingTask && (
        <div className="mb-4 flex items-center">
          <Input 
            value={editedTaskTitle}
            onChange={(e) => setEditedTaskTitle(e.target.value)}
            placeholder="Edit task title"
            className="mr-2"
          />
          <Button onClick={saveEditedTask}>Save</Button>
          <Button variant="ghost" onClick={() => setEditingTask(null)} className="ml-2">Cancel</Button>
        </div>
      )}
      <EisenhowerMatrix 
        tasks={currentLevel.tasks} 
        onOpenMatrix={navigateToTask}
        onAddTask={startAddingTask}
        onEditTask={startEditingTask}
        onDeleteTask={startDeletingTask}
      />
      <AlertDialog open={deletingTask !== null} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{deletingTask?.title}" and all its subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskTracker;