/**
 * Test utilities for rendering components with providers and creating mock data
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { User } from '@supabase/supabase-js'
import { Task, Category } from '@/lib/supabase'

/**
 * Mock user data for testing
 */
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
}

/**
 * Mock task data for testing
 */
export const mockTask: Task = {
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test task description',
  completed: false,
  priority: 'medium',
  due_date: '2024-12-31T23:59:59Z',
  reminder_date: '2024-12-30T09:00:00Z',
  category_id: 'test-category-id',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

/**
 * Mock category data for testing
 */
export const mockCategory: Category = {
  id: 'test-category-id',
  name: 'Test Category',
  color: '#3B82F6',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
}

const AllTheProviders = ({ children, user = mockUser }: { children: React.ReactNode; user?: User | null }) => {
  // Mock the AuthProvider context value
  const mockAuthContext = {
    user,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }

  return (
    <AuthProvider value={mockAuthContext}>
      {children}
    </AuthProvider>
  )
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders user={user}>{children}</AllTheProviders>,
    ...renderOptions,
  })
}

/**
 * Mock database responses
 */
export const mockDatabaseResponses = {
  tasks: {
    getAll: jest.fn().mockResolvedValue({ data: [mockTask], error: null }),
    getById: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    create: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    update: jest.fn().mockResolvedValue({ data: { ...mockTask, title: 'Updated Task' }, error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    toggleComplete: jest.fn().mockResolvedValue({ data: { ...mockTask, completed: true }, error: null }),
    getByCategory: jest.fn().mockResolvedValue({ data: [mockTask], error: null }),
    getUpcoming: jest.fn().mockResolvedValue({ data: [mockTask], error: null }),
  },
  categories: {
    getAll: jest.fn().mockResolvedValue({ data: [mockCategory], error: null }),
    getById: jest.fn().mockResolvedValue({ data: mockCategory, error: null }),
    create: jest.fn().mockResolvedValue({ data: mockCategory, error: null }),
    update: jest.fn().mockResolvedValue({ data: { ...mockCategory, name: 'Updated Category' }, error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    getWithTaskCount: jest.fn().mockResolvedValue({ 
      data: [{ ...mockCategory, task_count: 5 }], 
      error: null 
    }),
  },
  profile: {
    get: jest.fn().mockResolvedValue({ 
      data: { 
        id: 'test-user-id', 
        email: 'test@example.com', 
        full_name: 'Test User',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }, 
      error: null 
    }),
    update: jest.fn().mockResolvedValue({ 
      data: { 
        id: 'test-user-id', 
        email: 'test@example.com', 
        full_name: 'Updated User',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }, 
      error: null 
    }),
  },
}

/**
 * Mock Supabase error for testing error handling
 */
export const mockSupabaseError = {
  message: 'Test error message',
  details: 'Test error details',
  hint: 'Test error hint',
  code: 'TEST_ERROR',
}

/**
 * Helper to create mock events
 */
export const createMockEvent = (value: string) => ({
  target: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
})

/**
 * Helper to wait for async operations in tests
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }