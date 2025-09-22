/**
 * @fileoverview TaskItem component for displaying individual tasks
 * Provides functionality for task completion, editing, and deletion
 * AI-Enhanced: Added comprehensive documentation and type safety
 */

'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/supabase'
import { database } from '@/lib/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { Pencil, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react'
import { handleSupabaseError } from '@/lib/error-handler'
import { useToast } from '@/components/ui/Toast'

/**
 * Props for the TaskItem component
 */
interface TaskItemProps {
  /** The task object with optional category information */
  task: Task & {
    categories?: {
      id: string
      name: string
      color: string
    }
  }
  /** Callback function called when task edit is requested */
  onEdit: (task: Task) => void
  /** Callback function called when task deletion is requested */
  onDelete: (taskId: string) => void
  /** Callback function called when task completion status changes */
  onToggleComplete: (taskId: string, completed: boolean) => void
}

/**
 * TaskItem Component
 * 
 * Displays an individual task with the following features:
 * - Task completion toggle with checkbox
 * - Task title and description display
 * - Category badge with color coding
 * - Due date and reminder date display
 * - Edit and delete action buttons
 * - Loading states during operations
 * 
 * @param props - The component props
 * @returns JSX element representing the task item
 */
export function TaskItem({ task, onEdit, onDelete, onToggleComplete }: TaskItemProps) {
  const { user } = useAuth()
  const { error: showError, success: showSuccess } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  /**
   * Handles toggling task completion status
   * AI-Enhanced: Added comprehensive error handling and user feedback
   */
  const handleToggleComplete = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    setOperationError(null)
    
    try {
      const { error } = await database.tasks.toggleComplete(task.id, user.id)
      
      if (error) {
        const appError = handleSupabaseError(error, 'Updating task status')
        setOperationError(appError.message)
        showError('Failed to update task', appError.message)
      } else {
        const newStatus = !task.completed
        onToggleComplete(task.id, newStatus)
        showSuccess(
          newStatus ? 'Task completed!' : 'Task marked as incomplete',
          `"${task.title}" has been ${newStatus ? 'completed' : 'marked as incomplete'}`
        )
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, 'Updating task status')
      setOperationError(appError.message)
      showError('Failed to update task', appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (isLoading) return
    onEdit(task)
  }

  const handleDelete = async () => {
    if (!user || isLoading) return
    
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return
    }

    setIsLoading(true)
    setOperationError(null)
    
    try {
      const { error } = await database.tasks.delete(task.id, user.id)
      
      if (error) {
        const appError = handleSupabaseError(error, 'Deleting task')
        setOperationError(appError.message)
        showError('Failed to delete task', appError.message)
      } else {
        onDelete(task.id)
        showSuccess('Task deleted', `"${task.title}" has been deleted`)
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, 'Deleting task')
      setOperationError(appError.message)
      showError('Failed to delete task', appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed
  const isDueSoon = task.due_date && new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !task.completed

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.completed ? 'opacity-75 bg-gray-50' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isUpdating}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium text-gray-900 ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm text-gray-600 mt-1 ${
                    task.completed ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {task.categories && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${task.categories.color}20`,
                        color: task.categories.color,
                        borderColor: `${task.categories.color}40`
                      }}
                    >
                      {task.categories.name}
                    </Badge>
                  )}
                  
                  {task.due_date && (
                    <div className={`flex items-center gap-1 text-xs ${
                      isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}
                  
                  {task.reminder_date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(task.reminder_date)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}