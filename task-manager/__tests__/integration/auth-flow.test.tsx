/**
 * Integration tests for authentication flow
 * Tests the complete user authentication journey including sign up, sign in, and sign out
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../__tests__/utils/test-utils'
import { AuthProvider } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Test component that uses auth context
const TestAuthComponent = () => {
  const [showSignUp, setShowSignUp] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSignUp = async () => {
    const { error } = await mockSupabase.auth.signUp({
      email,
      password,
    })
    if (!error) {
      setShowSignUp(false)
    }
  }

  const handleSignIn = async () => {
    const { error } = await mockSupabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const handleSignOut = async () => {
    await mockSupabase.auth.signOut()
  }

  return (
    <div>
      <h1>Auth Test Component</h1>
      
      {showSignUp ? (
        <div data-testid="signup-form">
          <h2>Sign Up</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="signup-email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="signup-password"
          />
          <button onClick={handleSignUp} data-testid="signup-submit">
            Sign Up
          </button>
          <button onClick={() => setShowSignUp(false)} data-testid="signup-cancel">
            Cancel
          </button>
        </div>
      ) : (
        <div data-testid="signin-form">
          <h2>Sign In</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="signin-email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="signin-password"
          />
          <button onClick={handleSignIn} data-testid="signin-submit">
            Sign In
          </button>
          <button onClick={() => setShowSignUp(true)} data-testid="show-signup">
            Sign Up Instead
          </button>
          <button onClick={handleSignOut} data-testid="signout-button">
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    // Mock auth state change listener
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
  })

  it('should complete sign up flow successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful sign up
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
        session: null,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Navigate to sign up form
    const showSignUpButton = screen.getByTestId('show-signup')
    await user.click(showSignUpButton)

    expect(screen.getByTestId('signup-form')).toBeInTheDocument()

    // Fill out sign up form
    const emailInput = screen.getByTestId('signup-email')
    const passwordInput = screen.getByTestId('signup-password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Submit sign up
    const submitButton = screen.getByTestId('signup-submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    // Should return to sign in form after successful sign up
    await waitFor(() => {
      expect(screen.getByTestId('signin-form')).toBeInTheDocument()
    })
  })

  it('should handle sign up errors', async () => {
    const user = userEvent.setup()
    
    // Mock sign up error
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: 'Email already registered',
        status: 400,
      },
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Navigate to sign up form
    const showSignUpButton = screen.getByTestId('show-signup')
    await user.click(showSignUpButton)

    // Fill out and submit form
    const emailInput = screen.getByTestId('signup-email')
    const passwordInput = screen.getByTestId('signup-password')
    
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByTestId('signup-submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalled()
    })

    // Should remain on sign up form when there's an error
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
  })

  it('should complete sign in flow successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful sign in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString(),
          },
        },
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Fill out sign in form
    const emailInput = screen.getByTestId('signin-email')
    const passwordInput = screen.getByTestId('signin-password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Submit sign in
    const submitButton = screen.getByTestId('signin-submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should handle sign in errors', async () => {
    const user = userEvent.setup()
    
    // Mock sign in error
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: 'Invalid login credentials',
        status: 400,
      },
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Fill out and submit sign in form
    const emailInput = screen.getByTestId('signin-email')
    const passwordInput = screen.getByTestId('signin-password')
    
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByTestId('signin-submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
    })
  })

  it('should complete sign out flow successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful sign out
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Click sign out button
    const signOutButton = screen.getByTestId('signout-button')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle sign out errors', async () => {
    const user = userEvent.setup()
    
    // Mock sign out error
    mockSupabase.auth.signOut.mockResolvedValue({
      error: {
        message: 'Sign out failed',
        status: 500,
      },
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    // Click sign out button
    const signOutButton = screen.getByTestId('signout-button')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should maintain authentication state across components', async () => {
    // Mock authenticated session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString(),
          },
        },
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    })
  })

  it('should handle session restoration on app load', async () => {
    // Mock existing session
    const mockSession = {
      access_token: 'existing-token',
      refresh_token: 'existing-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'existing-user-id',
        email: 'existing@example.com',
        created_at: new Date().toISOString(),
      },
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    })
  })

  it('should clean up auth listener on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })

    const { unmount } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})