import { supabase, Task, Category } from './supabase'

export const database = {
  // Task operations
  tasks: {
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

    create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single()
    },

    update: async (id: string, updates: Partial<Task>, userId: string) => {
      return await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    },

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

    delete: async (id: string, userId: string) => {
      return await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    },

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
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })
      
      return { data, error }
    },

    async getById(id: string, userId: string) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    },

    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()
      
      return { data, error }
    },

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

    async delete(id: string, userId: string) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      return { error }
    },

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
    async get(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      return { data, error }
    },

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