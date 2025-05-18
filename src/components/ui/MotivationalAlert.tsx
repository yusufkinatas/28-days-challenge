import { Dialog } from './Dialog'
import { ButtonHTMLAttributes } from 'react'

interface Props {
  isOpen: boolean
  message: string
  onAttachPhoto: () => void
  onClose: () => void
}

export function MotivationalAlert({
  isOpen,
  message,
  onAttachPhoto,
  onClose
}: Props) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Great job!">
      <p className="mb-6">{message}</p>

      <div className="flex justify-end gap-3">
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          onClick={onAttachPhoto}
        >
          Attach Photo
        </button>
        <button
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Dialog>
  )
}
