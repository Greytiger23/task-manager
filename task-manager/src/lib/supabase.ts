import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
  reminder_date?: string
  category_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}