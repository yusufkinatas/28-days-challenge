import { Check, Camera } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChallengeContext } from './ChallengeContext'
import { useToast } from '../../context/ToastContext'
import { usePhoto } from '../../context/PhotoContext'
import { getRandomMotivationalMessage, playSuccessSound } from '../../utils/notifications'
import { getCompletionById, updateCompletionPhoto } from '../../firebase/services'

type CompletionCellProps = {
  dateStr: string
  itemId: string
  isInteractive: boolean
}

export function CompletionCell({
  dateStr,
  itemId,
  isInteractive
}: CompletionCellProps) {
  const { participants, completions, toggleCompletionHandler } =
    useChallengeContext()
  const { currentUser } = useAuth()
  const { addToast } = useToast()
  const { showPhotoUploadModal } = usePhoto()
  const [showAttachPhotoToast, setShowAttachPhotoToast] = useState(false)

  const isCompleted = (userId: string) => {
    return completions.some(
      (c) =>
        c.day === dateStr &&
        c.itemId === itemId &&
        c.userId === userId &&
        c.completed
    )
  }

  const getCompletionRecord = (userId: string) => {
    return completions.find(
      (c) =>
        c.day === dateStr &&
        c.itemId === itemId &&
        c.userId === userId &&
        c.completed
    )
  }

  const handleToggleCompletion = async () => {
    if (!currentUser || !isInteractive) return
    
    // Get current completion status
    const currentlyCompleted = isCompleted(currentUser.uid)
    
    // Toggle completion
    await toggleCompletionHandler(dateStr, itemId)
    
    // Only show message and play sound when marking as completed (not when uncompleting)
    if (!currentlyCompleted) {
      // Play success sound
      playSuccessSound()
      
      // Show motivational message with photo attachment option
      const message = getRandomMotivationalMessage()
      
      // Show a custom toast with attach photo button
      addToast(message, 'success', 5000)
      
      // Set state to show the attach photo toast
      setShowAttachPhotoToast(true)
      
      // Hide the attach photo toast after 5 seconds
      setTimeout(() => {
        setShowAttachPhotoToast(false)
      }, 5000)
    }
  }

  const handleAttachPhoto = async () => {
    if (!currentUser) return
    
    // Get the completion record
    const completion = getCompletionRecord(currentUser.uid)
    if (!completion || !completion.id) return
    
    // Check if there's already a photo
    const existingPhoto = completion.photoUrl
    
    // Function to handle photo upload
    const onPhotoUploaded = async (photoUrl: string) => {
      try {
        if (completion.id) {
          await updateCompletionPhoto(completion.id, photoUrl)
          addToast('Photo attached successfully!', 'success')
        }
      } catch (error) {
        console.error('Error attaching photo:', error)
        addToast('Failed to attach photo', 'error')
      }
    }
    
    // Function to handle photo deletion
    const onDeletePhoto = async () => {
      try {
        if (completion.id) {
          await updateCompletionPhoto(completion.id, null)
          addToast('Photo removed successfully', 'success')
        }
      } catch (error) {
        console.error('Error removing photo:', error)
        addToast('Failed to remove photo', 'error')
      }
    }
    
    // Show the photo upload modal
    showPhotoUploadModal(onPhotoUploaded, existingPhoto, onDeletePhoto)
    
    // Hide the attach photo toast
    setShowAttachPhotoToast(false)
  }

  return (
    <>
      <div className="flex justify-center gap-2">
        {participants.map((participant) => {
          const isCurrentUser = participant.uid === currentUser?.uid
          const canToggle = isCurrentUser && isInteractive
          const completed = isCompleted(participant.uid)
          const completion = getCompletionRecord(participant.uid)
          const hasPhoto = completion?.photoUrl

          // Non-interactive date (past) - show check icon only
          if (!isInteractive) {
            return (
              <div
                key={participant.uid}
                className="group relative flex size-6 items-center justify-center"
                onClick={() => {
                  // Allow viewing photos even for past dates
                  if (isCurrentUser && hasPhoto && completion?.id) {
                    showPhotoUploadModal(
                      () => {}, // No-op for view-only
                      completion.photoUrl,
                      null // No delete option for past dates
                    )
                  }
                }}
              >
                {completed && (
                  <div className="relative">
                    <Check
                      style={{ color: participant.color }}
                      className="size-6"
                    />
                    {hasPhoto && (
                      <div 
                        className="absolute -right-1 -top-1 size-2 rounded-full bg-blue-500"
                        title="Has photo attachment"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          }

          // Interactive date (today/yesterday) - show box with background color
          return (
            <div
              key={participant.uid}
              className={`group relative flex size-5 items-center justify-center rounded border ${
                canToggle
                  ? 'cursor-pointer hover:bg-gray-100'
                  : 'cursor-not-allowed'
              }`}
              style={{
                opacity: canToggle ? 1 : 0.5,
                borderColor: participant.color,
                backgroundColor: completed ? participant.color : 'transparent'
              }}
              onClick={() => {
                if (canToggle) {
                  if (completed && hasPhoto) {
                    // If completed and has photo, show the photo
                    if (completion?.id) {
                      showPhotoUploadModal(
                        async (photoUrl) => {
                          if (completion.id) {
                            await updateCompletionPhoto(completion.id, photoUrl)
                          }
                        },
                        completion.photoUrl,
                        async () => {
                          if (completion.id) {
                            await updateCompletionPhoto(completion.id, null)
                          }
                        }
                      )
                    }
                  } else {
                    // Otherwise toggle completion
                    handleToggleCompletion()
                  }
                }
              }}
            >
              {completed && (
                <div className="relative">
                  <Check className="size-4 text-white" />
                  {hasPhoto && (
                    <div 
                      className="absolute -right-1 -top-1 size-2 rounded-full bg-blue-500"
                      title="Has photo attachment"
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Attach Photo Toast */}
      {showAttachPhotoToast && currentUser && isCompleted(currentUser.uid) && (
        <div className="fixed bottom-20 right-4 z-50 animate-fade-in rounded-md bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={handleAttachPhoto}
              className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Camera className="mr-2 size-4" />
              Attach a photo
            </button>
            <button
              onClick={() => setShowAttachPhotoToast(false)}
              className="ml-2 text-gray-500"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
