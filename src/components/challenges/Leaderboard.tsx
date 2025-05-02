import { useMemo } from 'react'
import { useChallengeContext } from './ChallengeContext'

export function Leaderboard() {
  const { completions, participants } = useChallengeContext()

  const leaderboardData = useMemo(() => {
    // Calculate completion stats for each participant
    const stats = participants.map((participant) => {
      const userCompletions = completions.filter(
        (completion) =>
          completion.userId === participant.uid && completion.completed
      )

      return {
        user: participant,
        completedCount: userCompletions.length,
        lastCompletedAt:
          userCompletions.length > 0
            ? Math.max(...userCompletions.map((c) => c.completedAt))
            : 0
      }
    })

    // Sort by completion count (desc) and then by last completion time (desc) for tie-breakers
    return stats.sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount
      }
      return b.lastCompletedAt - a.lastCompletedAt
    })
  }, [completions, participants])

  return (
    <div className="overflow-hidden">
      <div className="mb-4">
        <p className="text-gray-600">
          See how you and other participants are progressing in this challenge!
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="pb-2 text-left">Rank</th>
              <th className="pb-2 text-left">Participant</th>
              <th className="pb-2 text-right">Completed</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item, index) => (
              <tr key={item.user.uid} className="border-b">
                <td className="py-3 pr-4 text-center">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full"
                      style={{ backgroundColor: item.user.color }}
                    ></div>
                    <span>{item.user.displayName}</span>
                  </div>
                </td>
                <td className="py-3 text-right">{item.completedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
