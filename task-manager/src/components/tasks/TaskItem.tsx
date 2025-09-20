'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/supabase'
import { database } from '@/lib/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { Pencil, Trash2, Calendar, Clock } from 'lucide-react'

interface TaskItemProps {
  task: Task & {
    categories?: {
      id: string
      name: string
      color: string
    }
  }
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleComplete: (taskId: string, completed: boolean) => void
}

export function TaskItem({ task, onEdit, onDelete, onToggleComplete }: TaskItemProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    if (!user || isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await database.tasks.toggleComplete(
        task.id,
        !task.completed,
        user.id
      )
      
      if (!error) {
        onToggleComplete(task.id, !task.completed)
      }
    } catch (error) {
      console.error('Error toggling task completion:', error)
    } finally {
      setIsUpdating(false)
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