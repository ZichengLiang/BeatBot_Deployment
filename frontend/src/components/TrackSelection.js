import React from 'react';
import { cn } from '../lib/utils';

function TrackSelection({ tracks = [], onSelectTrack, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        Composed Tracks
      </h3>
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <button
            key={track.id || index}
            onClick={() => onSelectTrack?.(track)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <span className="text-lg">🎼</span>
            <span className="truncate">{track.name || `Track ${index + 1}`}</span>
          </button>
        ))}
        <button 
          className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-blue-600 dark:text-blue-400 mt-2"
          onClick={() => console.log('Create new track')}
        >
          <span className="text-lg">➕</span>
          <span>New Track</span>
        </button>
      </div>
    </div>
  );
}

export default TrackSelection;
