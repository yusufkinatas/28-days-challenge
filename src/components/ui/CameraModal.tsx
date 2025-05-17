import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, Check } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-medium">Take a Photo</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
          {capturedImage ? (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="h-64 w-full object-cover"
              />
            </div>
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="h-64 w-full object-cover"
              videoConstraints={{
                facingMode: "environment"
              }}
            />
          )}

          <div className="mt-4 flex justify-center space-x-4">
            {capturedImage ? (
              <>
                <button
                  onClick={retake}
                  className="flex items-center rounded-md bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
                >
                  Retake
                </button>
                <button
                  onClick={confirm}
                  className="flex items-center rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  <Check className="mr-2 size-4" />
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={capture}
                className="flex items-center rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
              >
                <Camera className="mr-2 size-4" />
                Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};