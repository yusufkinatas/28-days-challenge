import { Check, CheckCircle, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getChallenge,
  getChallengeCompletions,
  getUserProfiles,
  toggleCompletion
} from '../../firebase/services'
import { CompletionRecord, FirebaseChallenge, UserProfile } from '../../types'

export function ChallengeTracker() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()

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

        // Fetch participant profiles
        const participantProfiles = await getUserProfiles(
          challengeData.participants
        )
        setParticipants(participantProfiles)

        // Fetch completion data for all participants
        let allCompletions: CompletionRecord[] = []
        for (const participantId of challengeData.participants) {
          const participantCompletions = await getChallengeCompletions(
            challengeId,
            participantId
          )
          allCompletions = [...allCompletions, ...participantCompletions]
        }
        setCompletions(allCompletions)
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

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is yesterday
  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  // Check if a date is interactive (today or yesterday)
  const isInteractiveDate = (date: Date) => {
    return isToday(date) || isYesterday(date)
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
            </div>
          )}
        </div>
      </div>

      {/* Challenge Items Legend */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-3 text-lg font-semibold">Challenge Items</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {challenge.challenges.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="shrink-0 pt-0.5">
                <span
                  className="text-xl"
                  role="img"
                  aria-label="challenge icon"
                >
                  {item.icon}
                </span>
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                {item.note && (
                  <div className="text-sm text-gray-600">{item.note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="border  p-3 text-left">Date</th>
            {challenge.challenges.map((item) => (
              <th key={item.id} className="border p-3 text-center">
                <span
                  className="text-xl"
                  role="img"
                  aria-label="challenge icon"
                >
                  {item.icon}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {challengeDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0]
            const isInteractive = isInteractiveDate(date)
            const isTodayDate = isToday(date)

            return (
              <tr key={dateStr} className={isTodayDate ? 'bg-blue-50' : ''}>
                <td
                  className={`border p-3 font-medium ${
                    isTodayDate
                      ? 'text-blue-700'
                      : isInteractive
                        ? ''
                        : 'text-gray-400'
                  }`}
                >
                  {formatDate(date)}
                </td>
                {challenge.challenges.map((item) => (
                  <td key={item.id} className="border p-3">
                    <div className="flex justify-center gap-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.uid}
                          className={`group relative flex size-5 items-center justify-center rounded border ${
                            participant.uid === currentUser?.uid &&
                            isInteractive
                              ? 'cursor-pointer hover:bg-gray-100'
                              : 'cursor-not-allowed'
                          } ${!isInteractive ? 'opacity-50' : ''}`}
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
                            if (
                              participant.uid === currentUser?.uid &&
                              isInteractive
                            ) {
                              handleToggleCompletion(dateStr, item.id)
                            }
                          }}
                          title={
                            !isInteractive
                              ? "Only today and yesterday's activities can be tracked"
                              : participant.displayName
                          }
                        >
                          {isCompleted(dateStr, item.id, participant.uid) && (
                            <Check className="size-4 text-white" />
                          )}
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {!isInteractive
                              ? "Only today and yesterday's activities can be tracked"
                              : participant.displayName}
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
  )
}
