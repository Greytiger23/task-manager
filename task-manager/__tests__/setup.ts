/**
 * Jest test setup configuration
 */

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock error boundary
jest.mock('@/components/ui/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    lte: jest.fn().mockReturnThis(),
  })),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  Task: {},
  Category: {},
  Profile: {},
}))

// Mock database module
jest.mock('@/lib/database', () => ({
  database: {
    tasks: {
      getAll: jest.fn(),
      getById: jest.fn(),
      getByCategory: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleComplete: jest.fn(),
      getUpcoming: jest.fn(),
    },
    categories: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    profile: {
      get: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock auth module
jest.mock('@/lib/auth', () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ session: null, error: null }),
    signIn: jest.fn().mockResolvedValue({ data: { user: mockSupabaseClient.auth.user }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: mockSupabaseClient.auth.user }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getCurrentUser: jest.fn().mockResolvedValue({ data: { user: mockSupabaseClient.auth.user }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
  },
}))

// Mock Toast component
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
  ToastContainer: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  
  // Reset console.error mock
  if (console.error !== originalError) {
    console.error = originalError
  }
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

// Suppress console.error during tests unless it's a real error
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('validateDOMNesting'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})