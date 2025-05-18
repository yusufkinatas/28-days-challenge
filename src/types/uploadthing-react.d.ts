/**
 * Minimal ambient declaration for the `@uploadthing/react` package
 * so that TypeScript can compile even when the real library is not
 * installed.  The real package provides many more features – this file
 * only covers the handful of symbols that are referenced in the codebase.
 *
 * Remove this file once `@uploadthing/react` (and its types) is added
 * to the project dependencies.
 */
declare module '@uploadthing/react' {
  import * as React from 'react'

  /**
   * Common props shared by the UploadThing React components.
   * All properties are purposely typed as `any`/widened to keep
   * the declaration generic.
   */
  export interface UploadThingProps {
    /**
     * Name of the UploadThing endpoint defined in the backend.
     */
    endpoint: string
    /**
     * Called after all files have been uploaded successfully.
     */
    onClientUploadComplete?: (res: any) => void
    /**
     * Called if the upload fails.
     */
    onUploadError?: (error: Error) => void
    /**
     * Called right after the upload starts.
     */
    onUploadBegin?: () => void
  }

  /**
   * Pre-bundled React components.
   * The real components provide lots of additional generics and helpers;
   * here they are simplified to keep the stub minimal.
   */
  export const UploadButton: React.FC<UploadThingProps>
  export const UploadDropzone: React.FC<UploadThingProps>

  /**
   * Upload-related helper hooks/functions borrowed from the real library.
   * These are intentionally typed loosely – just enough for the rest of the
   * codebase to compile without the actual implementation installed.
   */
  export type UseUploadThing = (
    endpoint: string,
    opts?: Record<string, unknown>
  ) => {
    /** Start an upload for a list of files. */
    startUpload: (files: File[], opts?: Record<string, unknown>) => Promise<any>
    /** Current upload progress in the range 0-100. */
    isUploading: boolean
    /** Any error caught during the upload. */
    error: Error | null
  }

  /**
   * Direct helper to upload an array of files without using the React hook.
   */
  export type UploadFiles = (
    endpoint: string,
    files: File[],
    opts?: Record<string, unknown>
  ) => Promise<any>

  /**
   * Helper to create pre-typed versions of the components & hooks.
   */
  export function generateReactHelpers(): {
    UploadButton: React.FC<UploadThingProps>
    UploadDropzone: React.FC<UploadThingProps>
    Uploader: React.FC<UploadThingProps>
    useUploadThing: UseUploadThing
    uploadFiles: UploadFiles
  }

  /* Re-export the loose helper types so callers can import them directly. */
  export const useUploadThing: UseUploadThing
  export const uploadFiles: UploadFiles
}
