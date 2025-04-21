import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getChallenge,
  addParticipantToChallenge
} from '../../firebase/services'
import { Clock } from 'lucide-react'

export function JoinChallenge() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const joinChallenge = async () => {
      if (!challengeId || !currentUser) return

      try {
        const challengeData = await getChallenge(challengeId)

        if (!challengeData) {
          setError('Challenge not found')
          return
        }

        // Check if user is already a participant
        if (challengeData.participants.includes(currentUser.uid)) {
          // Already joined, just redirect
          localStorage.removeItem('challengeInviteLink')
          navigate(`/challenges/${challengeId}`)
          return
        }

        // Join the challenge
        await addParticipantToChallenge(challengeId, currentUser.uid)

        // Clear the stored invite link from localStorage
        localStorage.removeItem('challengeInviteLink')

        // Redirect to the challenge page immediately
        navigate(`/challenges/${challengeId}`)
      } catch (err) {
        console.error('Error joining challenge:', err)
        if (err instanceof Error && err.message) {
          setError(err.message)
        } else {
          setError('Failed to join challenge')
        }
      }
    }

    joinChallenge()
  }, [challengeId, currentUser, navigate])

  if (error) {
    return (
      <div className="rounded-lg border border-red-400 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-red-700">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="py-8 text-center">
      <Clock className="mx-auto mb-4 size-12 animate-pulse text-blue-600" />
      <p>Joining challenge...</p>
    </div>
  )
}
