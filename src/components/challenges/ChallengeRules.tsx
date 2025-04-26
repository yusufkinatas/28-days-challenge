import { FirebaseChallenge } from '../../types'

type ChallengeRulesProps = {
  challenge: FirebaseChallenge
}

export function ChallengeRules({ challenge }: ChallengeRulesProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-3 text-lg font-semibold">Challenge Rules</h2>
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
    </div>
  )
}
