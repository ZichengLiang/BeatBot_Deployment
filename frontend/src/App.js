import * as React from 'react';
import { useState, useEffect } from 'react';

// Auth related imports
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';

// Components
import MainLayout from './components/MainLayout';
import CreativeMuseSection from './components/CreativeMuseSection';
import NotationSection from './components/NotationSection';
import MusicPlayerSection from './components/MusicPlayerSection';
import WorkflowVisualizer from './components/WorkflowVisualizer';

// Services
import * as apiService from './lib/api';

// Styles
import './App.css';

function Composer() {
  const [midiData, setMidiData] = useState(null);
  const [notation, setNotation] = useState('');
  const [isGreenMode, setIsGreenMode] = useState(false); // Default to Standard Mode (ABC)
  const [trackName, setTrackName] = useState('Your Creation');
  const [workflowState, setWorkflowState] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  
  // Function to generate music based on the Creative Muse input
  const handleGenerateMusic = async ({ prompt, genre, analysisResult }) => {
    // Clear any previous errors
    setGenerationError(null);
    
    // Return a promise so the parent component can track completion
    return new Promise(async (resolve, reject) => {
      try {
        // Set track name based on genre or prompt
        if (genre) {
          setTrackName(`${genre.charAt(0).toUpperCase() + genre.slice(1)} Creation`);
        } else if (prompt) {
          setTrackName(prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt);
        }
        
        // Initialize workflow state with animation
        setWorkflowState({
          currentStep: 'start',
          stepDescription: 'Starting composition process...',
          animating: true
        });
        
        // Log parameters including any analysis result
        console.log(`Generating music with prompt: ${prompt}, genre: ${genre}, greenMode: ${isGreenMode}, analysisResult:`, analysisResult);
        
        // Prepare the prompt for API call
        let userPrompt = prompt;
        
        // Add genre to prompt if selected
        if (genre) {
          userPrompt = `${prompt}\n\nGenre: ${genre}`;
        }
        
        // Add analysis result to prompt if available
        if (analysisResult) {
          userPrompt = `${userPrompt}\n\nAnalysis result: ${JSON.stringify(analysisResult)}`;
          console.log("Including analysis result in generation");
        }
        
        if (!isGreenMode) { // Standard Mode: Generate ABC notation
          // Update workflow state for ABC generation with animation
          setWorkflowState({
            currentStep: 'create_analysts',
            stepDescription: 'Creating music analysts...',
            animating: true
          });
          
          try {
            setWorkflowState({
              currentStep: 'interview',
              stepDescription: 'Analyzing musical elements...',
              animating: true
            });
            
            // Call the ABC notation API
            const abcResponse = await apiService.generateAbcNotation(userPrompt);
            
            setWorkflowState({
              currentStep: 'compose_sections',
              stepDescription: 'Composing musical sections...',
              animating: true
            });
            
            // Set the ABC notation from the response
            setNotation(abcResponse.ABC_notes);
            setMidiData(null);
            
            setWorkflowState({
              currentStep: 'compose_final_music',
              stepDescription: 'Finalizing composition...',
              animating: true
            });
            
            // Short delay to show the final step
            await new Promise(r => setTimeout(r, 500));
            
            setWorkflowState({
              currentStep: 'end',
              stepDescription: 'Composition completed!',
              animating: false
            });
            
            resolve(); // Resolve the promise on success
          } catch (error) {
            console.error("Error generating ABC notation:", error);
            setWorkflowState({
              currentStep: 'error',
              stepDescription: `Error: ${error.message}`,
              animating: false
            });
            setGenerationError(error.message);
            reject(error); // Reject the promise on error
          }
        } else { // Green Mode: Generate MIDI directly
          // Update workflow state for MIDI generation with animation
          setWorkflowState({
            currentStep: 'create_analysts',
            stepDescription: 'Creating music analysts...',
            animating: true
          });
          
          try {
            setWorkflowState({
              currentStep: 'interview',
              stepDescription: 'Analyzing musical elements...',
              animating: true
            });
            
            // Call the MIDI generation API
            const midiResponse = await apiService.generateMusic(userPrompt);
            
            setWorkflowState({
              currentStep: 'compose_final_music',
              stepDescription: 'Finalizing composition...',
              animating: true
            });
            
            // Process the MIDI data from the response
            if (midiResponse.midi_data) {
              // Structure the MIDI data for MidiRenderer component
              setMidiData({
                bytes: midiResponse.midi_data,
                tempo: midiResponse.parameters.tempo || 120,
                instruments: midiResponse.parameters.instruments || [{ name: 'piano' }],
                // Pass any notes structure if available directly from the backend
                notes: midiResponse.parameters.notes || null
              });
              setNotation('');
            }
            
            // Short delay to show the final step
            await new Promise(r => setTimeout(r, 500));
            
            setWorkflowState({
              currentStep: 'end',
              stepDescription: 'Composition completed!',
              animating: false
            });
            
            resolve(); // Resolve the promise on success
          } catch (error) {
            console.error("Error generating MIDI:", error);
            setWorkflowState({
              currentStep: 'error',
              stepDescription: `Error: ${error.message}`,
              animating: false
            });
            setGenerationError(error.message);
            reject(error); // Reject the promise on error
          }
        }
      } catch (error) {
        console.error("Unexpected error in music generation:", error);
        setWorkflowState({
          currentStep: 'error',
          stepDescription: `Unexpected error: ${error.message}`,
          animating: false
        });
        setGenerationError(error.message);
        reject(error); // Reject the promise on error
      }
    });
  };
  
  // Function to handle MIDI data changes from NotationSection (relevant for ABC->MIDI)
  const handleMidiDataChange = (newMidiData) => {
    // This might be used if ABCJS generates playable MIDI for the main player
    // For now, focusing on separate modes
    // setMidiData(newMidiData);
    console.log("MIDI data potentially updated from ABCJS", newMidiData);
  };
  
  // Function to handle green mode changes
  const handleGreenModeChange = (value) => {
    setIsGreenMode(value);
    
    // Clear the state of the *other* mode when switching
    if (value) {
      // Switched TO Green Mode (MIDI)
      setNotation('');
    } else {
      // Switched TO Standard Mode (ABC)
      setMidiData(null);
    }
    setTrackName('Your Creation'); // Reset track name on mode switch
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold">Create Music</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Transform your ideas into beautiful compositions through text, images, or audio
        </p>
        <div className="mt-2 flex items-center space-x-3">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <p>Current Mode: {isGreenMode ? "Green Mode (Direct MIDI)" : "Standard Mode (ABC Notation)"}</p>
          </div>
        </div>
      </div>
      
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Creative Muse */}
        <CreativeMuseSection onGenerateMusic={handleGenerateMusic} />
        
        {/* Right Column - Notation & Sheet Music / MIDI */}
        <NotationSection 
          isGreenMode={isGreenMode} // Pass the mode status
          onGreenModeChange={handleGreenModeChange} // Pass the handler
          notation={notation} 
          onNotationChange={setNotation}
          midiData={midiData}
          onMidiDataChange={handleMidiDataChange} // Keep for potential future use
        />
      </div>
      
      {/* Workflow Visualizer */}
      <WorkflowVisualizer 
        currentState={workflowState} 
        isGreenMode={isGreenMode}
      />
      
      {/* Bottom Player */}
      <MusicPlayerSection 
        // Decide what the player should play based on mode?
        // For now, it primarily visualizes direct MIDI or audio URL
        midiData={midiData} // Pass MIDI data primarily for Green Mode
        trackName={trackName}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Private Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <About />
                </PrivateRoute>
              }
            />
            <Route
              path="/composer"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <div className="p-6">
                      <Composer />
                    </div>
                  </MainLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;