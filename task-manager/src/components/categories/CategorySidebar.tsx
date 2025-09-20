'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Category } from '@/lib/supabase'
import { database } from '@/lib/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { Plus, Folder, Edit, Trash2, Hash } from 'lucide-react'

interface CategorySidebarProps {
  selectedCategoryId?: string
  onCategorySelect: (categoryId?: string) => void
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280'  // Gray
]

export function CategorySidebar({ selectedCategoryId, onCategorySelect }: CategorySidebarProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: DEFAULT_COLORS[0],
    description: ''
  })

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await database.categories.getAll(user.id)
      if (!error && data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim(),
        user_id: user.id
      }

      let result
      if (editingCategory) {
        result = await database.categories.update(editingCategory.id, categoryData, user.id)
      } else {
        result = await database.categories.create(categoryData)
      }

      if (!result.error && result.data) {
        if (editingCategory) {
          setCategories(prev => prev.map(cat => 
            cat.id === result.data.id ? result.data : cat
          ))
        } else {
          setCategories(prev => [...prev, result.data])
        }
        handleCloseForm()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!user) return

    try {
      const { error } = await database.categories.delete(categoryId, user.id)
      if (!error) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        if (selectedCategoryId === categoryId) {
          onCategorySelect(undefined)
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      color: DEFAULT_COLORS[0],
      description: ''
    })
  }

  if (isLoading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Categories</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.name.trim()}>
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          variant={!selectedCategoryId ? "default" : "ghost"}
          className="w-full justify-start mb-2"
          onClick={() => onCategorySelect(undefined)}
        >
          <Hash className="w-4 h-4 mr-2" />
          All Tasks
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 ${
                selectedCategoryId === category.id ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <button
                className="flex items-center flex-1 text-left"
                onClick={() => onCategorySelect(category.id)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {category.description}
                    </div>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No categories yet</p>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-3 h-3 mr-1" />
              Add Category
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}