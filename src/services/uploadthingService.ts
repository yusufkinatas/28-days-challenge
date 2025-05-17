import { createId } from '@paralleldrive/cuid2'

/**
 * Upload an image file to UploadThing and return the public URL.
 * Requires VITE_UPLOADTHING_API_KEY to be set in the environment.
 */
export async function uploadImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_UPLOADTHING_API_KEY
  if (!apiKey) throw new Error('UploadThing API key not configured')

  const formData = new FormData()
  formData.append('files', file, `${createId()}.${file.name.split('.').pop()}`)

  const res = await fetch('https://uploadthing.com/api/files', {
    method: 'POST',
    headers: { Authorization: apiKey },
    body: formData
  })

  if (!res.ok) {
    console.error(await res.text())
    throw new Error('Failed to upload image')
  }

  const data: { url: string } = await res.json()
  return data.url
}
