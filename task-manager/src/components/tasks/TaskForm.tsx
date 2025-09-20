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
import { CalendarIcon, Clock } from 'lucide-react'

interface TaskFormProps {
  task?: Task
  onSave: (task: Task) => void
  onCancel: () => void
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
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
        const { data, error } = await database.categories.getAll(user.id)
        if (!error && data) {
          setCategories(data)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isLoading) return

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

      if (!result.error && result.data) {
        onSave(result.data)
      }
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
            />
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
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_date">Reminder</Label>
              <div className="relative">
                <Input
                  id="reminder_date"
                  type="datetime-local"
                  value={formData.reminder_date}
                  onChange={(e) => handleInputChange('reminder_date', e.target.value)}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
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