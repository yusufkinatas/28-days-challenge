import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing";

// Create the uploadthing components with our file router
export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();