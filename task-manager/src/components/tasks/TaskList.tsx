'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { Task, Category } from '@/lib/supabase'
import { database } from '@/lib/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { handleSupabaseError } from '@/lib/error-handler'
import { useToast } from '@/components/ui/Toast'

interface TaskListProps {
  selectedCategoryId?: string
}

export function TaskList({ selectedCategoryId }: TaskListProps) {
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (user) {
      loadTasks()
      loadCategories()
    }
  }, [user, selectedCategoryId])

  const loadTasks = async () => {
    if (!user) return

    setIsLoading(true)
    setLoadingError(null)
    try {
      const { data, error } = selectedCategoryId
        ? await database.tasks.getByCategory(selectedCategoryId, user.id)
        : await database.tasks.getAll(user.id)

      if (error) {
        const appError = handleSupabaseError(error, 'Loading tasks')
        setLoadingError(appError.message)
        showError('Failed to load tasks', appError.message)
      } else if (data) {
        setTasks(data)
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, 'Loading tasks')
      setLoadingError(appError.message)
      showError('Failed to load tasks', appError.message)
    }
    finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    if (!user) return

    try {
      const { data, error } = await database.categories.getAll(user.id)
      if (error) {
        const appError = handleSupabaseError(error, 'Loading categories')
        showError('Failed to load categories', appError.message)
      } else if (data) {
        setCategories(data)
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, 'Loading categories')
      showError('Failed to load categories', appError.message)
    }
  }

  const handleTaskSave = (savedTask: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === savedTask.id ? savedTask : task
      ))
      showSuccess('Task updated successfully')
    } else {
      setTasks(prev => [savedTask, ...prev])
      showSuccess('Task created successfully')
    }
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!user) return

    try {
      const { error } = await database.tasks.delete(taskId, user.id)
      if (error) {
        const appError = handleSupabaseError(error, 'Deleting task')
        showError('Failed to delete task', appError.message)
      } else {
        setTasks(prev => prev.filter(task => task.id !== taskId))
        showSuccess('Task deleted successfully')
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, 'Deleting task')
      showError('Failed to delete task', appError.message)
    }
  }

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed } : task
    ))
  }

  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Status filter
      if (filterStatus === 'pending' && task.completed) return false
      if (filterStatus === 'completed' && !task.completed) return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        
        default: // created_at
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const tasksWithCategories = filteredAndSortedTasks.map(task => ({
    ...task,
    categories: task.category_id 
      ? categories.find(cat => cat.id === task.category_id)
      : undefined
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategoryId 
              ? categories.find(cat => cat.id === selectedCategoryId)?.name || 'Category Tasks'
              : 'All Tasks'
            }
          </h1>
          <p className="text-gray-600">
            {tasksWithCategories.length} task{tasksWithCategories.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTask(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTask || undefined}
              onSave={handleTaskSave}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingTask(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Recent</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasksWithCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Task
              </Button>
            )}
          </div>
        ) : (
          tasksWithCategories.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  )
}