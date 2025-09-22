# Task Manager Application

A modern, full-featured task management application built with Next.js, TypeScript, and Supabase. This project demonstrates a complete CRUD application with authentication, real-time updates, and a responsive UI.

## 🚀 Features Implemented

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks with full CRUD operations
- **Task Organization**: Categorize tasks with custom categories and color coding
- **Priority System**: Set task priorities (low, medium, high) with visual indicators
- **Due Dates & Reminders**: Schedule tasks with due dates and reminder notifications
- **Task Completion**: Mark tasks as complete/incomplete with visual feedback

### User Authentication
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **Protected Routes**: Route protection ensuring authenticated access
- **User Sessions**: Persistent login sessions with automatic token refresh
- **User Context**: Global authentication state management

### User Interface
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Modern UI Components**: Built with Radix UI and styled with Tailwind CSS
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: ARIA labels and keyboard navigation support
- **Dark/Light Theme**: Consistent styling across the application

### Data Management
- **Real-time Updates**: Live data synchronization with Supabase
- **Category Management**: Create and manage task categories
- **Data Validation**: Form validation with Zod schemas
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during data operations

## 🛠 Technologies Used

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Real-time Subscriptions** - Live data updates

### Development Tools
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting and formatting
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## 📋 Setup and Run Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Environment Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database schema by running the SQL commands in `database/schema.sql` in your Supabase SQL editor.

### Running the Application
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Create an account or sign in to start managing your tasks

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## 🤖 AI Usage Notes

This project was built with significant AI assistance using Claude (Anthropic) through the Trae AI IDE. The AI was instrumental in:

### Tools and Contexts Used
- **Code Generation**: AI generated complete components, hooks, and utility functions
- **Architecture Decisions**: AI helped design the project structure and data flow
- **Testing Strategy**: AI created comprehensive test suites with Jest and React Testing Library
- **Error Handling**: AI implemented robust error handling patterns throughout the application
- **Type Safety**: AI ensured proper TypeScript typing across all components
- **Database Design**: AI designed the PostgreSQL schema and Supabase integration

### AI-Assisted Development Process
1. **Planning**: AI helped break down requirements into manageable tasks
2. **Implementation**: AI wrote most of the code with human oversight and direction
3. **Testing**: AI created unit tests and integration tests for all components
4. **Debugging**: AI identified and fixed issues in real-time
5. **Documentation**: AI generated comprehensive code comments and this README

### Human Oversight
While AI generated most of the code, human oversight was crucial for:
- Project requirements and feature specifications
- Design decisions and user experience considerations
- Code review and quality assurance
- Final testing and validation

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── auth/              # Authentication components
│   ├── categories/        # Category management
│   ├── tasks/             # Task management components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions and configurations
└── __tests__/             # Test files

__tests__/
├── components/            # Component tests
├── integration/           # Integration tests
└── utils/                 # Test utilities
```

## 🧪 Testing

The application includes comprehensive testing:
- **Unit Tests**: Individual component testing
- **Integration Tests**: Feature workflow testing
- **Mocking**: Supabase and external dependencies mocked
- **Coverage**: High test coverage across all components

Run tests with:
```bash
npm test
```

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

Make sure to set up environment variables in your deployment platform.

## 📝 License

This project is for educational purposes as part of a capstone project.
