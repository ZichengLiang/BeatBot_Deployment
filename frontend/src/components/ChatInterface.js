import React, { useState, useRef } from 'react';
import './ChatInterface.css';
import MidiRenderer from './MidiRenderer';
import UploadModal from './UploadModal';
import FileTabs from './FileTabs';
import * as apiService from '../lib/api';

function ChatInterface({ onMidiGenerated, isOn, setIsOn, text, setText, tabs, setTabs, onTabClose}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  var extracted = '';
  const [data, setData] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  const [tabsId, setTabsID] = useState('');

  const handleUpload = async ({ name, type, data }) => {
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
      extracted = result.Data;
      
      // Close modal after successful analysis
      setModalOpen(false);
      
      // Set data for tab
      setData(data);
      setName(name);
      setType(type);
      
      const newTab = {
        id: Date.now(),
        name: `${name}`
      };
      
      setTabsID(newTab.id);
      setTabs(prevTabs => [...prevTabs, newTab]);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error analyzing file: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabClose = (tabId) => {
    console.log(`Tab with id ${tabId} closed.`);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Combine the user input with any extracted analysis
    const combinedPrompt = input + '\n\n' + extracted;
    const promptToSend = extracted ? combinedPrompt : input;

    try {
      // First test the connection
      try {
        await apiService.testConnection();
      } catch (error) {
        throw new Error(`Backend connection failed: ${error.message}`);
      }

      let chatData;
      
      if(isOn){
        console.log(isOn);
        // Generate music with MIDI output
        chatData = await apiService.generateMusic(promptToSend);

        // The MIDI data is already included in chatData
        if (chatData.midi_data) {
          const midiInfo = {
            notes: chatData.parameters.notes || [],
            tempo: chatData.parameters.tempo || 120,
            bytes: chatData.midi_data,
            instruments: chatData.parameters.instruments || ['Acoustic Grand Piano']
          };
          onMidiGenerated(midiInfo);
        }

        setText("");

        const aiMessage = {
          role: 'assistant',
          content: chatData.response + "\n\nI've generated a melody based on your input. You can play it using the music player on the right."
        };

        //Reset Analysis
        extracted = '';

        setMessages(prev => [...prev, aiMessage]);
      }
      else {
        console.log(isOn);
        // Generate music with ABC notation
        chatData = await apiService.generateAbcNotation(promptToSend);

        setText(chatData.ABC_notes);

        const aiMessage = {
          role: 'assistant',
          content: chatData.response + "\n\nI've generated the ABC Notation based on your input."
        };

        //Reset Analysis
        extracted = '';

        setMessages(prev => [...prev, aiMessage]);
      }

      // Clean up after successful generation
      extracted = '';
      setData('');
      setType('');
      setName('');
      setUploadedFile(null);
      setAnalysisResult(null);
      
      if (tabsId) {
        setTabs(tabs.filter(tab => tab.id !== tabsId));
        onTabClose(tabsId);
        setTabsID('');
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please make sure the backend server is running and try again.`
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  // Function to open/close the upload modal
  const toggleUploadModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div className="chat-container">
      <div className="chat-interface">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome to AI Music Composer!</h3>
              <p>Describe the kind of music you want to create, and I'll help you compose it.</p>
              <p>Try something like:</p>
              <ul>
                <li>"Create a happy melody in C major"</li>
                <li>"Compose a sad piano piece"</li>
                <li>"Generate a jazz-style progression"</li>
              </ul>
              <p>You can also upload an image, MIDI, or audio file for analysis!</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">Composing your music...</div>
            </div>
          )}
        </div>

        <FileTabs tabs={tabs} setTabs={setTabs} onTabClose={handleTabClose} />

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <button 
              type="button" 
              onClick={toggleUploadModal} 
              className="upload-toggle-button"
              title="Upload media for analysis"
              disabled={isLoading || isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the music you want to create..."
              className="chat-input"
              disabled={isLoading || isUploading}
            />
            
            {uploadedFile && (
              <div className="file-badge">
                <span>{uploadedFile.name}</span>
                <button 
                  type="button"
                  className="file-badge-close"
                  onClick={() => {
                    setUploadedFile(null);
                    setAnalysisResult(null);
                    extracted = '';
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading || isUploading || !input.trim()}
          >
            {isLoading ? 'Composing...' : 'Compose'}
          </button>
        </form>
        
        <div className="connection-status">
          {isLoading && <p>Connecting to backend server...</p>}
          {isUploading && <p>Analyzing your file...</p>}
        </div>
      </div>
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
        analysisResult={analysisResult}
      />
    </div>
  );
}

export default ChatInterface;