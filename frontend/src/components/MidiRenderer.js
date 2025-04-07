import React, { useState, useEffect, useRef } from 'react';
import { PolySynth, Synth, start, getTransport, now, Transport, Frequency } from 'tone';
import './MidiRenderer.css';
import MidiViewer from './MidiViewer';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme
import { cn } from '../lib/utils'; // Import cn for conditional classes
import * as apiService from '../lib/api'; // Import API service

function MidiRenderer({ midiData }) {
  const { isDarkMode } = useTheme(); // Get theme context
  const [currentMidi, setCurrentMidi] = useState(null);
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(10); // Placeholder for duration in seconds
  const [isDragging, setIsDragging] = useState(false);
  const synthRef = useRef(null);
  const intervalRef = useRef(null);
  const scheduledEvents = useRef([]); // Store scheduled events for cleanup
  const progressBarRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentMidi(null); // Reset on new midiData prop
    setError(null); // Clear previous errors
    
    if (midiData && midiData.bytes) {
      setIsLoading(true);
      // Parse base64 MIDI data into notes
      try {
        // Check if midiData already has parsed notes structure
        if (midiData.notes && midiData.notes.length > 0) {
          // Already has parsed notes, use directly
          const parsedMidi = midiData.notes;
          setCurrentMidi({
            ...midiData,
            notes: parsedMidi,
            // Estimate duration based on last note end time if not provided
            duration: midiData.duration || (parsedMidi.length > 0 ? Math.max(...parsedMidi.map(n => n.time + n.duration)) : 10) * 60 / (midiData.tempo || 120)
          });
          setDuration(midiData.duration || (parsedMidi.length > 0 ? Math.max(...parsedMidi.map(n => n.time + n.duration)) : 10) * 60 / (midiData.tempo || 120));
          setIsLoading(false);
        } else {
          // Use the API service to parse the MIDI data
          apiService.parseMidiBase64(midiData.bytes)
            .then(parsedData => {
              if (parsedData && parsedData.notes && parsedData.notes.length > 0) {
                setCurrentMidi({
                  ...midiData,
                  notes: parsedData.notes,
                  tempo: parsedData.tempo || midiData.tempo || 120,
                  // Estimate duration based on last note end time if not provided
                  duration: midiData.duration || (parsedData.notes.length > 0 ? Math.max(...parsedData.notes.map(n => n.time + n.duration)) : 10) * 60 / (parsedData.tempo || 120)
                });
                setDuration(midiData.duration || (parsedData.notes.length > 0 ? Math.max(...parsedData.notes.map(n => n.time + n.duration)) : 10) * 60 / (parsedData.tempo || 120));
              } else {
                setError('MIDI parsing resulted in no notes.');
              }
              setIsLoading(false);
            })
            .catch(err => {
              console.error('Error parsing MIDI data:', err);
              setError('Failed to parse MIDI data. Please ensure it is a valid MIDI file.');
              setIsLoading(false);
            });
        }
      } catch (err) {
        console.error('Error initiating MIDI parsing:', err);
        setError('An unexpected error occurred during MIDI parsing.');
        setIsLoading(false);
      }
    } else {
      // Handle cases where midiData might be present but lacks bytes
      setIsLoading(false);
      if (midiData) {
         setError('Invalid MIDI data provided.');
      }
    }
    
    // Cleanup playback if midiData changes
    return () => {
       stopPlayback();
    };
  }, [midiData]);

  const handlePlayPause = async () => {
    if (!currentMidi || !currentMidi.notes || currentMidi.notes.length === 0) return;

    if (!synthRef.current) {
      synthRef.current = new PolySynth(Synth).toDestination();
    }

    if (!isPlaying) {
      try {
        await start(); // Ensure AudioContext is started
        playMidiSequence(); // Start or resume playback using Tone.Transport
      } catch (err) {
        console.error("Error starting playback:", err);
        setError("Could not start audio playback.");
      }
    } else {
      stopPlayback(); // Stop playback
    }
  };

  // Updated playMidiSequence using Tone.Transport for accurate scheduling
  const playMidiSequence = () => {
    if (!currentMidi || !currentMidi.notes || !synthRef.current) return;

    setIsPlaying(true);
    setProgress(0);

    // Clear previous events
    Transport.cancel();
    scheduledEvents.current = [];
    
    const tempo = currentMidi.tempo || 120;
    Transport.bpm.value = tempo;

    let lastNoteEndTime = 0;

    currentMidi.notes.forEach(note => {
      if (note.duration <= 0) return;
      
      // Convert MIDI note number to frequency
      const freq = Frequency(note.pitch, "midi").toFrequency();
      const noteStartTime = note.time; // Assuming time is in seconds relative to start
      const noteDuration = note.duration;

      const eventId = Transport.scheduleOnce((time) => {
         try {
           // Use time parameter provided by Transport for precise scheduling
           synthRef.current.triggerAttackRelease(freq, noteDuration, time, note.velocity);
         } catch (e) {
           console.warn("Error triggering note:", e);
         }
      }, noteStartTime);
      scheduledEvents.current.push(eventId);
      
      lastNoteEndTime = Math.max(lastNoteEndTime, noteStartTime + noteDuration);
    });
    
    setDuration(lastNoteEndTime); // Update duration based on actual notes

    // Schedule UI updates for progress
    const progressEventId = Transport.scheduleRepeat(time => {
      // Ensure progress doesn't exceed 100% even with slight timing variations
      const currentProgress = Math.min(100, (Transport.seconds / lastNoteEndTime) * 100);
      setProgress(currentProgress);
    }, 0.1, 0); // Update every 0.1 seconds, starting immediately
    scheduledEvents.current.push(progressEventId);

    // Schedule automatic stop at the end
    const stopEventId = Transport.scheduleOnce(() => {
      setIsPlaying(false);
      setProgress(100); // Ensure progress bar reaches the end
      // Small delay before resetting progress to show completion
      setTimeout(() => {
         if (!isPlaying) setProgress(0);
      }, 200);
      Transport.stop(); // Stop transport
      Transport.cancel(); // Clear all scheduled events
    }, lastNoteEndTime + 0.1); // Stop slightly after the last note ends
    scheduledEvents.current.push(stopEventId);

    Transport.start();
  };

  const stopPlayback = () => {
    Transport.stop(); // Stop the transport
    Transport.cancel(); // Clear all scheduled events
    scheduledEvents.current = [];
    synthRef.current?.releaseAll(); // Release any sounding notes
    setIsPlaying(false);
    setProgress(0); // Reset progress
    if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
    }
  };

  const handleMouseDown = (event) => {
    if (!currentMidi || duration <= 0) return;
    setIsDragging(true);
    updatePlaybackPosition(event);
  };

  const handleMouseMove = (event) => {
    if (isDragging && currentMidi && duration > 0) {
      updatePlaybackPosition(event);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Optional: Resume playback if it was playing before drag
      // if (wasPlayingBeforeDrag) { Transport.start(); }
    }
  };

  // Update playback position based on click/drag on progress bar
  const updatePlaybackPosition = (event) => {
    if (!progressBarRef.current || duration <= 0) return;

    const barRect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = event.clientX - barRect.left;
    const totalWidth = barRect.width;
    let newProgressPercent = (clickPosition / totalWidth) * 100;
    newProgressPercent = Math.max(0, Math.min(newProgressPercent, 100)); // Clamp 0-100

    const newTime = (newProgressPercent / 100) * duration;
    setProgress(newProgressPercent);
    Transport.seconds = newTime; // Set Tone.Transport's position
    
    // If playing, briefly stop and restart to reflect new position immediately
    // This might cause a slight audio glitch but ensures sync
    if (isPlaying) {
       const currentBpm = Transport.bpm.value;
       Transport.stop();
       Transport.seconds = newTime;
       Transport.bpm.value = currentBpm; // Restore bpm if needed
       Transport.start();
    }
  };

  useEffect(() => {
    // Cleanup Tone.js synth on component unmount
    return () => {
      stopPlayback(); // Stop playback and clear transport
      synthRef.current?.dispose();
    };
  }, []);

  const handleDownload = () => {
    if (!midiData || !midiData.bytes) return;
    
    try {
      // Decode base64 string to bytes
      const byteCharacters = atob(midiData.bytes);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      const midiBlob = new Blob([byteArray], { type: 'audio/midi' });
      const url = URL.createObjectURL(midiBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `composition-${Date.now()}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error creating download link:", e);
      setError("Could not prepare MIDI file for download.");
    }
  };
  
  // Display Loading or Error States
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-48", isDarkMode ? "text-gray-400" : "text-gray-600")}>
        Loading MIDI data...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-48 text-red-500", isDarkMode ? "bg-gray-700" : "bg-gray-100", "p-4 rounded-lg")}>
        Error: {error}
      </div>
    );
  }

  // Display Placeholder if no MIDI data is loaded
  if (!currentMidi || !currentMidi.notes || currentMidi.notes.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-48 rounded-lg",
        isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
      )}>
        <p>Generate music in Green Mode to visualize MIDI here.</p>
      </div>
    );
  }

  // Main Renderer Content
  return (
    <div className="midi-renderer-container p-4">
      <MidiViewer notes={currentMidi.notes} progress={progress} duration={duration} isDarkMode={isDarkMode}/>
      
      {/* Progress Bar */}
      <div 
        ref={progressBarRef}
        className="progress-bar-container bg-gray-300 dark:bg-gray-600 rounded-full h-2 w-full mt-4 cursor-pointer relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Handle mouse leaving the bar while dragging
      >
        <div 
          className="progress-bar-fill bg-blue-500 dark:bg-blue-400 h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
         <div 
            className="progress-handle absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-blue-700 dark:bg-blue-500 w-4 h-4 rounded-full shadow cursor-pointer"
            style={{ left: `${progress}%` }}
        />
      </div>
      
      {/* Controls */}
      <div className="player-controls flex items-center justify-center gap-4 mt-4">
        <button onClick={handlePlayPause} className={cn("control-button p-2 rounded-full", isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300")}>
          {isPlaying ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
          )}
        </button>
        <button onClick={stopPlayback} className={cn("control-button p-2 rounded-full", isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300")}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" /></svg>
        </button>
         <button 
            onClick={handleDownload} 
            disabled={!midiData || !midiData.bytes}
            className={cn(
               "control-button p-2 rounded-full", 
               isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300",
               (!midiData || !midiData.bytes) ? "opacity-50 cursor-not-allowed" : ""
            )}
         >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
         </button>
      </div>
    </div>
  );
}

export default MidiRenderer;