import { useEffect, useState } from 'react'
import { getUserChallenges, deleteChallenge } from '../../firebase/services'
import { FirebaseChallenge } from '../../types'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function ChallengeList() {
  // Define the array of dad jokes
  const dadJokes = [
    'I told my wife she was drawing her eyebrows too high. She looked surprised.',
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
    "Why don't scientists trust atoms? Because they make up everything.",
    "I would tell you a joke about pizza, but it's too cheesy.",
    'What do you call a fake noodle? An impasta.'
  ]

  // Add state for tracking the current joke index
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0)

  const [challenges, setChallenges] = useState<FirebaseChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Add handler to cycle to the next joke
  const handleNextJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % dadJokes.length)
  }

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true)
        const userChallenges = await getUserChallenges()
        setChallenges(userChallenges)
      } catch (err) {
        console.error('Error fetching challenges:', err)
        setError('Failed to load challenges')
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [])

  const handleDeleteChallenge = async (
    e: React.MouseEvent,
    challengeId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (confirm('Are you sure you want to delete this challenge?')) {
      try {
        setDeleteLoading(challengeId)
        await deleteChallenge(challengeId)
        setChallenges((prev) => prev.filter((c) => c.id !== challengeId))
      } catch (error) {
        console.error('Failed to delete challenge:', error)
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent, challengeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/challenges/${challengeId}/edit`)
  }

  if (loading) {
    return <div className="py-8 text-center">Loading challenges...</div>
  }

  if (error) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Challenges</h2>
        <Link
          to="/challenges/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          <span>New Challenge</span>
        </Link>
      </div>

      {/* Dad joke section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <button
          onClick={handleNextJoke}
          className="mb-3 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Get Dad Joke
        </button>
        <p className="text-lg italic text-gray-700">
          {dadJokes[currentJokeIndex]}
        </p>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <p className="mb-4 text-gray-600">
            You do not have any challenges yet.
          </p>
          <Link
            to="/challenges/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            <span>Create Your First Challenge</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              to={`/challenges/${challenge.id}`}
              className="group relative block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-2 text-xl font-bold">{challenge.title}</h3>

              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} -{' '}
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
                <span>{challenge.participants.length} participants</span>
              </div>

              {challenge.createdBy === currentUser?.uid && challenge.id && (
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditClick(e, challenge.id as string)}
                    className="rounded bg-blue-600 p-1 text-white hover:bg-blue-700"
                    aria-label="Edit challenge"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) =>
                      handleDeleteChallenge(e, challenge.id as string)
                    }
                    className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                    aria-label="Delete challenge"
                    disabled={deleteLoading === challenge.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
