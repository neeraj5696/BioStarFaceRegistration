import React, { useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const BioStarUrl= import.meta.env.VITE_BIOSTAR_URL

const PhotoCapture = () => {
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchParams] = useSearchParams();

  const webcamRef = React.useRef<Webcam>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(atob(data));
        setEmployeeId(decodedData.employeeId);
        setEmail(decodedData.email);
        
        const expiryTime = new Date(decodedData.expiryTime);
        if (new Date() > expiryTime) {
          setCameraError('Verification link has expired. Please request a new one.');
          return;
        }
      } catch (error) {
        console.error('Invalid verification data:', error);
        console.error('Failed to parse verification token:', { data, error: error instanceof Error ? error.message : String(error) });
        setCameraError('Invalid verification link.');
      }
    }
  }, [searchParams]);

  const handleCameraError = useCallback(() => {
    setCameraError('Camera access denied. Please allow camera permission and refresh the page.');
    setWebcamEnabled(false);
  }, []);

  const validateAndProcessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Validate dimensions: min 250x250, max 4000x4000
        if (img.width < 250 || img.height < 250) {
          reject(new Error('Image too small. Minimum 250x250 pixels required.'));
          return;
        }
        if (img.width > 4000 || img.height > 4000) {
          reject(new Error('Image too large. Maximum 4000x4000 pixels allowed.'));
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const cropWidth = Math.max(250, Math.min(300, img.width));
        const cropHeight = Math.max(250, Math.min(350, img.height));
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        
        ctx.drawImage(
          img,
          centerX - cropWidth/2, centerY - cropHeight/2, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        // Convert to JPEG with quality 0.9 to ensure < 10MB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Validate file size (base64 to bytes approximation)
        const sizeInBytes = (dataUrl.length * 3) / 4;
        if (sizeInBytes > 10 * 1024 * 1024) {
          reject(new Error('Image size exceeds 10MB limit.'));
          return;
        }
        
        resolve(dataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  };

  const handleCapturePhoto = async () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      console.error('Failed to capture screenshot from webcam');
      setCameraError("Failed to capture image. Please try again.");
      return;
    }

    try {
      const processedImage = await validateAndProcessImage(screenshot);
      setCapturedImage(processedImage);
      setShowPreview(true);
    } catch (error) {
      console.error('Image validation failed:', error);
      setCameraError(error instanceof Error ? error.message : 'Image processing failed.');
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const handleSubmitPhoto = async () => {
    if (!employeeId || !capturedImage) return;

    setLoading(true);

    try {
      const photoData = {
        image: capturedImage,
        employeeId,
        email,
        timestamp: new Date().toISOString()
      };

      await axios.post(
        `${BioStarUrl}/api/uploadphoto`,
        photoData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      setSubmitted(true);
      setWebcamEnabled(false);
    } catch (error) {
      console.error("Error uploading photo:", error);
      console.error('Photo upload failed:', { employeeId, email, error: error instanceof Error ? error.message : String(error) });
      setCameraError("Failed to upload photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Submitted!</h2>
          <p className="text-gray-600 mb-4">Your face verification has been completed successfully.</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">Employee: {employeeId}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Face Attendance Verification
          </h1>
          <p className="text-gray-600 text-sm">
            Please align your face and submit your photo
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          {/* Employee Info */}
          {employeeId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Employee ID</p>
                <p className="text-lg font-bold text-gray-900">{employeeId}</p>
                <p className="text-sm text-gray-600 mt-1">{email}</p>
              </div>
            </div>
          )}

          {/* Camera Section */}
          <div className="relative mb-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-inner relative">
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-red-600 text-sm font-medium">{cameraError}</p>
                  </div>
                </div>
              ) : showPreview && capturedImage ? (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Captured preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black bg-opacity-50 rounded-lg p-2">
                      <p className="text-white text-xs text-center font-medium">
                        Review your photo
                      </p>
                    </div>
                  </div>
                </>
              ) : webcamEnabled ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    onUserMediaError={handleCameraError}
                    mirrored={true}
                    videoConstraints={{
                      width: { min: 640, ideal: 1280 },
                      height: { min: 480, ideal: 1920 },
                      facingMode: "user"
                    }}
                  />
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 border-2 border-white border-dashed rounded-full opacity-50"></div>
                  </div>
                  {/* Instructions Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black bg-opacity-50 rounded-lg p-2">
                      <p className="text-white text-xs text-center font-medium">
                        Position your face inside the frame
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">Camera disabled</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showPreview ? (
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry</span>
              </button>
              <button
                onClick={handleSubmitPhoto}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCapturePhoto}
              disabled={!employeeId || !webcamEnabled || !!cameraError}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Capture Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;
