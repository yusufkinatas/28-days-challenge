import { ChallengeProvider, useChallengeContext } from './ChallengeContext'
import { ChallengeHeader } from './ChallengeHeader'
import { ChallengeTable } from './ChallengeTable'

function ChallengeContent() {
  const { loading, error, challenge } = useChallengeContext()

  if (loading) {
    return <div className="py-8 text-center">Loading challenge...</div>
  }

  if (error || !challenge) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error || 'Failed to load challenge'}
      </div>
    )
  }

  return (
    <div>
      <ChallengeHeader />
      <ChallengeTable />
    </div>
  )
}

export function ChallengeTracker() {
  return (
    <ChallengeProvider>
      <ChallengeContent />
    </ChallengeProvider>
  )
}
