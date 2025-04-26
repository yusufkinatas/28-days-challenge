import { CheckCircle, Copy } from 'lucide-react'
import { User } from 'firebase/auth'
import { FirebaseChallenge, UserProfile } from '../../types'

type ChallengeHeaderProps = {
  challenge: FirebaseChallenge
  participants: UserProfile[]
  currentUser: User | null
  onCopyInviteLink: () => void
  copied: boolean
}

export function ChallengeHeader({
  challenge,
  participants,
  currentUser,
  onCopyInviteLink,
  copied
}: ChallengeHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-3xl font-bold">{challenge.title}</h1>

      <div className="mb-4 flex flex-wrap gap-6">
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

      <div className="mt-4 flex items-center justify-between">
        {challenge.createdBy === currentUser?.uid && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={onCopyInviteLink}
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
  )
}
