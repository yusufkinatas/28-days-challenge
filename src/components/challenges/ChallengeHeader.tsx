import { Award, CheckCircle, Copy, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChallengeContext } from './ChallengeContext'
import { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { ChallengeRules } from './ChallengeRules'
import { Leaderboard } from './Leaderboard'

export function ChallengeHeader() {
  const { challenge, participants, copied, copyInviteLinkHandler } =
    useChallengeContext()
  const { currentUser } = useAuth()
  const [rulesOpen, setRulesOpen] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold">{challenge?.title}</h1>
        {challenge?.createdBy === currentUser?.uid && (
          <button
            onClick={copyInviteLinkHandler}
            className="flex items-center text-gray-500 hover:text-gray-700"
            title="Copy invite link"
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          </button>
        )}
        <button
          onClick={() => setRulesOpen(true)}
          className="text-gray-500 hover:text-gray-700"
          title="View challenge rules"
        >
          <Info size={20} />
        </button>
        <button
          onClick={() => setLeaderboardOpen(true)}
          className="text-gray-500 hover:text-gray-700"
          title="View leaderboard"
        >
          <Award size={20} />
        </button>
      </div>

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

      <Dialog
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="Challenge Rules"
      >
        <ChallengeRules />
      </Dialog>

      <Dialog
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        title="Leaderboard"
      >
        <Leaderboard />
      </Dialog>
    </div>
  )
}
