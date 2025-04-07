import React, { useEffect } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import MidiUploader from './MidiUploader';

const UploadModal = ({ isOpen, onClose, onUpload, isUploading, analysisResult }) => {
  const { isDarkMode } = useTheme();
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && !isUploading) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Disable body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isUploading]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={cn(
          "relative rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}
      >
        {/* Header */}
        <div className={cn(
          "px-6 py-4 border-b",
          isDarkMode ? "border-gray-700" : "border-gray-200"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              Upload Media for Analysis
            </h3>
            <button
              onClick={onClose}
              disabled={isUploading}
              className={cn(
                "rounded-full p-1 focus:outline-none",
                isDarkMode 
                  ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className={cn(
            "mb-4 text-sm",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Upload an image, MIDI, or audio file to analyze its musical characteristics and generate music based on it.
          </p>
          
          <div className="mb-4">
            <MidiUploader onUpload={onUpload} />
          </div>
          
          {isUploading && (
            <div className="mt-4 flex justify-center items-center">
              <div className={cn(
                "animate-spin rounded-full h-6 w-6 border-b-2",
                isDarkMode ? "border-purple-400" : "border-purple-500"
              )}></div>
              <span className={cn(
                "ml-3 text-sm font-medium",
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Analyzing file...
              </span>
            </div>
          )}
          
          {analysisResult && (
            <div className={cn(
              "mt-4 p-3 rounded-lg",
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            )}>
              <h4 className={cn(
                "font-medium mb-2",
                isDarkMode ? "text-gray-200" : "text-gray-700"
              )}>
                Analysis Results
              </h4>
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(analysisResult)
                  .filter(([key]) => !key.includes('raw') && typeof analysisResult[key] !== 'object')
                  .map(([key, value]) => (
                    <div 
                      key={key} 
                      className={cn(
                        "flex justify-between py-1 text-sm border-b",
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      )}
                    >
                      <span className="capitalize font-medium">{key.replace(/_/g, ' ')}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Footer with close button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              disabled={isUploading}
              className={cn(
                "px-4 py-2 rounded font-medium text-sm",
                isUploading ? "opacity-50 cursor-not-allowed" : "",
                isDarkMode 
                  ? "bg-gray-700 text-white hover:bg-gray-600" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              )}
            >
              {analysisResult ? "Use Analysis" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal; 