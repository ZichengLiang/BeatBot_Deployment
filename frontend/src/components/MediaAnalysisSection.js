import React, { useState } from 'react';
import MidiUploader from './MidiUploader';
import './MediaAnalysisSection.css';

function MediaAnalysisSection() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = async (fileData) => {
    setUploadedFile(fileData);
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      
      // Determine the correct endpoint based on file type
      if (fileData.type.includes('midi') || fileData.type.includes('mid')) {
        endpoint = '/api/midi-file-load';
      } else if (fileData.type.includes('audio') || fileData.type.includes('mp3') || fileData.type.includes('wav')) {
        endpoint = '/api/audio-file-load';
      } else if (fileData.type.includes('image') || fileData.type.includes('jpg') || fileData.type.includes('png')) {
        endpoint = '/api/image-file-load';
      } else {
        throw new Error('Unsupported file type');
      }
      
      // Send file data to the backend
      const response = await fetch(endpoint, {
        method: 'POST',
        body: fileData.data,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      setAnalysisResult(result.Data);
    } catch (err) {
      console.error('Error analyzing file:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Media Analysis</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Upload an image, MIDI, or audio file to analyze its musical characteristics
        </p>
        
        <div className="flex items-center space-x-2">
          <MidiUploader onUpload={handleFileUpload} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Upload image, MIDI, or audio
          </span>
        </div>
      </div>
      
      {uploadedFile && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm font-medium">Uploaded: {uploadedFile.name}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      )}
      
      {analysisResult && !isLoading && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Analysis Results</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-[400px]">
            <pre className="text-sm">{JSON.stringify(analysisResult, null, 2)}</pre>
          </div>
          
          {/* Optional: Add visualization based on analysis results */}
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">Key Insights</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analysisResult)
                .filter(([key]) => !key.includes('raw') && !key.includes('data'))
                .map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium capitalize">{key.replace('_', ' ')}</p>
                    <p className="text-xl">{typeof value === 'object' ? JSON.stringify(value) : value}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaAnalysisSection; 