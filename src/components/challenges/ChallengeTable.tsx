import { useEffect, useRef } from 'react'
import { CompletionCell } from './CompletionCell'
import { useChallengeContext } from './ChallengeContext'

export function ChallengeTable() {
  const { challenge } = useChallengeContext()
  const todayRowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    // Scroll today's row into view after content has loaded
    if (todayRowRef.current) {
      todayRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [])

  if (!challenge) return null

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    // Convert both dates to UTC date strings (YYYY-MM-DD format)
    const todayUTC = today.toISOString().split('T')[0]
    const dateUTC = date.toISOString().split('T')[0]
    return todayUTC === dateUTC
  }

  // Check if a date is yesterday
  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    // Convert both dates to UTC date strings (YYYY-MM-DD format)
    const yesterdayUTC = yesterday.toISOString().split('T')[0]
    const dateUTC = date.toISOString().split('T')[0]
    return yesterdayUTC === dateUTC
  }

  // Check if a date is interactive (today or yesterday)
  const isInteractiveDate = (date: Date) => {
    return isToday(date) || isYesterday(date)
  }

  // Generate dates array from challenge start date to end date
  const generateChallengeDates = () => {
    const dates: Date[] = []
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)

    // Set both dates to start of day in UTC
    start.setUTCHours(0, 0, 0, 0)
    end.setUTCHours(0, 0, 0, 0)

    const current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const challengeDates = generateChallengeDates()

  // Format date as "13.4" instead of "13 April"
  const formatDate = (date: Date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1 // getMonth() is 0-indexed
    return `${day}.${month}`
  }

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 z-10 bg-white">
        <tr>
          <th className="border p-3 text-left">Date</th>
          {challenge.challenges.map((item) => (
            <th key={item.id} className="border p-3 text-center">
              <span className="text-xl" role="img" aria-label="challenge icon">
                {item.icon}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {challengeDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const isInteractive = isInteractiveDate(date)
          const isTodayDate = isToday(date)

          return (
            <tr
              key={dateStr}
              className={isTodayDate ? 'bg-blue-50' : ''}
              ref={isTodayDate ? todayRowRef : undefined}
            >
              <td
                className={`border p-3 font-medium ${
                  isTodayDate
                    ? 'text-blue-700'
                    : isInteractive
                      ? ''
                      : 'text-gray-400'
                }`}
              >
                {formatDate(date)}
              </td>
              {challenge.challenges.map((item) => (
                <td key={item.id} className="border p-3">
                  <CompletionCell
                    dateStr={dateStr}
                    itemId={item.id}
                    isInteractive={isInteractive}
                  />
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
