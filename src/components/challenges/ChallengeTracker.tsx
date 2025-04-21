import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, UserPlus } from 'lucide-react'
import {
  getChallenge,
  getChallengeCompletions,
  toggleCompletion
} from '../../firebase/services'
import { CompletionRecord, FirebaseChallenge } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getIcon } from '../../utils/icons'

interface ParticipantDisplay {
  uid: string
  name: string
  color: string
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export function ChallengeTracker() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()

  const [challenge, setChallenge] = useState<FirebaseChallenge | null>(null)
  const [completions, setCompletions] = useState<CompletionRecord[]>([])
  const [participants, setParticipants] = useState<ParticipantDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!challengeId || !currentUser) return

      try {
        setLoading(true)

        // Fetch challenge data
        const challengeData = await getChallenge(challengeId)
        if (!challengeData) {
          setError('Challenge not found')
          return
        }

        setChallenge(challengeData)

        // Fetch completion data for current user
        const completionData = await getChallengeCompletions(
          challengeId,
          currentUser.uid
        )
        setCompletions(completionData)

        // TODO: Fetch participant data
        // For now, use dummy data
        setParticipants([
          { uid: currentUser.uid, name: 'You', color: '#4f46e5' }
          // Other participants would be fetched here
        ])
      } catch (err) {
        console.error('Error fetching challenge data:', err)
        setError('Failed to load challenge data')
      } finally {
        setLoading(false)
      }
    }

    fetchChallengeData()
  }, [challengeId, currentUser])

  const handleToggleCompletion = async (day: string, itemId: string) => {
    if (!challengeId || !currentUser || !challenge) return

    try {
      const completionData = {
        challengeId,
        userId: currentUser.uid,
        day,
        itemId,
        completed: false // Will be toggled in the service
      }

      const updatedCompletion = await toggleCompletion(completionData)

      // Update local state
      setCompletions((prev) => {
        const exists = prev.some(
          (c) =>
            c.challengeId === updatedCompletion.challengeId &&
            c.day === updatedCompletion.day &&
            c.itemId === updatedCompletion.itemId &&
            c.userId === updatedCompletion.userId
        )

        if (exists) {
          return prev.map((c) =>
            c.challengeId === updatedCompletion.challengeId &&
            c.day === updatedCompletion.day &&
            c.itemId === updatedCompletion.itemId &&
            c.userId === updatedCompletion.userId
              ? updatedCompletion
              : c
          )
        } else {
          return [...prev, updatedCompletion]
        }
      })
    } catch (err) {
      console.error('Error toggling completion:', err)
      setError('Failed to update completion status')
    }
  }

  const isCompleted = (
    day: string,
    itemId: string,
    userId: string = currentUser?.uid || ''
  ) => {
    return completions.some(
      (c) =>
        c.day === day &&
        c.itemId === itemId &&
        c.userId === userId &&
        c.completed
    )
  }

  if (loading) {
    return <div className="py-8 text-center">Loading challenge...</div>
  }

  if (error || !challenge) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error || 'Failed to load challenge'}
      </div>
    )
  }

  // Get the current week
  const now = new Date()
  const startDate = new Date(challenge.startDate)
  const daysDifference = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const currentWeek = Math.floor(daysDifference / 7) + 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-gray-600">{challenge.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date(challenge.startDate).toLocaleDateString()} -{' '}
            {new Date(challenge.endDate).toLocaleDateString()}
          </div>

          {challenge.createdBy === currentUser?.uid && (
            <button className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
              <UserPlus size={16} />
              <span>Invite Participants</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-xl font-bold">Week {currentWeek}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border bg-gray-50 p-3 text-left">Day</th>
                {challenge.challenges.map((item) => (
                  <th
                    key={item.id}
                    className="border bg-gray-50 p-3 text-center"
                  >
                    <div>
                      {getIcon(item.icon, { className: 'mx-auto size-5' })}
                      <div className="mt-1 text-xs">{item.label}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day}>
                  <td className="border p-3 font-medium">{day}</td>
                  {challenge.challenges.map((item) => (
                    <td key={item.id} className="border p-3">
                      <div className="flex justify-center gap-2">
                        {participants.map((participant) => (
                          <div
                            key={participant.uid}
                            className="group relative flex size-5 cursor-pointer items-center justify-center rounded border hover:bg-gray-100"
                            style={{
                              borderColor: participant.color,
                              backgroundColor: isCompleted(
                                day,
                                item.id,
                                participant.uid
                              )
                                ? participant.color
                                : 'transparent'
                            }}
                            onClick={() => {
                              if (participant.uid === currentUser?.uid) {
                                handleToggleCompletion(day, item.id)
                              }
                            }}
                            title={participant.name}
                          >
                            {isCompleted(day, item.id, participant.uid) && (
                              <Check className="size-4 text-white" />
                            )}
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {participant.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-6">
          {participants.map((participant) => (
            <div key={participant.uid} className="flex items-center gap-2">
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: participant.color }}
              ></div>
              <span>{participant.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
