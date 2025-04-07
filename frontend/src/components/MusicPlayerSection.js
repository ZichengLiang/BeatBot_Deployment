import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const MusicPlayerSection = ({ midiData, trackName = 'Your Creation' }) => {
  const { isDarkMode } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60); // Default 60 seconds
  const [tempo, setTempo] = useState(120);
  
  // Audio Visualizer references
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  
  // For progress bar
  const progressInterval = useRef(null);
  
  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);
  
  // Setup audio visualizer when audio element is ready
  const setupAudioVisualizer = () => {
    if (!audioRef.current) return;
    
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create source node if not exists
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        // Create analyzer node
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256; // Must be power of 2
        
        // Connect the nodes
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      }
      
      // Start visualization
      visualizeData();
    } catch (error) {
      console.error("Failed to setup audio visualizer:", error);
    }
  };
  
  // Visualize audio data function
  const visualizeData = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient for visualization
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isDarkMode) {
      gradient.addColorStop(0, '#9D4EDD'); // Bright purple
      gradient.addColorStop(0.3, '#7B2CBF'); // Medium purple
      gradient.addColorStop(0.6, '#5A189A'); // Deep purple
      gradient.addColorStop(1, '#3C096C'); // Dark purple
    } else {
      gradient.addColorStop(0, '#FF9E00'); // Bright orange/gold
      gradient.addColorStop(0.3, '#FF7A00'); // Orange
      gradient.addColorStop(0.6, '#FF5400'); // Deep orange
      gradient.addColorStop(1, '#FF0054'); // Pinkish red
    }
    
    // Get frequency data
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    // Calculate bar width based on canvas size and buffer length
    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;
    
    // Draw bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1; // Add small space between bars
    }
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(visualizeData);
  };
  
  // Handle play/pause button click
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } else {
      // Resume or start playing
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Audio playback started
          setupAudioVisualizer();
          
          // Update progress
          progressInterval.current = setInterval(() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }, 100);
        }).catch(error => {
          console.error("Play failed:", error);
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 60);
    }
  };
  
  // Handle progress bar click
  const handleProgressChange = (e) => {
    if (audioRef.current) {
      const newTime = e.target.value;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-md",
      isDarkMode 
        ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800" 
        : "bg-gradient-to-br from-white via-gray-50 to-white"
    )}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={midiData?.audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              {trackName}
            </h3>
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              {midiData ? 'Generated music ready to play' : 'Traditional folk melody in G major'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Tempo:
            </span>
            <select
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className={cn(
                "px-2 py-1 rounded text-sm border",
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-800"
              )}
            >
              {[60, 80, 100, 120, 140, 160, 180, 200].map((t) => (
                <option key={t} value={t}>
                  {t} BPM
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Audio Visualizer Canvas */}
        <div className="relative mb-3">
          <canvas 
            ref={canvasRef} 
            width="1000" 
            height="100"
            className={cn(
              "w-full h-16 rounded-lg overflow-hidden",
              isDarkMode 
                ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" 
                : "bg-gradient-to-r from-gray-100 via-white to-gray-100"
            )}
          />
          
          {/* Progress Indicator */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-purple-500 opacity-20"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Playback Progress */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer"
            style={{ height: '100%' }}
          />
        </div>
        
        {/* Time Indicators */}
        <div className="flex justify-between text-xs mb-4">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {formatTime(currentTime)}
          </span>
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {formatTime(duration)}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            className={cn(
              "p-2 rounded-full",
              isDarkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            )}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
              }
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <button
            onClick={handlePlayPause}
            className={cn(
              "p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700",
              "transition-all transform hover:scale-105"
            )}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <button
            className={cn(
              "p-2 rounded-full",
              isDarkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            )}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
              }
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerSection; 