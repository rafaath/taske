import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { PlusCircle, Zap, Clock, Target, Coffee } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./components/ui/tooltip";
import { 
  PlusCircle, ChevronLeft, Edit, Trash2, ChevronRight, 
  CheckCircle, Circle, ChevronDown, X, Menu, Sun, Moon,
  Clock, Target, Zap, Coffee, Calendar, BarChart, Settings,
  ArrowRight, Gift, Home, StickyNote, AlertCircle, Badge, List, Search
} from 'lucide-react';
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

const Task = ({ task, index, onOpenMatrix, onEditTask, onDeleteTask, onToggleComplete, onOpenDetails, theme }) => {
  if (!task || !task.id) return null;

  const hasNote = task.notes && task.notes.trim().length > 0;
  
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-3 rounded-lg ${colorPalette[theme].card} shadow-md hover:shadow-xl transition-all duration-300 ${task.completed ? 'opacity-60' : ''} cursor-pointer overflow-hidden`}
          onClick={() => onOpenDetails(task)}
        >
          <div className="flex items-center p-4">
          <Tooltip content={task.completed ? "Mark as incomplete" : "Mark as complete"}>
          <Button
            variant="ghost"
            size="sm"
            className="mr-3 p-0 flex-shrink-0"
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
        <span className={`flex-grow mr-2 ${task.completed ? 'line-through text-gray-500' : colorPalette[theme].text}`}>
          {task.title}
        </span>
        <div className="flex flex-row justify-end items-center space-x-2 flex-shrink-0">
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
            <div className={`px-4 py-2 text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <p className="truncate">{task.notes}</p>
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );
};

const QuadrantCard = ({ title, tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onEditNote, onOpenDetails, theme, color }) => {
  return (
    <Droppable droppableId={title}>
      {(provided) => (
        <Card className={`h-full overflow-hidden shadow-lg bg-gradient-to-br ${color} ${theme === 'dark' ? 'bg-opacity-0' : ''}`}>
          <CardHeader className={`font-semibold flex justify-between items-start p-4 black`}>
            <div className="flex items-center">
              {QuadrantIcons[title]}
              <span className="text-lg font-bold">{title}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddTask(title)} 
              className={`${colorPalette[theme].button} ${colorPalette[theme].buttonText} transition-colors hover:scale-105`}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent 
            className="p-4 max-h-[calc(50vh-100px)] overflow-y-auto"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <AnimatePresence>
              {(tasks || []).filter(task => task && task.id).map((task, index) => (
                <Task 
                  key={task.id} 
                  task={task}
                  index={index}
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
            {provided.placeholder}
          </CardContent>
        </Card>
      )}
    </Droppable>
  );
};

const EisenhowerMatrix = ({ tasks, onOpenMatrix, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onEditNote, onOpenDetails, theme, onDragEnd }) => {
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
    <DragDropContext onDragEnd={onDragEnd}>
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
    </DragDropContext>
  );
};

export default EisenhowerMatrix;