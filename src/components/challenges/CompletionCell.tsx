import { Check } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChallengeContext } from './ChallengeContext'
import {
  getRandomMotivationalMessage,
  playSuccessSound
} from '../../utils/notifications'
import { MotivationalAlert } from '../ui/MotivationalAlert'
import { PhotoCaptureModal } from '../ui/PhotoCaptureModal'

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

  // NEW local state for dialogs
  const [showAlert, setShowAlert] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [latestCompletionId, setLatestCompletionId] = useState<string | null>(
    null
  )

  const isCompleted = (userId: string) =>
    completions.some(
      (c) =>
        c.day === dateStr &&
        c.itemId === itemId &&
        c.userId === userId &&
        c.completed
    )

  const handleToggleCompletion = async () => {
    if (!currentUser || !isInteractive) return

    const alreadyCompleted = isCompleted(currentUser.uid)
    const updated = await toggleCompletionHandler(dateStr, itemId)

    if (!alreadyCompleted && updated) {
      playSuccessSound()
      setMotivationalMessage(getRandomMotivationalMessage())
      setLatestCompletionId(updated.id ?? null)
      setShowAlert(true)
    }
  }

  const renderCells = () =>
    participants.map((participant) => {
      const isCurrent = participant.uid === currentUser?.uid
      const canToggle = isCurrent && isInteractive
      const completed = isCompleted(participant.uid)

      if (!isInteractive) {
        return (
          <div
            key={participant.uid}
            className="group relative flex size-6 items-center justify-center"
          >
            {completed && (
              <Check style={{ color: participant.color }} className="size-6" />
            )}
          </div>
        )
      }

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
            if (canToggle) handleToggleCompletion()
          }}
        >
          {completed && <Check className="size-4 text-white" />}
        </div>
      )
    })

  return (
    <>
      <MotivationalAlert
        isOpen={showAlert}
        message={motivationalMessage}
        onAttachPhoto={() => {
          setShowAlert(false)
          setShowPhotoModal(true)
        }}
        onClose={() => setShowAlert(false)}
      />

      <PhotoCaptureModal
        completionId={latestCompletionId}
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />

      <div className="flex justify-center gap-2">{renderCells()}</div>
    </>
  )
}
