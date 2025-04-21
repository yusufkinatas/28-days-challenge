import { CheckSquare } from 'lucide-react'
import { challenges } from './challanges'

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
                  <challenge.icon className="mx-auto size-5" />
                </th>
              ))}
              <th className="border bg-gray-50 p-3 text-center">
                <CheckSquare className="mx-auto size-5" />
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr key={index}>
                <td className="border p-3 font-medium">{day}</td>
                {challenges.map((_, colIndex) => (
                  <td key={colIndex} className="border p-3"></td>
                ))}
                <td className="border p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
