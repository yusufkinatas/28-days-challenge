import React, { createContext, useContext, ReactNode, useState } from 'react'

type NotificationType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'motivational'

interface NotificationOptions {
  type?: NotificationType
  duration?: number
  soundId?: string
}

interface Notification {
  id: string
  message: string
  type: NotificationType
  soundId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, options?: NotificationOptions) => void
  hideNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    )
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({
  children
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (
    message: string,
    options: NotificationOptions = {}
  ) => {
    const id = Date.now().toString()
    const notification: Notification = {
      id,
      message,
      type: options.type || 'info',
      soundId: options.soundId
    }

    // Add notification to the state
    setNotifications((prev) => [...prev, notification])

    // Play sound if specified
    if (options.soundId) {
      // Logic to play sound would go here
      // This could be implemented with HTML Audio API or a library
      const audio = new Audio(`/sounds/${options.soundId}.mp3`)
      audio.play().catch((err) => console.error('Failed to play sound:', err))
    }

    // Auto-remove notification after duration
    const duration = options.duration || 3000
    setTimeout(() => {
      hideNotification(id)
    }, duration)

    return id
  }

  const hideNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    )
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, hideNotification }}
    >
      {children}
      <div className="notifications-container fixed right-4 top-4 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification mb-2 rounded p-4 shadow-md ${
              notification.type === 'motivational'
                ? 'border-l-4 border-yellow-500 bg-yellow-100 text-yellow-700'
                : notification.type === 'success'
                  ? 'border-l-4 border-green-500 bg-green-100 text-green-700'
                  : notification.type === 'error'
                    ? 'border-l-4 border-red-500 bg-red-100 text-red-700'
                    : notification.type === 'warning'
                      ? 'border-l-4 border-orange-500 bg-orange-100 text-orange-700'
                      : 'border-l-4 border-blue-500 bg-blue-100 text-blue-700'
            }`}
          >
            {notification.message}
            <button
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => hideNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
