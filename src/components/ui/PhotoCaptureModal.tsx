import { useState, ChangeEvent } from 'react'
import { Dialog } from './Dialog'
import { uploadImage } from '../../services/uploadthingService'
import { updateCompletionPhoto } from '../../firebase/services'
import { useToast } from '../../context/ToastContext'

interface Props {
  completionId: string | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoCaptureModal({ completionId, isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file || !completionId) return
    try {
      setUploading(true)
      const url = await uploadImage(file)
      await updateCompletionPhoto(completionId, url)
      addToast('Photo uploaded successfully', 'success', 3000)
      onClose()
    } catch (e) {
      console.error(e)
      addToast('Failed to upload image', 'error', 4000)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Attach photo">
      <div className="space-y-4">
        {!preview && (
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        )}

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mx-auto max-h-60 rounded object-contain"
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
