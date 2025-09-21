/**
 * @fileoverview Unit tests for CategorySidebar component
 * Tests category display, filtering, creation, and management functionality
 * AI-Generated: Sidebar navigation and category management test patterns
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySidebar } from '@/components/categories/CategorySidebar'
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
  {
    id: 'cat3',
    name: 'Shopping',
    color: '#F59E0B',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const mockTasks = [
  {
    id: '1',
    title: 'Work Task',
    category_id: 'cat1',
    completed: false,
    user_id: 'user1',
  },
  {
    id: '2',
    title: 'Personal Task',
    category_id: 'cat2',
    completed: true,
    user_id: 'user1',
  },
  {
    id: '3',
    title: 'Another Work Task',
    category_id: 'cat1',
    completed: false,
    user_id: 'user1',
  },
]

describe('CategorySidebar Component', () => {
  const mockOnCategorySelect = jest.fn()

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
    mockDatabase.tasks.getAll.mockResolvedValue({ data: mockTasks, error: null })
  })

  it('renders sidebar with categories', async () => {
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument()
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
      expect(screen.getByText('Shopping')).toBeInTheDocument()
    })
  })

  it('displays task counts for each category', async () => {
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      // Work category should show 2 tasks
      expect(screen.getByText('2')).toBeInTheDocument()
      // Personal category should show 1 task
      expect(screen.getByText('1')).toBeInTheDocument()
      // Shopping category should show 0 tasks
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('shows total task count for "All Tasks"', async () => {
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      // Should show total of 3 tasks
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('highlights selected category', async () => {
    render(
      <CategorySidebar
        selectedCategory="cat1"
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      const workCategory = screen.getByText('Work').closest('button')
      expect(workCategory).toHaveClass('bg-blue-50')
    })
  })

  it('calls onCategorySelect when category is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    const workCategory = screen.getByText('Work')
    await user.click(workCategory)

    expect(mockOnCategorySelect).toHaveBeenCalledWith('cat1')
  })

  it('calls onCategorySelect with null when "All Tasks" is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <CategorySidebar
        selectedCategory="cat1"
        onCategorySelect={mockOnCategorySelect}
      />
    )

    const allTasksButton = screen.getByText('All Tasks')
    await user.click(allTasksButton)

    expect(mockOnCategorySelect).toHaveBeenCalledWith(null)
  })

  it('opens create category dialog when add button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    const addButton = screen.getByLabelText('Add category')
    await user.click(addButton)

    expect(screen.getByText('Create Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Color')).toBeInTheDocument()
  })

  it('creates new category successfully', async () => {
    const user = userEvent.setup()
    const newCategory = {
      id: 'cat4',
      name: 'New Category',
      color: '#EF4444',
      user_id: 'user1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
    
    mockDatabase.categories.create.mockResolvedValue({ data: newCategory, error: null })
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    // Open create dialog
    const addButton = screen.getByLabelText('Add category')
    await user.click(addButton)

    // Fill out form
    await user.type(screen.getByLabelText('Name'), 'New Category')
    
    // Submit form
    const createButton = screen.getByText('Create Category')
    await user.click(createButton)

    await waitFor(() => {
      expect(mockDatabase.categories.create).toHaveBeenCalledWith({
        name: 'New Category',
        color: expect.any(String),
      })
    })
  })

  it('handles category creation error', async () => {
    const user = userEvent.setup()
    mockDatabase.categories.create.mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to create category' } 
    })
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    // Open create dialog
    const addButton = screen.getByLabelText('Add category')
    await user.click(addButton)

    // Fill out form
    await user.type(screen.getByLabelText('Name'), 'New Category')
    
    // Submit form
    const createButton = screen.getByText('Create Category')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create category')).toBeInTheDocument()
    })
  })

  it('validates category name is required', async () => {
    const user = userEvent.setup()
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    // Open create dialog
    const addButton = screen.getByLabelText('Add category')
    await user.click(addButton)

    // Submit form without name
    const createButton = screen.getByText('Create Category')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    mockDatabase.categories.getAll.mockReturnValue(new Promise(() => {})) // Never resolves
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles empty categories list', async () => {
    mockDatabase.categories.getAll.mockResolvedValue({ data: [], error: null })
    mockDatabase.tasks.getAll.mockResolvedValue({ data: [], error: null })
    
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Task count for All Tasks
    })
  })

  it('displays category colors correctly', async () => {
    render(
      <CategorySidebar
        selectedCategory={null}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await waitFor(() => {
      const workCategory = screen.getByText('Work').closest('button')
      const colorIndicator = workCategory?.querySelector('[style*="background-color"]')
      expect(colorIndicator).toHaveStyle('background-color: rgb(59, 130, 246)') // #3B82F6
    })
  })
})