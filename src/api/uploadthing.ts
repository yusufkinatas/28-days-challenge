import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
// Define file size limits and types
const MAX_FILE_SIZE = "2MB";
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  challengeImage: f({ image: { maxFileSize: MAX_FILE_SIZE } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // Check if the user is authenticated
      const auth = await import("../firebase/config").then(mod => mod.auth);
      const user = auth.currentUser;
      
      if (!user) throw new Error("Unauthorized");
      
      // Return metadata to be stored in the uploadthing database
      return { userId: user.uid };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload is complete
      console.log("Upload complete for userId:", metadata.userId);
      
      // Return the file URL and any additional data to the client
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;