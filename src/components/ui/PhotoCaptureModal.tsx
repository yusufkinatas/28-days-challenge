import { ChangeEvent, useEffect, useState } from 'react'
import { Dialog } from './Dialog'
import { useUploadThing } from '../../utils/uploadthing'
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
  const { addToast } = useToast()

  const { startUpload, isUploading } = useUploadThing('files')

  const resetState = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  useEffect(() => {
    if (!isOpen) resetState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) return
    if (!completionId) {
      addToast('Missing completion ID - cannot upload photo', 'error', 4000)
      return
    }

    try {
      const apiKey = import.meta.env.VITE_UPLOADTHING_API_KEY
      const res = await startUpload([file], {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headers: { Authorization: apiKey } as any
      })
      const url = res?.[0]?.url
      if (!url) throw new Error('No URL returned from UploadThing')

      await updateCompletionPhoto(completionId, url)
      addToast('Photo uploaded successfully', 'success', 3000)
      onClose()
    } catch (err) {
      console.error(err)
      addToast('Failed to upload image', 'error', 4000)
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
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
