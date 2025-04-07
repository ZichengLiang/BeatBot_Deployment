import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import UploadModal from './UploadModal';
import * as apiService from '../lib/api';

const CreativeMuseSection = ({ onGenerateMusic }) => {
  const { isDarkMode } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const genres = [
    { id: 'classical', name: 'Classical', icon: '🎻' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'pop', name: 'Pop', icon: '🎤' },
    { id: 'folk', name: 'Folk', icon: '🪕' },
    { id: 'rock', name: 'Rock', icon: '🤘' },
  ];
  
  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
  };
  
  const handleSubmit = () => {
    if (onGenerateMusic && prompt.trim()) {
      setIsGenerating(true);
      const combinedData = {
        prompt, 
        genre: selectedGenre,
        analysisResult
      };
      
      // Pass the generation request to parent component
      onGenerateMusic(combinedData)
        .finally(() => {
          setIsGenerating(false);
          // Reset file state after generation
          setUploadedFile(null);
          setAnalysisResult(null);
        });
    }
  };

  const handleFileUpload = async ({ name, type, data }) => {
    setIsUploading(true);
    setUploadedFile({ name, type });
    
    // Determine the API endpoint based on file type
    let uploadFunction = null;
    
    if (type === 'audio/midi' || name.endsWith('.mid') || name.endsWith('.midi')) {
      uploadFunction = apiService.uploadMidiFile;
    } else if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png' || 
               name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      uploadFunction = apiService.uploadImageFile;
    } else {
      setIsUploading(false);
      alert('Unsupported file type');
      return;
    }

    try {
      const result = await uploadFunction(data);
      setAnalysisResult(result.Data);
      
      // Add file analysis to prompt as suggestion
      const fileType = name.split('.').pop().toLowerCase();
      const mediaType = fileType === 'mid' || fileType === 'midi' ? 'MIDI' : 
                       (fileType === 'mp3' || fileType === 'wav' ? 'audio' : 'image');
      
      // Build a descriptive prompt based on the analysis
      let suggestedPrompt = `Create music based on this ${mediaType} file analysis`;
      setPrompt(prompt ? `${prompt}\n${suggestedPrompt}` : suggestedPrompt);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error analyzing file: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const openModal = () => {
    setModalOpen(true);
  };
  
  const closeModal = () => {
    if (!isUploading) {
      setModalOpen(false);
    }
  };
  
  return (
    <>
      <div className={cn(
        "rounded-xl overflow-hidden shadow-md",
        isDarkMode 
          ? "bg-gradient-to-br from-gray-800 to-gray-900" 
          : "bg-gradient-to-br from-white to-gray-50"
      )}>
        <div className={cn(
          "px-6 py-4",
          isDarkMode 
            ? "bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900" 
            : "bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500",
          "text-white"
        )}>
          <div className="flex items-center space-x-2">
            <span className="text-xl">✨</span>
            <h3 className="text-xl font-semibold">Creative Muse</h3>
          </div>
          <p className="mt-1 text-sm text-purple-100">
            Transform your inspiration into beautiful music
          </p>
        </div>
        
        <div className="p-6">
          {/* Genre Buttons */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                  "hover:shadow-md",
                  selectedGenre === genre.id 
                    ? isDarkMode 
                      ? "bg-purple-700 text-white shadow-md"
                      : "bg-purple-100 text-purple-800 shadow-md" 
                    : isDarkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-100 text-gray-800"
                )}
              >
                <span className="text-2xl mb-1">{genre.icon}</span>
                <span className="text-sm">{genre.name}</span>
              </button>
            ))}
          </div>
          
          {/* Description Input Field */}
          <div className="mb-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the music you want to create..."
                className={cn(
                  "w-full p-3 border rounded-lg text-sm h-24",
                  "focus:outline-none focus:ring-2",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-600"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-purple-400"
                )}
              />
            </div>
          </div>

          {/* File Upload Button and Generate Button */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={openModal}
              disabled={isUploading || isGenerating}
              className={cn(
                "flex items-center text-sm py-1.5 px-3 rounded-md",
                isDarkMode 
                  ? "bg-gray-700 text-purple-300 hover:bg-gray-600" 
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100",
                (isUploading || isGenerating) && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Media for Analysis
            </button>
            
            {uploadedFile && (
              <div className={cn(
                "text-xs rounded-full px-2 py-1 flex items-center",
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              )}>
                <span className="mr-1">Using:</span>
                <span className="font-medium">{uploadedFile.name}</span>
                <button 
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setUploadedFile(null);
                    setAnalysisResult(null);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "w-full py-3 rounded-lg text-white font-medium mt-2 flex justify-center items-center transition-all",
              prompt.trim() && !isGenerating
                ? isDarkMode
                  ? "bg-purple-700 hover:bg-purple-600"
                  : "bg-purple-600 hover:bg-purple-500"
                : isDarkMode
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gray-400 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Music...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Generate Music
              </>
            )}
          </button>
          
          {/* Example Prompts */}
          <div className="mt-6">
            <h3 className={cn(
              "text-sm font-medium mb-2",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>Try these examples:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "🎷 A jazz progression with rainy day vibes 🏙️",
                "🎸 Some mixture of bass, piano and trumpet 🎺",
                "🎹 Sad piano concerto chapter II in F minor 🎼",
                "⚡️ Alternative rock band playing on a beach 🏖️"
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full",
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <UploadModal 
          isOpen={modalOpen} 
          onClose={closeModal} 
          onUpload={handleFileUpload} 
          isUploading={isUploading}
        />
      )}
    </>
  );
};

export default CreativeMuseSection; 