/**
 * Toast notification component for displaying temporary messages to users.
 * Supports different types (success, error, warning, info) with auto-dismiss functionality.
 * 
 * @component Toast
 * @author Task Manager Team
 * @version 1.0.0
 */

'use client'

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast notification data structure
 */
export interface ToastData {
  /** Unique identifier for the toast */
  id: string
  /** Toast type determining appearance and icon */
  type: ToastType
  /** Main message to display */
  message: string
  /** Optional detailed description */
  description?: string
  /** Duration in milliseconds before auto-dismiss (0 = no auto-dismiss) */
  duration?: number
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean
}

/**
 * Props for individual Toast component
 */
interface ToastProps {
  /** Toast data */
  toast: ToastData
  /** Callback when toast is dismissed */
  onDismiss: (id: string) => void
}

/**
 * Toast configuration for different types
 */
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-400'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-400'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-400'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-400'
  }
}

/**
 * Individual Toast component
 * 
 * @param props - Toast props
 * @returns JSX element
 */
function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration])
  
  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300) // Match animation duration
  }
  
  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-4
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border
        ${config.className}
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${config.iconClassName}`} />
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">
                {toast.message}
              </p>
              
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">
                  {toast.description}
                </p>
              )}
            </div>
            
            {toast.dismissible !== false && (
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  onClick={handleDismiss}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Props for ToastContainer component
 */
interface ToastContainerProps {
  /** Array of toasts to display */
  toasts: ToastData[]
  /** Callback when a toast is dismissed */
  onDismiss: (id: string) => void
  /** Position of the toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

/**
 * Container component that manages and displays multiple toasts
 * 
 * @param props - ToastContainer props
 * @returns JSX element or null
 */
export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}: ToastContainerProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted || toasts.length === 0) {
    return null
  }
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  
  const containerElement = (
    <div
      className={`
        fixed z-50 pointer-events-none
        ${positionClasses[position]}
      `}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
  
  return createPortal(containerElement, document.body)
}

/**
 * Hook for managing toast notifications
 * 
 * @returns Object with toasts array and utility functions
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  
  /**
   * Adds a new toast notification
   * 
   * @param toast - Toast data (id will be generated if not provided)
   */
  const addToast = (toast: Omit<ToastData, 'id'> & { id?: string }) => {
    const id = toast.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = {
      duration: 5000, // Default 5 seconds
      dismissible: true,
      ...toast,
      id
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }
  
  /**
   * Removes a toast by ID
   * 
   * @param id - Toast ID to remove
   */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  /**
   * Removes all toasts
   */
  const clearToasts = () => {
    setToasts([])
  }
  
  /**
   * Convenience method for success toasts
   */
  const success = (message: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'success', message, description, ...options })
  }
  
  /**
   * Convenience method for error toasts
   */
  const error = (message: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'error', message, description, duration: 0, ...options })
  }
  
  /**
   * Convenience method for warning toasts
   */
  const warning = (message: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'warning', message, description, ...options })
  }
  
  /**
   * Convenience method for info toasts
   */
  const info = (message: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'info', message, description, ...options })
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}