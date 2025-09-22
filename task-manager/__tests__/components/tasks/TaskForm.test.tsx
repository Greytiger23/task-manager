/**
 * Tests for TaskForm component
 * Covers form validation, submission, error handling, and user interactions
 */

import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/tasks/TaskForm'
import { database } from '@/lib/database'
import { 
  render, 
  mockTask, 
  mockCategory, 
  mockDatabaseResponses, 
  mockSupabaseError,
  createMockEvent 
} from '../../../__tests__/utils/test-utils'

// Mock database
jest.mock('@/lib/database', () => ({
  database: {
    categories: {
      getAll: jest.fn(),
    },
    tasks: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockDatabase = database as jest.Mocked<typeof database>

describe('TaskForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDatabase.categories.getAll.mockResolvedValue(mockDatabaseResponses.categories.getAll())
  })

  it('should render form fields correctly', async () => {
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/reminder/i)).toBeInTheDocument()
    })
  })

  it('should load categories on mount', async () => {
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    await waitFor(() => {
      expect(mockDatabase.categories.getAll).toHaveBeenCalled()
    })
  })

  it('should populate form when editing existing task', async () => {
    render(
      <TaskForm 
        task={mockTask} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockTask.description!)).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should validate title length', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'a'.repeat(201)) // Exceeds max length

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/title must be 200 characters or less/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should validate description length', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    await user.type(titleInput, 'Valid Title')
    await user.type(descriptionInput, 'a'.repeat(1001)) // Exceeds max length

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/description must be 1000 characters or less/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should validate due date is not in the past', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    const dueDateInput = screen.getByLabelText(/due date/i)
    
    await user.type(titleInput, 'Valid Title')
    
    // Set date to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    
    await user.type(dueDateInput, yesterdayString)

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/due date cannot be in the past/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should validate reminder date is before due date', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    const dueDateInput = screen.getByLabelText(/due date/i)
    const reminderInput = screen.getByLabelText(/reminder/i)
    
    await user.type(titleInput, 'Valid Title')
    
    // Set due date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]
    
    // Set reminder to day after tomorrow
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    const dayAfterString = dayAfter.toISOString()
    
    await user.type(dueDateInput, tomorrowString)
    fireEvent.change(reminderInput, { target: { value: dayAfterString } })

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/reminder must be before due date/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should create new task successfully', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.create.mockResolvedValue(mockDatabaseResponses.tasks.create())

    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    await user.type(titleInput, 'New Task')
    await user.type(descriptionInput, 'New task description')

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'New task description',
        }),
        expect.any(String)
      )
      expect(mockOnSave).toHaveBeenCalledWith(mockTask)
    })
  })

  it('should update existing task successfully', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.update.mockResolvedValue(mockDatabaseResponses.tasks.update())

    render(
      <TaskForm 
        task={mockTask} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    const titleInput = screen.getByDisplayValue(mockTask.title)
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task')

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.update).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({
          title: 'Updated Task',
        }),
        expect.any(String)
      )
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('should handle task creation error', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.create.mockResolvedValue({
      data: null,
      error: mockSupabaseError
    })

    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'New Task')

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.create).toHaveBeenCalled()
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  it('should handle category loading error', async () => {
    mockDatabase.categories.getAll.mockResolvedValue({
      data: null,
      error: mockSupabaseError
    })

    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    await waitFor(() => {
      expect(mockDatabase.categories.getAll).toHaveBeenCalled()
    })
  })

  it('should clear validation errors on input change', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    // Trigger validation error
    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })

    // Type in title field to clear error
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Valid Title')

    await waitFor(() => {
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const cancelButton = screen.getByText(/cancel/i)
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    // Mock a delayed response
    mockDatabase.tasks.create.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(mockDatabaseResponses.tasks.create()), 100)
      )
    )

    render(
      <TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'New Task')

    const saveButton = screen.getByText(/save task/i)
    await user.click(saveButton)

    // Should show loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
    expect(saveButton).toBeDisabled()

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })
})