import { useState } from 'react'
import { Check } from 'lucide-react'
import { challenges } from './challanges'
import { Participant } from '../types'
import { participants } from './participants'

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export function WeeklyTracker({ weekNumber }: { weekNumber: number }) {
  // This would be replaced with real data from backend
  const [completions, setCompletions] = useState<Record<string, boolean>>({})

  const toggleCompletion = (
    day: string,
    challengeIndex: number,
    participant: Participant
  ) => {
    const key = `${day}-${challengeIndex}-${participant.email}`
    setCompletions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isCompleted = (
    day: string,
    challengeIndex: number,
    participant: Participant
  ) => {
    const key = `${day}-${challengeIndex}-${participant.email}`
    return completions[key] || false
  }

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-xl font-bold">Week {weekNumber}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border bg-gray-50 p-3 text-left">Day</th>
              {challenges.map((challenge, index) => (
                <th key={index} className="border bg-gray-50 p-3 text-center">
                  <div>
                    <challenge.icon className="mx-auto size-5" />
                    <div className="mt-1 text-xs">{challenge.label}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr key={index}>
                <td className="border p-3 font-medium">{day}</td>
                {challenges.map((_, challengeIndex) => (
                  <td key={challengeIndex} className="border p-3">
                    <div className="flex justify-center gap-2">
                      {participants.map((participant: Participant) => (
                        <div
                          key={participant.email}
                          className="group relative flex size-5 cursor-pointer items-center justify-center rounded border hover:bg-gray-100"
                          style={{
                            borderColor: participant.color,
                            backgroundColor: isCompleted(
                              day,
                              challengeIndex,
                              participant
                            )
                              ? participant.color
                              : 'transparent'
                          }}
                          onClick={() =>
                            toggleCompletion(day, challengeIndex, participant)
                          }
                          title={participant.name}
                        >
                          {isCompleted(day, challengeIndex, participant) && (
                            <Check className="size-4 text-white" />
                          )}
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {participant.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-6">
        {participants.map((participant: Participant) => (
          <div key={participant.email} className="flex items-center gap-2">
            <div
              className="size-4 rounded-full"
              style={{ backgroundColor: participant.color }}
            ></div>
            <span>{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
