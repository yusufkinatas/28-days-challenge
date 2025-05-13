import { useState } from 'react'
import { MinecraftClone } from './MinecraftClone'
import { Dialog } from '../ui/Dialog'

export function MinecraftModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        <span>Play Minecraft Clone</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={closeModal}
        title="Minecraft Clone"
      >
        <div className="w-full max-w-4xl h-[70vh]">
          <MinecraftClone />
        </div>
      </Dialog>
    </>
  )
}