/**
 * Tests for AuthProvider component
 * Covers authentication state management, sign in/up/out flows, and error handling
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import { auth } from '@/lib/auth'
import { mockUser, mockSupabaseError } from '../../../__tests__/utils/test-utils'
import { beforeEach } from '@jest/globals'

// Mock auth module
import { jest } from '@jest/globals';
jest.mock('@/lib/auth');
const mockAuth = auth as jest.Mocked<typeof auth>

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

import { describe } from '@jest/globals';

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockAuth.getSession.mockResolvedValue({ session: null, error: null })
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
  })

  it('should render children and provide auth context', () => {
    mockAuth.onAuthStateChange.mockReturnValue({
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

  it('should show loading state initially', async () => {
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('should handle sign in successfully', async () => {
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signIn.mockResolvedValue({
      data: { user: mockUser },
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
      expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('should handle sign in error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signIn.mockRejectedValue(mockSupabaseError)

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

  it('should handle sign up successfully', async () => {
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signUp.mockResolvedValue({
      data: { user: mockUser },
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
      expect(mockAuth.signUp).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('should handle sign up error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signUp.mockRejectedValue(mockSupabaseError)

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

  it('should handle sign out successfully', async () => {
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signOut.mockResolvedValue({
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
      expect(mockAuth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle sign out error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const user = userEvent.setup()
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    mockAuth.signOut.mockRejectedValue(mockSupabaseError)

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

    mockAuth.onAuthStateChange.mockImplementation((callback) => {
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
    mockAuth.onAuthStateChange.mockReturnValue({
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
    // Create a component that uses useAuth outside of provider
    const TestComponentOutside = () => {
      const { user } = useAuth()
      return <div>{user?.email}</div>
    }

    expect(() => {
      render(<TestComponentOutside />)
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})