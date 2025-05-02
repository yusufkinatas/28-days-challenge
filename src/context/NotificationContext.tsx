import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the types for our notifications
export type NotificationType = 'success' | 'info' | 'warning' | 'error'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, type?: NotificationType, duration?: number) => void
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (
    message: string,
    type: NotificationType = 'success',
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    const newNotification: Notification = {
      id,
      message,
      type,
      duration
    }
    
    setNotifications((prev) => [...prev, newNotification])
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }
    
    return id
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const value = {
    notifications,
    showNotification,
    dismissNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

