import { Check, CheckCircle, Copy, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  deleteChallenge,
  getChallenge,
  getChallengeCompletions,
  getUserProfiles,
  toggleCompletion
} from '../../firebase/services'
import { CompletionRecord, FirebaseChallenge, UserProfile } from '../../types'
import { getIcon } from '../../utils/icons'

export function ChallengeTracker() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState<FirebaseChallenge | null>(null)
  const [completions, setCompletions] = useState<CompletionRecord[]>([])
  const [participants, setParticipants] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

        // Fetch participant profiles
        const participantProfiles = await getUserProfiles(
          challengeData.participants
        )
        setParticipants(participantProfiles)
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

  const copyInviteLink = () => {
    const fullUrl = `${window.location.origin}/join/${challengeId}`
    navigator.clipboard.writeText(fullUrl).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
      }
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

  // Generate dates array from challenge start date to end date
  const generateChallengeDates = () => {
    const dates: Date[] = []
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)

    const current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const challengeDates = generateChallengeDates()

  // Format date as "13 April"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{challenge.title}</h1>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date(challenge.startDate).toLocaleDateString()} -{' '}
            {new Date(challenge.endDate).toLocaleDateString()}
            <span className="ml-4">
              {participants.length} participant
              {participants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {challenge.createdBy === currentUser?.uid && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={copyInviteLink}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Invite Link</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                to={`/challenges/${challengeId}/edit`}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </Link>

              <button
                onClick={async () => {
                  if (
                    confirm('Are you sure you want to delete this challenge?')
                  ) {
                    try {
                      await deleteChallenge(challengeId!)
                      navigate('/challenges')
                    } catch (error) {
                      setError('Failed to delete challenge')
                      console.error(error)
                    }
                  }
                }}
                className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-12">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border bg-gray-50 p-3 text-left">Date</th>
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
              {challengeDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0]
                return (
                  <tr key={dateStr}>
                    <td className="border p-3 font-medium">
                      {formatDate(date)}
                    </td>
                    {challenge.challenges.map((item) => (
                      <td key={item.id} className="border p-3">
                        <div className="flex justify-center gap-2">
                          {participants.map((participant) => (
                            <div
                              key={participant.uid}
                              className={`group relative flex size-5 items-center justify-center rounded border ${
                                participant.uid === currentUser?.uid
                                  ? 'cursor-pointer hover:bg-gray-100'
                                  : 'cursor-not-allowed'
                              }`}
                              style={{
                                borderColor: participant.color,
                                backgroundColor: isCompleted(
                                  dateStr,
                                  item.id,
                                  participant.uid
                                )
                                  ? participant.color
                                  : 'transparent'
                              }}
                              onClick={() => {
                                if (participant.uid === currentUser?.uid) {
                                  handleToggleCompletion(dateStr, item.id)
                                }
                              }}
                              title={participant.displayName}
                            >
                              {isCompleted(
                                dateStr,
                                item.id,
                                participant.uid
                              ) && <Check className="size-4 text-white" />}
                              <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {participant.displayName}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          {participants.map((participant) => (
            <div key={participant.uid} className="flex items-center gap-2">
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: participant.color }}
              ></div>
              <span>
                {participant.uid === currentUser?.uid
                  ? 'You'
                  : participant.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
