'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Task, Category } from '@/lib/supabase'
import { database } from '@/lib/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { handleSupabaseError, validateRequiredFields, AppError } from '@/lib/error-handler'
import { useToast } from '@/components/ui/Toast'

interface TaskFormProps {
  task?: Task
  onSave: (task: Task) => void
  onCancel: () => void
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const { user } = useAuth()
  const { error: showError, success: showSuccess } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingError, setLoadingError] = useState<AppError | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category_id: task?.category_id || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    reminder_date: task?.reminder_date ? new Date(task.reminder_date).toISOString().slice(0, 16) : '',
    priority: task?.priority || 'medium'
  })

  useEffect(() => {
    const loadCategories = async () => {
      if (!user) return
      
      try {
        setLoadingError(null)
        const { data, error } = await database.categories.getAll(user.id)
        
        if (error) {
          const appError = handleSupabaseError(error, 'Loading categories')
          setLoadingError(appError)
          showError('Failed to load categories', appError.message)
        } else if (data) {
          setCategories(data)
        }
      } catch (error) {
        const appError = handleSupabaseError(error as Error, 'Loading categories')
        setLoadingError(appError)
        showError('Failed to load categories', appError.message)
      }
    }

    loadCategories()
  }, [user, showError])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validate required fields
    const requiredFields = { title: formData.title.trim() }
    const requiredFieldErrors = validateRequiredFields(requiredFields)
    Object.assign(errors, requiredFieldErrors)
    
    // Validate dates
    if (formData.due_date && formData.reminder_date) {
      const dueDate = new Date(formData.due_date)
      const reminderDate = new Date(formData.reminder_date)
      
      if (reminderDate > dueDate) {
        errors.reminder_date = 'Reminder date cannot be after due date'
      }
    }
    
    // Validate title length
    if (formData.title.trim().length > 255) {
      errors.title = 'Title must be less than 255 characters'
    }
    
    // Validate description length
    if (formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isLoading) return

    // Clear previous validation errors
    setValidationErrors({})
    
    // Validate form
    if (!validateForm()) {
      showError('Please fix the validation errors', 'Check the form fields and try again')
      return
    }

    setIsLoading(true)
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        reminder_date: formData.reminder_date ? new Date(formData.reminder_date).toISOString() : null,
        priority: formData.priority as 'low' | 'medium' | 'high',
        user_id: user.id
      }

      let result
      if (task) {
        // Update existing task
        result = await database.tasks.update(task.id, taskData, user.id)
      } else {
        // Create new task
        result = await database.tasks.create(taskData)
      }

      if (result.error) {
        const appError = handleSupabaseError(result.error, task ? 'Updating task' : 'Creating task')
        showError(appError.userMessage, appError.message)
      } else if (result.data) {
        showSuccess(
          task ? 'Task updated successfully' : 'Task created successfully',
          `Task "${taskData.title}" has been ${task ? 'updated' : 'created'}`
        )
        onSave(result.data)
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error, task ? 'Updating task' : 'Creating task')
      showError(appError.userMessage, appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Show loading error if categories failed to load
  if (loadingError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load form data</p>
              <p className="text-sm text-gray-600">{loadingError.message}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
              className={validationErrors.title ? 'border-red-500' : ''}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              className={validationErrors.description ? 'border-red-500' : ''}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <div className="relative">
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={validationErrors.due_date ? 'border-red-500' : ''}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {validationErrors.due_date && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.due_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_date">Reminder</Label>
              <div className="relative">
                <Input
                  id="reminder_date"
                  type="datetime-local"
                  value={formData.reminder_date}
                  onChange={(e) => handleInputChange('reminder_date', e.target.value)}
                  className={validationErrors.reminder_date ? 'border-red-500' : ''}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {validationErrors.reminder_date && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.reminder_date}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}