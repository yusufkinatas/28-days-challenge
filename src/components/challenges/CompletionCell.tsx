import { Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChallengeContext } from './ChallengeContext'

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

  const isCompleted = (userId: string) => {
    return completions.some(
      (c) =>
        c.day === dateStr &&
        c.itemId === itemId &&
        c.userId === userId &&
        c.completed
    )
  }

  return (
    <div className="flex justify-center gap-2">
      {participants.map((participant) => (
        <div
          key={participant.uid}
          className={`group relative flex size-5 items-center justify-center rounded border ${
            participant.uid === currentUser?.uid && isInteractive
              ? 'cursor-pointer hover:bg-gray-100'
              : 'cursor-not-allowed'
          } ${!isInteractive ? 'opacity-50' : ''}`}
          style={{
            borderColor: participant.color,
            backgroundColor: isCompleted(participant.uid)
              ? participant.color
              : 'transparent'
          }}
          onClick={() => {
            if (participant.uid === currentUser?.uid && isInteractive) {
              toggleCompletionHandler(dateStr, itemId)
            }
          }}
        >
          {isCompleted(participant.uid) && (
            <Check className="size-4 text-white" />
          )}
        </div>
      ))}
    </div>
  )
}
