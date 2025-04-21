import { WeeklyTracker } from './weekly-tracker'
import { challenges } from './challanges'

export default function App() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-12 text-center text-3xl font-bold md:text-4xl">
        28 DAY CHALLENGE
      </h1>

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {challenges.map((challenge, index) => (
          <div key={index} className="flex items-center gap-3">
            <challenge.icon className="size-6" />
            <div>
              <span className="font-medium">{challenge.label}</span>
              {challenge.note && (
                <span className="ml-2 text-sm text-gray-500">
                  {challenge.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {[1, 2, 3, 4].map((weekNumber) => (
        <WeeklyTracker key={weekNumber} weekNumber={weekNumber} />
      ))}
    </div>
  )
}
