import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react'
import { Toast, ToastType } from '../utils/notifications'

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (
    message: string,
    type: ToastType = 'success',
    duration: number = 3000
  ) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type,
      duration
    }
    setToasts((prevToasts) => [...prevToasts, newToast])
  }

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  // Auto-remove toasts after their duration
  useEffect(() => {
    if (toasts.length > 0) {
      const timers = toasts.map((toast) => {
        return setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
      })

      return () => {
        timers.forEach((timer) => clearTimeout(timer))
      }
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-fade-in rounded-md p-3 shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
            style={{ minWidth: '250px' }}
          >
            <div className="flex items-center justify-between">
              <p>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-white"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
