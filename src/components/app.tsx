import {
  Utensils,
  GlassWater,
  Dumbbell,
  Wine,
  BookOpen,
  Camera,
  CheckSquare
} from 'lucide-react'

function WeeklyTracker({ weekNumber }: { weekNumber: number }) {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-xl font-bold">Week {weekNumber}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border bg-gray-50 p-3 text-left">Day</th>
              <th className="border bg-gray-50 p-3 text-center">
                <Utensils className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <GlassWater className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <Dumbbell className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <Wine className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <BookOpen className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <Camera className="mx-auto size-5" />
              </th>
              <th className="border bg-gray-50 p-3 text-center">
                <CheckSquare className="mx-auto size-5" />
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr key={index}>
                <td className="border p-3 font-medium">{day}</td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-12 text-center text-3xl font-bold md:text-4xl">
        28 DAY CHALLENGE
      </h1>

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <Utensils className="size-6" />
          <div>
            <span className="font-medium">Eat well</span>
            <span className="ml-2 text-sm text-gray-500">
              (1 cheat per week)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlassWater className="size-6" />
          <span className="font-medium">2 liters of water</span>
        </div>

        <div className="flex items-center gap-3">
          <Dumbbell className="size-6" />
          <span className="font-medium">45 min workout</span>
        </div>

        <div className="flex items-center gap-3">
          <Wine className="size-6" />
          <div>
            <span className="font-medium">No drink/smoke</span>
            <span className="ml-2 text-sm text-gray-500">
              (1 cheat per week)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <BookOpen className="size-6" />
          <span className="font-medium">Read 10+ pages</span>
        </div>

        <div className="flex items-center gap-3">
          <Camera className="size-6" />
          <span className="font-medium">Progress photo</span>
        </div>
      </div>

      <WeeklyTracker weekNumber={1} />
      <WeeklyTracker weekNumber={2} />
      <WeeklyTracker weekNumber={3} />
      <WeeklyTracker weekNumber={4} />
    </div>
  )
}
