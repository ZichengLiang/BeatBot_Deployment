import React, { useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function MidiUploader({ onUpload }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isDarkMode } = useTheme();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const rawBytes = new Uint8Array(arrayBuffer); // Convert to raw binary
      onUpload({ name: file.name, type: file.type, data: rawBytes }); // Pass file meta + binary
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileButtonClick = () => {
    // Trigger file input click when the button is clicked
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const rawBytes = new Uint8Array(arrayBuffer);
      onUpload({ name: file.name, type: file.type, data: rawBytes });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div 
      className={`media-uploader w-full h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragging 
          ? (isDarkMode ? 'border-purple-500 bg-gray-800' : 'border-purple-500 bg-purple-50') 
          : (isDarkMode ? 'border-gray-600 hover:border-purple-400' : 'border-gray-300 hover:border-purple-400')
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleFileButtonClick}
    >
      <input
        type="file"
        accept=".mid,.midi,.mp3,.wav,.jpg,.jpeg,.png"
        onChange={handleFile}
        id="file-upload"
        hidden
        ref={fileInputRef}
      />
      
      <div className="flex flex-col items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-8 w-8 mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Drop file here or click to upload
        </p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          MIDI, MP3, WAV, JPG, PNG
        </p>
      </div>
    </div>
  );
}

export default MidiUploader;
