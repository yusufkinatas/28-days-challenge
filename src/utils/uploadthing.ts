import { generateReactHelpers } from '@uploadthing/react'

/**
 * We do not have a strongly-typed backend router in this repo, but
 * UploadThing’s React helpers still need a generic parameter.
 * Using `any` preserves runtime behaviour while keeping TypeScript happy.
 *
 * If/when you add a real router (e.g. via a serverless function),
 * replace the `any` with your `FileRouter` type:
 *
 *   import type { OurFileRouter } from '../path/to/router'
 *   generateReactHelpers<OurFileRouter>()
 */
export const { useUploadThing, uploadFiles } = generateReactHelpers<any>()
