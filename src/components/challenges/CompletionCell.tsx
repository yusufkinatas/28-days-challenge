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
      {participants.map((participant) => {
        const isCurrentUser = participant.uid === currentUser?.uid
        const canToggle = isCurrentUser && isInteractive
        const completed = isCompleted(participant.uid)

        // Non-interactive date (past) - show check icon only
        if (!isInteractive) {
          return (
            <div
              key={participant.uid}
              className="group relative flex size-6 items-center justify-center"
            >
              {completed && (
                <Check
                  style={{ color: participant.color }}
                  className="size-6"
                />
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
                toggleCompletionHandler(dateStr, itemId)
              }
            }}
          >
            {completed && <Check className="size-4 text-white" />}
          </div>
        )
      })}
    </div>
  )
}
