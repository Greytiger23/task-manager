/**
 * Tests for AuthProvider component
 * Covers authentication state management, sign in/up/out flows, and error handling
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { mockUser, mockSupabaseError } from '../../../__tests__/utils/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase')
const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="user-status">
        {loading ? 'Loading' : user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children and provide auth context', () => {
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user-status')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('should handle successful sign in', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    await user.click(signInButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle sign in error', async () => {
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockSupabaseError
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    await user.click(signInButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Sign in error:', mockSupabaseError)
    })

    consoleSpy.mockRestore()
  })

  it('should handle successful sign up', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    await user.click(signUpButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle sign up error', async () => {
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: mockSupabaseError
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    await user.click(signUpButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Sign up error:', mockSupabaseError)
    })

    consoleSpy.mockRestore()
  })

  it('should handle sign out', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle sign out error', async () => {
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockSupabase.auth.signOut.mockResolvedValue({
      error: mockSupabaseError
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Sign out error:', mockSupabaseError)
    })

    consoleSpy.mockRestore()
  })

  it('should update user state on auth state change', async () => {
    let authStateCallback: (event: string, session: any) => void

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      } as any
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate auth state change to signed in
    act(() => {
      authStateCallback('SIGNED_IN', { user: mockUser })
    })

    await waitFor(() => {
      expect(screen.getByText(`Logged in as ${mockUser.email}`)).toBeInTheDocument()
    })

    // Simulate auth state change to signed out
    act(() => {
      authStateCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
  })

  it('should cleanup subscription on unmount', () => {
    const unsubscribeMock = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } }
    } as any)

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(unsubscribeMock).toHaveBeenCalled()
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})