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
   * Helper to create pre-typed versions of the components.
   * The generic type parameter is ignored in this stub.
   */
  export function generateReactHelpers<TRouter = any>(): {
    UploadButton: React.FC<UploadThingProps>
    UploadDropzone: React.FC<UploadThingProps>
    Uploader: React.FC<UploadThingProps>
  }
}
