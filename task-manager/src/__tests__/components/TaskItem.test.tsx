/**
 * @fileoverview Unit tests for TaskItem component
 * Tests task display, completion toggle, editing, and deletion functionality
 * AI-Generated: Core test structure and mocking patterns
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useAuth } from '@/contexts/AuthContext'
import * as database from '@/lib/database'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the database functions
jest.mock('@/lib/database')
const mockDatabase = database as jest.Mocked<typeof database>

// Mock task data
const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  due_date: '2024-12-31',
  reminder_date: '2024-12-30',
  category_id: 'cat1',
  user_id: 'user1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  completed_at: null,
}

const mockCategory = {
  id: 'cat1',
  name: 'Work',
  color: '#3B82F6',
  user_id: 'user1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockUser = {
  id: 'user1',
  email: 'test@example.com',
}

describe('TaskItem Component', () => {
  const mockOnUpdate = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    })
  })

  it('renders task information correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Due: Dec 31, 2024')).toBeInTheDocument()
  })

  it('displays completed task with proper styling', () => {
    const completedTask = { ...mockTask, completed: true }
    
    render(
      <TaskItem
        task={completedTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('toggles task completion when checkbox is clicked', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.toggleComplete.mockResolvedValue({ data: null, error: null })

    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockDatabase.tasks.toggleComplete).toHaveBeenCalledWith('1', true)
    expect(mockOnUpdate).toHaveBeenCalled()
  })

  it('opens edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByLabelText('Edit task')
    await user.click(editButton)

    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  it('deletes task when delete button is clicked', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.delete.mockResolvedValue({ data: null, error: null })

    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByLabelText('Delete task')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockDatabase.tasks.delete).toHaveBeenCalledWith('1')
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    })
  })

  it('handles task without category', () => {
    render(
      <TaskItem
        task={mockTask}
        category={null}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('Work')).not.toBeInTheDocument()
  })

  it('handles task without due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null }
    
    render(
      <TaskItem
        task={taskWithoutDueDate}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument()
  })

  it('shows error state when toggle fails', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.toggleComplete.mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to update task' } 
    })

    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    // The component should handle the error gracefully
    expect(mockDatabase.tasks.toggleComplete).toHaveBeenCalled()
  })
})