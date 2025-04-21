import { PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createChallenge } from '../../firebase/services'
import { ChallengeItem, FirebaseChallenge } from '../../types'

const ICON_OPTIONS = [
  'Utensils',
  'Book',
  'Dumbbell',
  'GlassWater',
  'Moon',
  'Sun',
  'Heart',
  'Camera',
  'Bike',
  'Brain',
  'Bed',
  'Phone',
  'Smile'
]

export function CreateChallengeForm() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Challenge items state
  const [challengeItems, setChallengeItems] = useState<ChallengeItem[]>([
    { id: '1', label: '', icon: 'Utensils' }
  ])

  // Add new challenge item
  const addChallengeItem = () => {
    setChallengeItems([
      ...challengeItems,
      {
        id: Date.now().toString(),
        label: '',
        icon: 'Utensils'
      }
    ])
  }

  // Remove challenge item
  const removeChallengeItem = (itemId: string) => {
    if (challengeItems.length <= 1) {
      setError('You need at least one challenge item')
      return
    }

    setChallengeItems(challengeItems.filter((item) => item.id !== itemId))
  }

  // Update challenge item field
  const updateChallengeItem = (
    itemId: string,
    field: keyof ChallengeItem,
    value: string
  ) => {
    setChallengeItems(
      challengeItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title) {
      setError('Title is required')
      return
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }

    const startTimestamp = new Date(startDate).getTime()
    const endTimestamp = new Date(endDate).getTime()

    if (startTimestamp >= endTimestamp) {
      setError('End date must be after start date')
      return
    }

    if (challengeItems.some((item) => !item.label)) {
      setError('All challenge items must have a label')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const challengeData: Omit<FirebaseChallenge, 'id' | 'createdAt'> = {
        title,
        startDate: startTimestamp,
        endDate: endTimestamp,
        createdBy: '', // Will be set by the service
        participants: [], // Will be set by the service
        challenges: challengeItems
      }

      const newChallenge = await createChallenge(challengeData)
      navigate(`/challenges/${newChallenge.id}`)
    } catch (err) {
      console.error('Error creating challenge:', err)
      setError('Failed to create challenge')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Create New Challenge</h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Challenge Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="28 Days Challenge"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="start-date"
              className="mb-1 block text-sm font-medium"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="end-date"
              className="mb-1 block text-sm font-medium"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Challenge Items</h3>
            <button
              type="button"
              onClick={addChallengeItem}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <PlusCircle size={18} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {challengeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-md border p-4"
              >
                <div className="grow">
                  <div className="mb-3">
                    <label
                      htmlFor={`item-label-${item.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Item Label
                    </label>
                    <input
                      id={`item-label-${item.id}`}
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        updateChallengeItem(item.id, 'label', e.target.value)
                      }
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="e.g., Drink Water"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`item-icon-${item.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Icon
                    </label>
                    <select
                      id={`item-icon-${item.id}`}
                      value={item.icon}
                      onChange={(e) =>
                        updateChallengeItem(item.id, 'icon', e.target.value)
                      }
                      className="w-full rounded-md border px-3 py-2"
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor={`item-note-${item.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Note (Optional)
                    </label>
                    <input
                      id={`item-note-${item.id}`}
                      type="text"
                      value={item.note || ''}
                      onChange={(e) =>
                        updateChallengeItem(item.id, 'note', e.target.value)
                      }
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="e.g., 2 liters per day"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeChallengeItem(item.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Creating Challenge...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </div>
  )
}
