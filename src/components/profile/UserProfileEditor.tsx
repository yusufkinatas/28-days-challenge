import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile, updateUserProfile } from '../../firebase/services'
import { Save, User, Palette } from 'lucide-react'

// Predefined color options for users to choose from
const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Blue', value: '#6366f1' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' }
]

export function UserProfileEditor() {
  const { currentUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        const userProfile = await getUserProfile(currentUser.uid)
        if (userProfile) {
          setDisplayName(userProfile.displayName)
          setSelectedColor(userProfile.color)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load your profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      setError(null)
      setSuccessMessage(null)
      setSaving(true)

      // Validate inputs
      if (!displayName.trim()) {
        setError('Display name cannot be empty')
        return
      }

      const updatedProfile = await updateUserProfile({
        displayName: displayName.trim(),
        color: selectedColor
      })

      if (updatedProfile) {
        setSuccessMessage('Profile updated successfully')

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-4 text-center">Loading your profile...</div>
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center">
        <h2 className="text-xl font-bold">Your Profile</h2>
        <div
          className="ml-3 size-6 rounded-full"
          style={{ backgroundColor: selectedColor }}
        ></div>
      </div>

      <p className="mb-6 text-sm text-gray-500">{currentUser?.email}</p>
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded border border-green-400 bg-green-50 px-4 py-3 text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="display-name"
            className="mb-1 block text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <User size={16} />
              Display Name
            </span>
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="How other participants will see you"
          />
          <p className="mt-1 text-xs text-gray-500">
            This name will be visible to other participants in your challenges
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <span className="flex items-center gap-2">
              <Palette size={16} />
              Your Color
            </span>
          </label>
          <div className="grid grid-cols-5 gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`size-10 rounded-full border-2 ${
                  selectedColor === color.value
                    ? 'border-gray-900'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This color will identify your checkboxes in challenges
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {saving ? 'Saving...' : 'Save Profile'}
          {!saving && <Save size={16} />}
        </button>
      </form>
    </div>
  )
}
