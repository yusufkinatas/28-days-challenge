import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode
} from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import {
  getChallenge,
  getChallengeCompletions,
  updateChallenge,
  toggleCompletion
} from '../../firebase/services'
import { CompletionRecord, FirebaseChallenge, UserProfile } from '../../types'
import { getRandomMessage } from '../../utils/motivationalMessages'

interface ChallengeContextType {
  challenge: FirebaseChallenge | null
  participants: UserProfile[]
  completions: CompletionRecord[]
  loading: boolean
  error: string | null
  copied: boolean
  toggleCompletionHandler: (day: string, itemId: string) => Promise<void>
  copyInviteLinkHandler: () => void
}

const ChallengeContext = createContext<ChallengeContextType | null>(null)

export const useChallengeContext = () => {
  const context = useContext(ChallengeContext)
  if (!context) {
    throw new Error(
      'useChallengeContext must be used within a ChallengeProvider'
    )
  }
  return context
}

interface ChallengeProviderProps {
  children: ReactNode
}

export function ChallengeProvider({ children }: ChallengeProviderProps) {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { currentUser } = useAuth()
  const { showNotification } = useNotification()

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

  const toggleCompletionHandler = async (day: string, itemId: string) => {
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

      // Show motivational notification if the user completed an item
      if (updatedCompletion.completed) {
        // Play success sound
        
        // Show motivational notification
        const motivationalMessage = getRandomMessage()
        showNotification(motivationalMessage, 'success', 3000)
      }
    } catch (err) {
      console.error('Error toggling completion:', err)
      setError('Failed to update completion status')
      
      // Play error sound and show error notification
      showNotification('Failed to update completion status', 'error')
    }
  }

  const handleToggleCompletion = async (dayIndex: number, itemIndex: number) => {
    if (!challenge || !currentUser) return

    try {
      const updatedCompletion = await toggleCompletion(
        challengeId!,
        currentUser.uid,
        dayIndex,
        itemIndex
      )

      // Update the completions state
      setCompletions((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.dayIndex === dayIndex && c.itemIndex === itemIndex
        )

        if (existingIndex >= 0) {
          const newCompletions = [...prev]
          newCompletions[existingIndex] = updatedCompletion
          return newCompletions
        } else {
          return [...prev, updatedCompletion]
        }
      })

      // Show motivational notification if the user completed an item
      if (updatedCompletion.completed) {
        // Show motivational notification
        const motivationalMessage = getRandomMessage()
        showNotification(motivationalMessage, 'success', 3000)
      }
    } catch (err) {
      console.error('Error toggling completion:', err)
      setError('Failed to update completion status')
      
      // Show error notification
      showNotification('Failed to update completion status', 'error')
    }
  }

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${challengeId}`
    
    navigator.clipboard.writeText(inviteLink).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        
        // Show notification
        showNotification('Invitation link copied to clipboard!', 'info', 2000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
        
        // Show error notification
        showNotification('Failed to copy invitation link', 'error')
      }
    )
  }

  const copyInviteLinkHandler = () => {
    if (!challengeId) return

    const fullUrl = `${window.location.origin}/join/${challengeId}`
    // Store the invite link in localStorage
    localStorage.setItem('challengeInviteLink', fullUrl)
    navigator.clipboard.writeText(fullUrl).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        
        // Play notification sound
        
        // Show notification
        showNotification('Invitation link copied to clipboard!', 'info', 2000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
        
        // Show error notification
        showNotification('Failed to copy invitation link', 'error')
      }
    )
  }

  const value = {
    challenge,
    participants,
    completions,
    loading,
    error,
    copied,
    toggleCompletionHandler,
    copyInviteLinkHandler
  }

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  )
}
