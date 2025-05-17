import React, { useState } from 'react';
import { X, Image, Trash2 } from 'lucide-react';
import { Uploader } from '../../utils/uploadthing';

interface PhotoUploadModalProps {
  onClose: () => void;
  onPhotoUploaded: (photoUrl: string) => void;
  onOpenCamera: () => void;
  existingPhotoUrl?: string;
  onDeletePhoto?: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  onClose,
  onPhotoUploaded,
  onOpenCamera,
  existingPhotoUrl,
  onDeletePhoto
}) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-medium">
            {existingPhotoUrl ? 'Challenge Photo' : 'Add Photo'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
          {existingPhotoUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={existingPhotoUrl}
                alt="Challenge"
                className="mb-4 max-h-64 w-full object-contain"
              />
              {onDeletePhoto && (
                <button
                  onClick={onDeletePhoto}
                  className="mt-2 flex items-center rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Photo
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Uploader
                  endpoint="challengeImage"
                  onUploadProgress={() => setIsUploading(true)}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    if (res && res.length > 0) {
                      onPhotoUploaded(res[0].url);
                    }
                  }}
                  onUploadError={(error) => {
                    setIsUploading(false);
                    console.error('Upload error:', error);
                    alert('Upload failed: ' + error.message);
                  }}
                  className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600"
                />
              </div>

              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 flex-shrink text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={onOpenCamera}
                className="mt-4 flex w-full items-center justify-center rounded-md bg-gray-100 px-4 py-3 font-medium hover:bg-gray-200"
                disabled={isUploading}
              >
                <Image className="mr-2 size-5" />
                Take a Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};