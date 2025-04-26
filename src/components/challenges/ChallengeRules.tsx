import { useChallengeContext } from './ChallengeContext'

export function ChallengeRules() {
  const { challenge } = useChallengeContext()

  if (!challenge) return null

  return (
    <div className="flex flex-col gap-3">
      {challenge.challenges.map((item) => (
        <div key={item.id} className="flex items-start gap-2">
          <div className="shrink-0 pt-0.5">
            <span className="text-xl" role="img" aria-label="challenge icon">
              {item.icon}
            </span>
          </div>
          <div>
            <div className="font-medium">{item.label}</div>
            {item.note && (
              <div className="text-sm text-gray-600">{item.note}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
