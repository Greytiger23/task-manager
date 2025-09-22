/**
 * Tests for TaskList component
 * Covers task loading, filtering, sorting, CRUD operations, and error handling
 */

import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '@/components/tasks/TaskList'
import { database } from '@/lib/database'
import { 
  render, 
  mockTask, 
  mockCategory, 
  mockDatabaseResponses, 
  mockSupabaseError 
} from '../../../__tests__/utils/test-utils'

// Mock database
jest.mock('@/lib/database', () => ({
  database: {
    tasks: {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      delete: jest.fn(),
    },
    categories: {
      getAll: jest.fn(),
    },
  },
}))

const mockDatabase = database as jest.Mocked<typeof database>

// Mock TaskForm component
jest.mock('@/components/tasks/TaskForm', () => ({
  TaskForm: ({ onSave, onCancel }: { onSave: (task: any) => void; onCancel: () => void }) => (
    <div data-testid="task-form">
      <button onClick={() => onSave(mockTask)}>Save Task</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDatabase.tasks.getAll.mockResolvedValue(mockDatabaseResponses.tasks.getAll())
    mockDatabase.categories.getAll.mockResolvedValue(mockDatabaseResponses.categories.getAll())
  })

  it('should render task list with tasks', async () => {
    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
      expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    })
  })

  it('should load tasks and categories on mount', async () => {
    render(<TaskList />)

    await waitFor(() => {
      expect(mockDatabase.tasks.getAll).toHaveBeenCalled()
      expect(mockDatabase.categories.getAll).toHaveBeenCalled()
    })
  })

  it('should load tasks by category when selectedCategoryId is provided', async () => {
    const categoryId = 'test-category-id'
    render(<TaskList selectedCategoryId={categoryId} />)

    await waitFor(() => {
      expect(mockDatabase.tasks.getByCategory).toHaveBeenCalledWith(categoryId, expect.any(String))
    })
  })

  it('should show loading state initially', () => {
    render(<TaskList />)
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('should show empty state when no tasks', async () => {
    mockDatabase.tasks.getAll.mockResolvedValue({ data: [], error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first task to get started')).toBeInTheDocument()
    })
  })

  it('should open task form when Add Task button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
    })

    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })

  it('should filter tasks by search term', async () => {
    const user = userEvent.setup()
    const tasks = [
      { ...mockTask, id: '1', title: 'Buy groceries' },
      { ...mockTask, id: '2', title: 'Walk the dog' },
    ]
    mockDatabase.tasks.getAll.mockResolvedValue({ data: tasks, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search tasks...')
    await user.type(searchInput, 'groceries')

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument()
    })
  })

  it('should filter tasks by status', async () => {
    const user = userEvent.setup()
    const tasks = [
      { ...mockTask, id: '1', title: 'Pending task', completed: false },
      { ...mockTask, id: '2', title: 'Completed task', completed: true },
    ]
    mockDatabase.tasks.getAll.mockResolvedValue({ data: tasks, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('Pending task')).toBeInTheDocument()
      expect(screen.getByText('Completed task')).toBeInTheDocument()
    })

    // Filter by pending tasks
    const statusFilter = screen.getByDisplayValue('All')
    await user.click(statusFilter)
    
    const pendingOption = screen.getByText('Pending')
    await user.click(pendingOption)

    await waitFor(() => {
      expect(screen.getByText('Pending task')).toBeInTheDocument()
      expect(screen.queryByText('Completed task')).not.toBeInTheDocument()
    })
  })

  it('should sort tasks by different criteria', async () => {
    const user = userEvent.setup()
    const tasks = [
      { 
        ...mockTask, 
        id: '1', 
        title: 'High priority', 
        priority: 'high' as const,
        created_at: '2024-01-01T00:00:00Z'
      },
      { 
        ...mockTask, 
        id: '2', 
        title: 'Low priority', 
        priority: 'low' as const,
        created_at: '2024-01-02T00:00:00Z'
      },
    ]
    mockDatabase.tasks.getAll.mockResolvedValue({ data: tasks, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('High priority')).toBeInTheDocument()
      expect(screen.getByText('Low priority')).toBeInTheDocument()
    })

    // Sort by priority
    const sortFilter = screen.getByDisplayValue('Recent')
    await user.click(sortFilter)
    
    const priorityOption = screen.getByText('Priority')
    await user.click(priorityOption)

    // High priority should come first
    const taskElements = screen.getAllByText(/priority/)
    expect(taskElements[0]).toHaveTextContent('High priority')
  })

  it('should handle task deletion', async () => {
    const user = userEvent.setup()
    mockDatabase.tasks.delete.mockResolvedValue({ data: null, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    })

    // Find and click delete button (assuming TaskItem has delete functionality)
    const taskItem = screen.getByText(mockTask.title).closest('[data-testid="task-item"]') || 
                    screen.getByText(mockTask.title).closest('div')
    
    if (taskItem) {
      const deleteButton = within(taskItem as HTMLElement).getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockDatabase.tasks.delete).toHaveBeenCalledWith(mockTask.id, expect.any(String))
      })
    }
  })

  it('should handle task save from form', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
    })

    // Open form
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Save task from form
    const saveButton = screen.getByText('Save Task')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument()
    })
  })

  it('should handle form cancellation', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
    })

    // Open form
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Cancel form
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument()
    })
  })

  it('should handle task loading error', async () => {
    mockDatabase.tasks.getAll.mockResolvedValue({
      data: null,
      error: mockSupabaseError
    })

    render(<TaskList />)

    await waitFor(() => {
      expect(mockDatabase.tasks.getAll).toHaveBeenCalled()
    })
  })

  it('should handle category loading error', async () => {
    mockDatabase.categories.getAll.mockResolvedValue({
      data: null,
      error: mockSupabaseError
    })

    render(<TaskList />)

    await waitFor(() => {
      expect(mockDatabase.categories.getAll).toHaveBeenCalled()
    })
  })

  it('should show category name in header when selectedCategoryId is provided', async () => {
    const categoryId = 'test-category-id'
    render(<TaskList selectedCategoryId={categoryId} />)

    await waitFor(() => {
      expect(screen.getByText(mockCategory.name)).toBeInTheDocument()
    })
  })

  it('should show correct task count', async () => {
    const tasks = [
      { ...mockTask, id: '1' },
      { ...mockTask, id: '2' },
      { ...mockTask, id: '3' },
    ]
    mockDatabase.tasks.getAll.mockResolvedValue({ data: tasks, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('3 tasks')).toBeInTheDocument()
    })
  })

  it('should show singular task count for one task', async () => {
    const tasks = [{ ...mockTask, id: '1' }]
    mockDatabase.tasks.getAll.mockResolvedValue({ data: tasks, error: null })

    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText('1 task')).toBeInTheDocument()
    })
  })

  it('should show no tasks found message when search has no results', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    await waitFor(() => {
      expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search tasks...')
    await user.type(searchInput, 'nonexistent task')

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
    })
  })
})