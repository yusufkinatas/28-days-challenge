import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getChallenge,
  addParticipantToChallenge
} from '../../firebase/services'
import { FirebaseChallenge } from '../../types'
import { ArrowRight, ArrowLeft, Clock, UserCheck } from 'lucide-react'

export function JoinChallenge() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState<FirebaseChallenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId || !currentUser) return

      try {
        setLoading(true)
        const challengeData = await getChallenge(challengeId)

        if (!challengeData) {
          setError('Challenge not found')
          return
        }

        // Check if user is already a participant
        if (challengeData.participants.includes(currentUser.uid)) {
          setAlreadyJoined(true)
          setChallenge(challengeData)
          return
        }

        setChallenge(challengeData)
      } catch (err) {
        console.error('Error fetching challenge:', err)
        setError('Failed to load challenge')
      } finally {
        setLoading(false)
      }
    }

    fetchChallenge()
  }, [challengeId, currentUser])

  const handleJoinChallenge = async () => {
    if (!challengeId || !currentUser || !challenge) return

    try {
      setJoining(true)
      setError(null)

      await addParticipantToChallenge(challengeId, currentUser.uid)
      setSuccess(true)

      // Redirect to the challenge page after a short delay
      setTimeout(() => {
        navigate(`/challenges/${challengeId}`)
      }, 2000)
    } catch (err: Error | unknown) {
      console.error('Error joining challenge:', err)
      // Get more specific error message if available
      if (err instanceof Error && err.message) {
        setError(err.message)
      } else {
        setError('Failed to join challenge')
      }
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Clock className="mx-auto mb-4 size-12 animate-pulse text-blue-600" />
        <p>Loading challenge details...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-400 bg-green-50 p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-green-700">
          Successfully Joined!
        </h2>
        <p className="mb-6 text-gray-700">
          You have successfully joined the challenge.
        </p>
        <p className="text-gray-600">Redirecting to challenge page...</p>
      </div>
    )
  }

  if (alreadyJoined && challenge) {
    return (
      <div className="rounded-lg border border-blue-400 bg-blue-50 p-6 text-center">
        <UserCheck className="mx-auto mb-4 size-12 text-blue-600" />
        <h2 className="mb-4 text-2xl font-bold text-blue-700">
          Already Joined
        </h2>
        <p className="mb-6 text-gray-700">
          You are already participating in this challenge: {challenge.title}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to={`/challenges/${challengeId}`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <span>View Challenge</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-red-700">Error</h2>
        <p className="mb-6 text-gray-700">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          <span>Back to Challenges</span>
        </Link>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="rounded-lg border border-red-400 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-red-700">
          Challenge Not Found
        </h2>
        <p className="mb-6 text-gray-700">
          We could not find the challenge you are looking for.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          <span>Back to Challenges</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Join Challenge</h2>

      <div className="mb-6">
        <h3 className="mb-2 text-xl font-semibold">{challenge.title}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>
            {new Date(challenge.startDate).toLocaleDateString()} -{' '}
            {new Date(challenge.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-2 font-medium">Challenge Items:</h4>
        <ul className="list-inside list-disc space-y-1 text-gray-600">
          {challenge.challenges.map((item) => (
            <li key={item.id}>
              {item.label}{' '}
              {item.note && (
                <span className="text-sm text-gray-500">({item.note})</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleJoinChallenge}
          disabled={joining}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {joining ? 'Joining...' : 'Join Challenge'}
          {!joining && <ArrowRight size={16} />}
        </button>

        <Link to="/" className="text-gray-600 hover:text-gray-800">
          Cancel
        </Link>
      </div>
    </div>
  )
}
