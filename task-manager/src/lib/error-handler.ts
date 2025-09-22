/**
 * Centralized error handling utilities for the Task Manager application.
 * Provides consistent error processing, logging, and user-friendly messaging.
 * 
 * @module error-handler
 * @author Task Manager Team
 * @version 1.0.0
 */

import { PostgrestError } from '@supabase/supabase-js'

/**
 * Standard error types used throughout the application
 */
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured error interface for consistent error handling
 */
export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error | PostgrestError
  code?: string
  details?: Record<string, string | number | boolean | null>
}

/**
 * User-friendly error messages mapped to error types
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]: 'Please sign in to continue',
  [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action',
  [ErrorType.VALIDATION]: 'Please check your input and try again',
  [ErrorType.NETWORK]: 'Connection error. Please check your internet connection',
  [ErrorType.DATABASE]: 'Something went wrong. Please try again later',
  [ErrorType.NOT_FOUND]: 'The requested item could not be found',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again'
}

/**
 * Processes Supabase/PostgreSQL errors and converts them to AppError format
 * 
 * @param error - The original error from Supabase
 * @param context - Additional context about where the error occurred
 * @returns Structured AppError object
 */
export function handleSupabaseError(
  error: PostgrestError | Error | null,
  context?: string
): AppError {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: ERROR_MESSAGES[ErrorType.UNKNOWN]
    }
  }

  // Handle PostgrestError (Supabase database errors)
  if ('code' in error && 'message' in error) {
    const postgrestError = error as PostgrestError
    
    switch (postgrestError.code) {
      case 'PGRST116': // No rows returned
        return {
          type: ErrorType.NOT_FOUND,
          message: ERROR_MESSAGES[ErrorType.NOT_FOUND],
          originalError: error,
          code: postgrestError.code
        }
      
      case '23505': // Unique constraint violation
        return {
          type: ErrorType.VALIDATION,
          message: 'This item already exists',
          originalError: error,
          code: postgrestError.code
        }
      
      case '23503': // Foreign key constraint violation
        return {
          type: ErrorType.VALIDATION,
          message: 'Cannot delete item that is being used elsewhere',
          originalError: error,
          code: postgrestError.code
        }
      
      case '42501': // Insufficient privilege
        return {
          type: ErrorType.AUTHORIZATION,
          message: ERROR_MESSAGES[ErrorType.AUTHORIZATION],
          originalError: error,
          code: postgrestError.code
        }
      
      default:
        return {
          type: ErrorType.DATABASE,
          message: ERROR_MESSAGES[ErrorType.DATABASE],
          originalError: error,
          code: postgrestError.code,
          details: { context: context || null }
        }
    }
  }

  // Handle network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES[ErrorType.NETWORK],
      originalError: error
    }
  }

  // Handle authentication errors
  if (error.message?.includes('auth') || error.message?.includes('token')) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: ERROR_MESSAGES[ErrorType.AUTHENTICATION],
      originalError: error
    }
  }

  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: ERROR_MESSAGES[ErrorType.UNKNOWN],
    originalError: error,
    details: { context: context || null }
  }
}

/**
 * Logs errors to console in development and to external service in production
 * 
 * @param error - The AppError to log
 * @param userId - Optional user ID for context
 */
export function logError(error: AppError, userId?: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    type: error.type,
    message: error.message,
    code: error.code,
    userId,
    details: error.details,
    stack: error.originalError?.stack
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData)
  } else {
    // In production, you might want to send to an error tracking service
    // like Sentry, LogRocket, or similar
    console.error('Error:', error.message)
  }
}

/**
 * Creates a user-friendly error message from an AppError
 * 
 * @param error - The AppError to format
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: AppError): string {
  return error.message || ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ErrorType.UNKNOWN]
}

/**
 * Utility function to safely execute async operations with error handling
 * 
 * @param operation - The async operation to execute
 * @param context - Context description for error logging
 * @returns Promise resolving to result or AppError
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (err) {
    const error = handleSupabaseError(err as Error, context)
    logError(error)
    return { data: null, error }
  }
}

/**
 * Validates required fields and returns validation errors
 * 
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @returns AppError if validation fails, null if valid
 */
export function validateRequiredFields(
  data: Record<string, string | number | boolean | null | undefined>,
  requiredFields: string[]
): AppError | null {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  )

  if (missingFields.length > 0) {
    return {
      type: ErrorType.VALIDATION,
      message: `Please fill in all required fields: ${missingFields.join(', ')}`,
      details: { missingFields: missingFields.join(', ') }
    }
  }

  return null
}