import React, { useState, useEffect } from 'react'
import { Camera, X, Trash2, Loader2 } from 'lucide-react'
import { useChallengeContext } from '../challenges/ChallengeContext'
import { getChallengePhotos, uploadChallengePhoto, deletePhoto } from '../../firebase/services'
import { PhotoAttachment, UserProfile } from '../../types'
import { useAuth } from '../../context/AuthContext'

export function ChallengePhotoGallery() {
  const { challenge, participants } = useChallengeContext()
  const { currentUser } = useAuth()
  const [photos, setPhotos] = useState<PhotoAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!challenge?.id) return

      try {
        setLoading(true)
        const photosData = await getChallengePhotos(challenge.id)
        setPhotos(photosData)
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError('Failed to load photos')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [challenge?.id])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !challenge?.id) return

    const file = event.target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit')
      return
    }

    try {
      setUploading(true)
      setError(null)
      
      const newPhoto = await uploadChallengePhoto(challenge.id, file)
      setPhotos((prevPhotos) => [newPhoto, ...prevPhotos])
      
      // Reset the input
      event.target.value = ''
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      await deletePhoto(photoId)
      setPhotos((prevPhotos) => prevPhotos.filter(photo => photo.id !== photoId))
      
      // Close modal if the deleted photo is currently selected
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null)
      }
    } catch (err) {
      console.error('Error deleting photo:', err)
      setError('Failed to delete photo')
    }
  }

  const getUserName = (userId: string): string => {
    const participant = participants.find(p => p.uid === userId)
    return participant?.displayName || 'Unknown User'
  }

  const canDeletePhoto = (photo: PhotoAttachment): boolean => {
    if (!currentUser) return false
    
    // User can delete their own photos or if they're the challenge creator
    return photo.uploadedBy === currentUser.uid || 
           (challenge?.createdBy === currentUser.uid)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading photos...</span>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Photo Gallery</h3>
        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Camera size={16} />
          <span>Upload Photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mb-4 flex items-center rounded-md bg-blue-50 p-3 text-sm text-blue-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading photo...
        </div>
      )}

      {photos.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-8 text-center text-gray-500">
          <Camera className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p>No photos have been shared yet</p>
          <p className="mt-1 text-sm">Be the first to share a photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-100"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={`Uploaded by ${getUserName(photo.uploadedBy)}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-20"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
                <div className="font-medium">{getUserName(photo.uploadedBy)}</div>
                <div>{formatDate(photo.uploadedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-h-[90vh] max-w-4xl rounded-lg bg-white p-1">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1 shadow-md"
            >
              <X size={20} />
            </button>
            
            {canDeletePhoto(selectedPhoto) && (
              <button
                onClick={() => selectedPhoto.id && handleDeletePhoto(selectedPhoto.id)}
                className="absolute -left-3 -top-3 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
              >
                <Trash2 size={20} />
              </button>
            )}
            
            <img
              src={selectedPhoto.url}
              alt={`Uploaded by ${getUserName(selectedPhoto.uploadedBy)}`}
              className="max-h-[80vh] rounded"
            />
            
            <div className="mt-2 p-2">
              <div className="text-sm font-medium">
                Uploaded by {getUserName(selectedPhoto.uploadedBy)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(selectedPhoto.uploadedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}