/**
 * Database operations module for the Task Manager application.
 * Provides a centralized interface for all database operations including
 * tasks, categories, and user profile management using Supabase.
 * 
 * @module database
 * @author Task Manager Team
 * @version 1.0.0
 */

import { supabase, Task, Category, Profile } from './supabase'

/**
 * Main database interface providing organized access to all database operations.
 * Structured into logical groups: tasks, categories, and profile operations.
 */
export const database = {
  // Task operations
  tasks: {
    /**
     * Retrieves all tasks for a specific user with their associated category information.
     * Tasks are ordered by creation date (newest first).
     * 
     * @param userId - The unique identifier of the user
     * @returns Promise resolving to Supabase query result containing tasks with category data
     * @example
     * ```typescript
     * const { data, error } = await database.tasks.getAll(user.id);
     * if (data) {
     *   console.log(`Found ${data.length} tasks`);
     * }
     * ```
     */
    getAll: async (userId: string) => {
      return await supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    },

    /**
     * Retrieves a single task by ID for a specific user with category information.
     * 
     * @param id - The unique identifier of the task
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result containing the task
     * @throws Will return error if task not found or user doesn't have access
     */
    getById: async (id: string, userId: string) => {
      return await supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single()
    },

    /**
     * Retrieves all tasks belonging to a specific category for a user.
     * Results are ordered by creation date (newest first).
     * 
     * @param categoryId - The unique identifier of the category
     * @param userId - The unique identifier of the user
     * @returns Promise resolving to Supabase query result containing filtered tasks
     */
    getByCategory: async (categoryId: string, userId: string) => {
      return await supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('category_id', categoryId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    },

    /**
     * Creates a new task in the database.
     * 
     * @param task - Task data excluding auto-generated fields (id, created_at, updated_at)
     * @returns Promise resolving to Supabase query result containing the created task
     * @example
     * ```typescript
     * const newTask = {
     *   title: 'Complete project',
     *   description: 'Finish the task manager app',
     *   user_id: user.id,
     *   category_id: category.id,
     *   due_date: '2024-12-31',
     *   priority: 'high',
     *   completed: false
     * };
     * const { data, error } = await database.tasks.create(newTask);
     * ```
     */
    create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single()
    },

    /**
     * Updates an existing task with new data.
     * Automatically sets the updated_at timestamp.
     * 
     * @param id - The unique identifier of the task to update
     * @param updates - Partial task data containing fields to update
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result containing the updated task
     */
    update: async (id: string, updates: Partial<Task>, userId: string) => {
      return await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    },

    /**
     * Toggles the completion status of a task.
     * Sets completed_at timestamp when marking as complete, clears it when marking incomplete.
     * 
     * @param id - The unique identifier of the task
     * @param completed - The new completion status
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result containing the updated task
     */
    toggleComplete: async (id: string, completed: boolean, userId: string) => {
      return await supabase
        .from('tasks')
        .update({ 
          completed, 
          updated_at: new Date().toISOString(),
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    },

    /**
     * Permanently deletes a task from the database.
     * 
     * @param id - The unique identifier of the task to delete
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result
     * @warning This operation cannot be undone
     */
    delete: async (id: string, userId: string) => {
      return await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    },

    /**
     * Retrieves upcoming incomplete tasks within a specified time frame.
     * Useful for dashboard widgets and deadline notifications.
     * 
     * @param userId - The unique identifier of the user
     * @param days - Number of days to look ahead (default: 7)
     * @returns Promise resolving to tasks due within the specified timeframe
     * @example
     * ```typescript
     * // Get tasks due in the next 3 days
     * const { data, error } = await database.tasks.getUpcoming(user.id, 3);
     * ```
     */
    async getUpcoming(userId: string, days: number = 7) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('user_id', userId)
        .eq('completed', false)
        .lte('due_date', futureDate.toISOString())
        .order('due_date', { ascending: true })
      
      return { data, error }
    }
  },

  // Category operations
  categories: {
    /**
     * Retrieves all categories for a specific user.
     * Results are ordered alphabetically by name.
     * 
     * @param userId - The unique identifier of the user
     * @returns Promise resolving to Supabase query result containing user's categories
     */
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })
      
      return { data, error }
    },

    /**
     * Retrieves a single category by ID for a specific user.
     * 
     * @param id - The unique identifier of the category
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result containing the category
     */
    async getById(id: string, userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    },

    /**
     * Creates a new category in the database.
     * 
     * @param category - Category data excluding auto-generated fields
     * @returns Promise resolving to Supabase query result containing the created category
     * @example
     * ```typescript
     * const newCategory = {
     *   name: 'Work Projects',
     *   color: '#3B82F6',
     *   user_id: user.id
     * };
     * const { data, error } = await database.categories.create(newCategory);
     * ```
     */
    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()
      
      return { data, error }
    },

    /**
     * Updates an existing category with new data.
     * 
     * @param id - The unique identifier of the category to update
     * @param updates - Partial category data containing fields to update
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result containing the updated category
     */
    async update(id: string, updates: Partial<Category>, userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      
      return { data, error }
    },

    /**
     * Permanently deletes a category from the database.
     * 
     * @param id - The unique identifier of the category to delete
     * @param userId - The unique identifier of the user (for security)
     * @returns Promise resolving to Supabase query result
     * @warning This will also affect tasks associated with this category
     */
    async delete(id: string, userId: string) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      return { error }
    },

    /**
     * Retrieves all categories with their associated task counts.
     * Useful for displaying category statistics in the sidebar.
     * 
     * @param userId - The unique identifier of the user
     * @returns Promise resolving to categories with task count information
     */
    async getWithTaskCount(userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          tasks (count)
        `)
        .eq('user_id', userId)
        .order('name', { ascending: true })
      
      return { data, error }
    }
  },

  // Profile operations
  profile: {
    /**
     * Retrieves user profile information.
     * 
     * @param userId - The unique identifier of the user
     * @returns Promise resolving to Supabase query result containing user profile
     */
    async get(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      return { data, error }
    },

    /**
     * Updates user profile information.
     * 
     * @param userId - The unique identifier of the user
     * @param updates - Profile data to update (full_name, avatar_url)
     * @returns Promise resolving to Supabase query result containing updated profile
     * @example
     * ```typescript
     * const updates = { full_name: 'John Doe', avatar_url: 'https://...' };
     * const { data, error } = await database.profile.update(user.id, updates);
     * ```
     */
    async update(userId: string, updates: { full_name?: string; avatar_url?: string }) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      return { data, error }
    }
  }
}