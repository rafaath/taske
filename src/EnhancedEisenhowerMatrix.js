import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Zap, Clock, Target, Coffee, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

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
  'Urgent & Important': Zap,
  'Urgent & Not Important': Clock,
  'Not Urgent & Important': Target,
  'Not Urgent & Not Important': Coffee
};

const Task = ({ task, onEdit, onDelete, onToggleComplete, theme, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleEdit = () => {
    onEdit(task.id, editedTitle);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-2 rounded ${colorPalette[theme].card} shadow-sm hover:shadow-md transition-shadow`}
        >
          {isEditing ? (
            <div className="flex items-center">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-grow mr-2"
                autoFocus
              />
              <Button onClick={handleEdit} size="sm">Save</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleComplete(task)}
                  className="mr-2"
                >
                  {task.completed ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                </Button>
                <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
              </div>
              <div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const QuadrantCard = ({ title, tasks, onEditTask, onDeleteTask, onToggleComplete, theme, onDragEnd }) => {
  const Icon = QuadrantIcons[title];

  return (
    <Card className={`h-full overflow-hidden shadow-lg ${colorPalette[theme].card}`}>
      <CardHeader className={`font-semibold flex justify-between items-center p-4 ${colorPalette[theme].accent} ${colorPalette[theme].buttonText}`}>
        <div className="flex items-center">
          <Icon className="mr-2" size={20} />
          <span className="text-lg font-bold">{title}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[calc(50vh-100px)] overflow-y-auto">
        <Droppable droppableId={title}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => (
                <Task
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleComplete={onToggleComplete}
                  theme={theme}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

const EnhancedEisenhowerMatrix = ({ tasks, onEditTask, onDeleteTask, onToggleComplete, onMoveTask, theme, colorPalette }) => {
  const quadrants = [
    'Urgent & Important',
    'Urgent & Not Important',
    'Not Urgent & Important',
    'Not Urgent & Not Important'
  ];

  const getQuadrantTasks = (quadrant) => {
    const [urgent, important] = {
      'Urgent & Important': [true, true],
      'Urgent & Not Important': [true, false],
      'Not Urgent & Important': [false, true],
      'Not Urgent & Not Important': [false, false],
    }[quadrant];

    return tasks.filter(task => task.urgent === urgent && task.important === important);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId;
    const destinationQuadrant = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceQuadrant !== destinationQuadrant) {
      const [urgent, important] = {
        'Urgent & Important': [true, true],
        'Urgent & Not Important': [true, false],
        'Not Urgent & Important': [false, true],
        'Not Urgent & Not Important': [false, false],
      }[destinationQuadrant];

      onMoveTask(taskId, urgent, important);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map(quadrant => (
          <QuadrantCard
            key={quadrant}
            title={quadrant}
            tasks={getQuadrantTasks(quadrant)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            theme={theme}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default EnhancedEisenhowerMatrix;