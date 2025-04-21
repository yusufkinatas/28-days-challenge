import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlusCircle, Trash2, AlertTriangle } from 'lucide-react'
import {
  getChallenge,
  updateChallenge,
  deleteChallenge
} from '../../firebase/services'
import { ChallengeItem, FirebaseChallenge } from '../../types'
import { useAuth } from '../../context/AuthContext'

// Default emoji for new challenge items
const DEFAULT_EMOJI = '📖'

export function EditChallengeForm() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [challenge, setChallenge] = useState<FirebaseChallenge | null>(null)

  // Challenge items state
  const [challengeItems, setChallengeItems] = useState<ChallengeItem[]>([])

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return navigate('/')

      try {
        setIsLoading(true)
        const challengeData = await getChallenge(challengeId)

        if (!challengeData) {
          setError('Challenge not found')
          return
        }

        // Check if current user is the owner
        if (challengeData.createdBy !== currentUser?.uid) {
          setError('You do not have permission to edit this challenge')
          return
        }

        setChallenge(challengeData)
        setTitle(challengeData.title)
        setChallengeItems(challengeData.challenges || [])
      } catch (err) {
        console.error('Error fetching challenge:', err)
        setError('Failed to load challenge')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChallenge()
  }, [challengeId, currentUser, navigate])

  // Add new challenge item
  const addChallengeItem = () => {
    setChallengeItems([
      ...challengeItems,
      {
        id: Date.now().toString(),
        label: '',
        icon: DEFAULT_EMOJI
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

    if (!challengeId || !challenge) return

    // Validate form
    if (!title) {
      setError('Title is required')
      return
    }

    if (challengeItems.some((item) => !item.label)) {
      setError('All challenge items must have a label')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const updatedData: Partial<FirebaseChallenge> = {
        title,
        challenges: challengeItems
      }

      await updateChallenge(challengeId, updatedData)
      navigate(`/challenges/${challengeId}`)
    } catch (err) {
      console.error('Error updating challenge:', err)
      setError('Failed to update challenge')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteChallenge = async () => {
    if (!challengeId) return

    try {
      setIsDeleting(true)
      setError(null)

      await deleteChallenge(challengeId)
      navigate('/')
    } catch (err) {
      console.error('Error deleting challenge:', err)
      setError('Failed to delete challenge')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading challenge...</div>
  }

  if (error) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Challenge</h2>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          disabled={isDeleting}
        >
          <Trash2 size={18} />
          <span>Delete Challenge</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mb-4 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-red-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Confirm Deletion
              </h3>
              <p className="mt-1 text-gray-700">
                Are you sure you want to delete this challenge? This action
                cannot be undone, and all participant progress will be lost.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteChallenge}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Challenge'}
            </button>
          </div>
        </div>
      )}

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
                      Emoji
                    </label>
                    <input
                      id={`item-icon-${item.id}`}
                      type="text"
                      value={item.icon}
                      onChange={(e) =>
                        updateChallengeItem(item.id, 'icon', e.target.value)
                      }
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="Add an emoji"
                    />
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

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/challenges/${challengeId}`)}
            className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
