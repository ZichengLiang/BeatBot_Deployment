import React from 'react';
import './MidiViewer.css';
import { cn } from '../lib/utils';

function MidiViewer({ notes, progress = 0, duration = 10, isDarkMode = false }) {
  const convertToSeconds = (beats) => (beats * 60) / 120; // Default tempo 120
  const minPitch = Math.min(...notes.map(n => n.pitch), 21);
  const maxPitch = Math.max(...notes.map(n => n.pitch), 108);
  
  // Calculate where the current progress indicator should be
  const progressPosition = (progress / 100) * duration * 50; // 50px per second

  return (
    <div className={cn(
      "piano-roll",
      isDarkMode ? "bg-gray-800" : "bg-gray-100"
    )}>
      <div className="note-blocks">
        {notes.map((note, i) => {
          const left = convertToSeconds(note.time) * 50; // 50px per second
          const width = convertToSeconds(note.duration) * 50;
          const bottom = ((note.pitch - minPitch) / (maxPitch - minPitch)) * 100;

          return (
            <div
              key={i}
              className="note-block"
              style={{
                left: `${left}px`,
                width: `${width}px`,
                bottom: `${bottom}%`,
                height: '2%',
                backgroundColor: isDarkMode
                  ? `hsl(${(note.pitch * 3.6) % 360}, 70%, 60%)`
                  : `hsl(${(note.pitch * 3.6) % 360}, 80%, 50%)`
              }}
            />
          );
        })}
        
        {/* Progress indicator line */}
        {progress > 0 && (
          <div 
            className={cn(
              "progress-line absolute top-0 bottom-0 w-0.5",
              isDarkMode ? "bg-white" : "bg-black"
            )}
            style={{ 
              left: `${progressPosition}px`,
              opacity: 0.7
            }}
          />
        )}
      </div>
      
      {/* Grid lines */}
      <div className={cn(
        "grid-lines",
        isDarkMode ? "border-gray-700" : "border-gray-300"
      )}>
        {/* Grid lines would be implemented here */}
      </div>
    </div>
  );
}

export default MidiViewer; 