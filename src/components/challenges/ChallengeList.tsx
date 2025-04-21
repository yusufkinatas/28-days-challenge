import { useEffect, useState } from 'react'
import { getUserChallenges } from '../../firebase/services'
import { FirebaseChallenge } from '../../types'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

export function ChallengeList() {
  const [challenges, setChallenges] = useState<FirebaseChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true)
        const userChallenges = await getUserChallenges()
        setChallenges(userChallenges)
      } catch (err) {
        console.error('Error fetching challenges:', err)
        setError('Failed to load challenges')
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [])

  if (loading) {
    return <div className="py-8 text-center">Loading challenges...</div>
  }

  if (error) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Challenges</h2>
        <Link
          to="/challenges/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          <span>New Challenge</span>
        </Link>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <p className="mb-4 text-gray-600">
            You do not have any challenges yet.
          </p>
          <Link
            to="/challenges/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            <span>Create Your First Challenge</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              to={`/challenges/${challenge.id}`}
              className="block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-2 text-xl font-bold">{challenge.title}</h3>

              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} -{' '}
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
                <span>{challenge.participants.length} participants</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
