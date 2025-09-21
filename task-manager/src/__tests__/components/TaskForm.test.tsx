/**
 * @fileoverview Unit tests for TaskForm component
 * Tests form validation, submission, and editing functionality
 * AI-Generated: Form testing patterns and validation scenarios
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/tasks/TaskForm'
import { useAuth } from '@/contexts/AuthContext'
import * as database from '@/lib/database'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the database functions
jest.mock('@/lib/database')
const mockDatabase = database as jest.Mocked<typeof database>

const mockUser = {
  id: 'user1',
  email: 'test@example.com',
}

const mockCategories = [
  {
    id: 'cat1',
    name: 'Work',
    color: '#3B82F6',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'cat2',
    name: 'Personal',
    color: '#10B981',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const mockTask = {
  id: '1',
  title: 'Existing Task',
  description: 'Existing Description',
  completed: false,
  due_date: '2024-12-31',
  reminder_date: '2024-12-30',
  category_id: 'cat1',
  user_id: 'user1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  completed_at: null,
}

describe('TaskForm Component', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    })
    mockDatabase.categories.getAll.mockResolvedValue({ data: mockCategories, error: null })
  })

  it('renders create form correctly', async () => {
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockDatabase.categories.getAll).toHaveBeenCalled()
    })
  })

  it('renders edit form with existing task data', async () => {
    render(
      <TaskForm
        task={mockTask}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Edit Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument()
    expect(screen.getByText('Update Task')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('creates new task successfully', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.create.mockResolvedValue({ 
      data: { ...mockTask, id: 'new-id' }, 
      error: null 
    })

    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // Fill out the form
    await user.type(screen.getByLabelText('Title'), 'New Task')
    await user.type(screen.getByLabelText('Description'), 'New Description')
    
    // Submit the form
    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        category_id: null,
        due_date: null,
        reminder_date: null,
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('updates existing task successfully', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.update.mockResolvedValue({ 
      data: mockTask, 
      error: null 
    })

    render(
      <TaskForm
        task={mockTask}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // Modify the title
    const titleInput = screen.getByDisplayValue('Existing Task')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task')
    
    // Submit the form
    const submitButton = screen.getByText('Update Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.update).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        description: 'Existing Description',
        category_id: 'cat1',
        due_date: '2024-12-31',
        reminder_date: '2024-12-30',
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles form cancellation', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('handles category selection', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Select category')).toBeInTheDocument()
    })

    // Open category dropdown
    const categorySelect = screen.getByText('Select category')
    await user.click(categorySelect)

    // Select a category
    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })
  })

  it('handles date inputs correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const dueDateInput = screen.getByLabelText('Due Date')
    await user.type(dueDateInput, '2024-12-25')

    const reminderDateInput = screen.getByLabelText('Reminder Date')
    await user.type(reminderDateInput, '2024-12-24')

    expect(dueDateInput).toHaveValue('2024-12-25')
    expect(reminderDateInput).toHaveValue('2024-12-24')
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.create.mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to create task' } 
    })

    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'New Task')
    
    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument()
    })
  })

  it('validates reminder date is before due date', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'Test Task')
    await user.type(screen.getByLabelText('Due Date'), '2024-12-25')
    await user.type(screen.getByLabelText('Reminder Date'), '2024-12-26')

    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Reminder date must be before due date')).toBeInTheDocument()
    })
  })
})