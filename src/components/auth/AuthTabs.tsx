import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex border-b">
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === 'login'
              ? 'border-b-2 border-blue-500 font-medium text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('login')}
        >
          Log In
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === 'register'
              ? 'border-b-2 border-blue-500 font-medium text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('register')}
        >
          Sign Up
        </button>
      </div>

      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}
