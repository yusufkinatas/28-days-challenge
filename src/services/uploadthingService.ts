import { uploadFiles } from '../utils/uploadthing'

// cuid2 was replaced: milliseconds-timestamp is sufficient for unique temp filenames.

/**
 * Upload an image file to UploadThing and return the public URL.
 * Requires VITE_UPLOADTHING_API_KEY to be set in the environment.
 */
export async function uploadImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_UPLOADTHING_API_KEY
  if (!apiKey) throw new Error('UploadThing API key not configured')

  // Rename file so every upload has a unique filename (timestamp-based).
  const ext = file.name.split('.').pop() ?? 'jpg'
  const stampedFile = new File([file], `${Date.now()}.${ext}`, {
    type: file.type
  })

  // `uploadFiles` returns an array with info about the uploaded files.
  // The endpoint slug does not matter when talking to the public API.
  // We still forward the API-key via Authorization header.
  const res = await uploadFiles('files', [stampedFile], {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: { Authorization: apiKey } as any
  })

  const url = (res as { url: string }[])[0]?.url
  if (!url) throw new Error('Failed to upload image')

  return url
}
