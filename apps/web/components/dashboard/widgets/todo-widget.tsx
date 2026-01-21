'use client';

import { Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// Mock data - replace with persisted data
const initialTodos: TodoItem[] = [
  { id: '1', text: 'Review Lesson 3 feedback', completed: false },
  { id: '2', text: 'Add quiz to Module 2', completed: false },
  { id: '3', text: 'Upload new video assets', completed: true },
];

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <WidgetWrapper
      title="To-Do & Notes"
      size={2}
      headerAction={
        <span className="text-xs text-white">
          {completedCount}/{todos.length} done
        </span>
      }
    >
      <div className="space-y-2">
        {/* Add new todo */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a task..."
            className="flex-1 text-sm px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Todo list */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-sm text-white text-center py-4">No tasks yet</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 group"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: todo.completed
                      ? 'var(--inspire-checkbox-checked-bg)'
                      : 'transparent',
                    borderColor: todo.completed
                      ? 'var(--inspire-checkbox-checked)'
                      : 'var(--inspire-checkbox-unchecked)',
                    color: todo.completed ? '#ffffff' : 'transparent',
                  }}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </button>
                <span
                  className={cn(
                    'flex-1 text-sm transition-colors text-white',
                    todo.completed && 'opacity-50 line-through',
                  )}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 text-white/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
