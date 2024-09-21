// utils/kv.js
import { kv } from '@vercel/kv';

export async function getTasks() {
  const tasks = await kv.get('tasks');
  return tasks || [
    {
      id: 'root',
      title: 'Main Tasks',
      tasks: [
        { id: 1, title: 'Project A', urgent: true, important: true, subtasks: [] },
        { id: 2, title: 'Task B', urgent: true, important: false, subtasks: [] },
        { id: 3, title: 'Goal C', urgent: false, important: true, subtasks: [] },
        { id: 4, title: 'Item D', urgent: false, important: false, subtasks: [] },
      ]
    }
  ];
}

export async function saveTasks(tasks) {
  await kv.set('tasks', tasks);
}

export async function addTask(parentId, newTask) {
  const tasks = await getTasks();
  const updatedTasks = addTaskToHierarchy(tasks, parentId, newTask);
  await saveTasks(updatedTasks);
  return updatedTasks;
}

export async function updateTask(taskId, updatedTask) {
  const tasks = await getTasks();
  const updatedTasks = updateTaskInHierarchy(tasks, taskId, updatedTask);
  await saveTasks(updatedTasks);
  return updatedTasks;
}

export async function deleteTask(taskId) {
  const tasks = await getTasks();
  const updatedTasks = deleteTaskFromHierarchy(tasks, taskId);
  await saveTasks(updatedTasks);
  return updatedTasks;
}

function addTaskToHierarchy(tasks, parentId, newTask) {
  return tasks.map(task => {
    if (task.id === parentId) {
      return { ...task, tasks: [...task.tasks, newTask] };
    }
    if (task.tasks) {
      return { ...task, tasks: addTaskToHierarchy(task.tasks, parentId, newTask) };
    }
    return task;
  });
}

function updateTaskInHierarchy(tasks, taskId, updatedTask) {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, ...updatedTask };
    }
    if (task.tasks) {
      return { ...task, tasks: updateTaskInHierarchy(task.tasks, taskId, updatedTask) };
    }
    return task;
  });
}

function deleteTaskFromHierarchy(tasks, taskId) {
  return tasks.filter(task => task.id !== taskId).map(task => {
    if (task.tasks) {
      return { ...task, tasks: deleteTaskFromHierarchy(task.tasks, taskId) };
    }
    return task;
  });
}