import { useState, useEffect } from 'react'
import { PhotoAttachment } from '../../types'
import {
  getChallengePhotos,
  uploadChallengePhoto
} from '../../firebase/services'
import { useChallengeContext } from './ChallengeContext'
import { auth } from '../../firebase/config'

export function ChallengePhotoGallery() {
  const { challenge } = useChallengeContext()
  const [photos, setPhotos] = useState<PhotoAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isParticipant = challenge?.participants.includes(
    auth.currentUser?.uid || ''
  )

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!challenge?.id) return

      try {
        setLoading(true)
        const challengePhotos = await getChallengePhotos(challenge.id)
        setPhotos(challengePhotos)
        setError(null)
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError('Failed to load photos')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [challenge?.id])

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!challenge?.id || !event.target.files?.length) return

    const file = event.target.files[0]

    try {
      setUploading(true)
      const newPhoto = await uploadChallengePhoto(challenge.id, file)
      setPhotos([newPhoto, ...photos])
      setError(null)
      // Reset the file input
      event.target.value = ''
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Photo Gallery</h2>
        {isParticipant && (
          <div className="relative">
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor="photo-upload"
              className={`inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                uploading ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No photos yet. Be the first to share a photo!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-lg"
            >
              <img
                src={photo.url}
                alt="Challenge photo"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
