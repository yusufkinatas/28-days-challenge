import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getChallenge,
  getChallengeCompletions,
  getUserProfiles,
  toggleCompletion
} from '../../firebase/services'
import { CompletionRecord, FirebaseChallenge, UserProfile } from '../../types'
import { ChallengeHeader } from './ChallengeHeader'
import { ChallengeRules } from './ChallengeRules'
import { ChallengeTable } from './ChallengeTable'

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
        day, // already in YYYY-MM-DD UTC format
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

  const copyInviteLink = () => {
    const fullUrl = `${window.location.origin}/join/${challengeId}`
    // Store the invite link in localStorage
    localStorage.setItem('challengeInviteLink', fullUrl)
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

  return (
    <div>
      <ChallengeHeader
        challenge={challenge}
        participants={participants}
        currentUser={currentUser}
        onCopyInviteLink={copyInviteLink}
        copied={copied}
      />

      <ChallengeRules challenge={challenge} />

      <ChallengeTable
        challenge={challenge}
        participants={participants}
        currentUser={currentUser}
        completions={completions}
        onToggleCompletion={handleToggleCompletion}
      />
    </div>
  )
}
