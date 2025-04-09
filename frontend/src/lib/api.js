// API Service for IBM Music AI
// Centralized file for all API calls to the backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.sweng25-ai-music-composition.com';

// General API call function with error handling
const callApi = async (endpoint, method = 'GET', data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
      },
    };

    // Add Content-Type header for JSON requests
    if (data && !(data instanceof FormData) && !(data instanceof Blob)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    } else if (data) {
      // For FormData or Blob, let the browser set the correct Content-Type
      options.body = data;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call error: ${error.message}`);
    throw new Error(`Server communication failed: ${error.message}`);
  }
};

// Utility function to parse base64 MIDI data
export const parseMidiBase64 = async (base64Data) => {
  try {
    // If the format is not what we expect, try to parse using the upload-midi endpoint
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use the API's upload-midi endpoint which can parse MIDI to notes
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/midi' });
    formData.append('file', blob);
    
    const parsedData = await callApi('/api/upload-midi', 'POST', blob);
    
    return {
      notes: parsedData.notes || [],
      tempo: parsedData.tempo || 120
    };
  } catch (error) {
    console.error("Error parsing MIDI data:", error);
    throw new Error("Failed to parse MIDI data");
  }
};

// Test API connection
export const testConnection = () => callApi('/api/test');

// Chat API - for generating music with MIDI output
export const generateMusic = (message) => callApi('/api/chat', 'POST', { message });

// ABC Notation API - for generating music with ABC Notation output
export const generateAbcNotation = (message) => callApi('/api/abc-chat', 'POST', { message });

// File upload APIs
export const uploadMidiFile = (fileData) => callApi('/api/midi-file-load', 'POST', fileData);

export const uploadImageFile = (fileData) => callApi('/api/image-file-load', 'POST', fileData);

// This endpoint is commented out in the backend
// export const uploadAudioFile = (fileData) => callApi('/api/audio-file-load', 'POST', fileData);

// Carbon Tracking API
export const getCarbonTracking = () => callApi('/carbonTracking', 'GET');

// Get chat history
export const getChatHistory = () => callApi('/api/chat/history');

export default {
  testConnection,
  generateMusic,
  generateAbcNotation,
  uploadMidiFile,
  uploadImageFile,
  getChatHistory,
  parseMidiBase64
}; 