import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CameraModal } from '../components/ui/CameraModal';
import { PhotoUploadModal } from '../components/ui/PhotoUploadModal';
import { Uploader } from '@uploadthing/react';

interface PhotoContextType {
  showPhotoUploadModal: (
    onPhotoUploaded: (photoUrl: string) => void,
    existingPhotoUrl?: string,
    onDeletePhoto?: (() => void) | null
  ) => void;
  closePhotoModals: () => void;
}

const PhotoContext = createContext<PhotoContextType | null>(null);

export const usePhoto = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  return context;
};

interface PhotoProviderProps {
  children: ReactNode;
}

export function PhotoProvider({ children }: PhotoProviderProps) {
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [photoUploadCallback, setPhotoUploadCallback] = useState<
    ((photoUrl: string) => void) | null
  >(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | undefined>(
    undefined
  );
  const [deletePhotoCallback, setDeletePhotoCallback] = useState<
    (() => void) | null
  >(null);

  const showPhotoUploadModal = (
    onPhotoUploaded: (photoUrl: string) => void,
    existingPhotoUrl?: string,
    onDeletePhoto?: (() => void) | null
  ) => {
    setPhotoUploadCallback(() => onPhotoUploaded);
    setExistingPhotoUrl(existingPhotoUrl);
    setDeletePhotoCallback(onDeletePhoto);
    setIsPhotoUploadModalOpen(true);
  };

  const closePhotoModals = () => {
    setIsPhotoUploadModalOpen(false);
    setIsCameraModalOpen(false);
  };

  const handlePhotoUploaded = (photoUrl: string) => {
    if (photoUploadCallback) {
      photoUploadCallback(photoUrl);
    }
    closePhotoModals();
  };

  const openCameraModal = () => {
    setIsPhotoUploadModalOpen(false);
    setIsCameraModalOpen(true);
  };

  const handlePhotoCapture = async (imageSrc: string) => {
    try {
      // Convert data URL to blob
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      
      // Create a File object
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      
      // Create a mock event with the file
      const mockEvent = {
        target: {
          files: [file]
        }
      };
      
      // Create a file list manually
      const fileList = Object.create(mockEvent.target.files);
      fileList.item = (index: number) => fileList[index];
      
      // Use uploadthing's uploader programmatically
      // This is a placeholder - we'll use the actual uploadthing endpoint
      const formData = new FormData();
      formData.append("file", file);
      
      // Show loading state
      // In a real implementation, we'd use the uploadthing client
      // For now, simulate an upload
      setTimeout(() => {
        // For demo purposes, just use the data URL as the "uploaded" URL
        // In production, you'd use the actual URL from uploadthing
        handlePhotoUploaded(imageSrc);
      }, 1000);
    } catch (error) {
      console.error("Error uploading captured photo:", error);
      alert("Failed to upload photo. Please try again.");
    }
  };

  return (
    <PhotoContext.Provider value={{ showPhotoUploadModal, closePhotoModals }}>
      {children}
      
      {isPhotoUploadModalOpen && (
        <PhotoUploadModal
          onClose={closePhotoModals}
          onPhotoUploaded={handlePhotoUploaded}
          onOpenCamera={openCameraModal}
          existingPhotoUrl={existingPhotoUrl}
          onDeletePhoto={deletePhotoCallback || undefined}
        />
      )}
      
      {isCameraModalOpen && (
        <CameraModal
          onClose={closePhotoModals}
          onCapture={handlePhotoCapture}
        />
      )}
    </PhotoContext.Provider>
  );
}