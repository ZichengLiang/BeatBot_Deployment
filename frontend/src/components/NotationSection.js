import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import ToggleSwitch from './ToggleSwitch';
import MidiRenderer from './MidiRenderer';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import _ from 'lodash';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will run if value or delay changes,
    // or on unmount
    // This is how we prevent debouncedValue from changing if value is
    // changed within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const NotationSection = ({ 
  isGreenMode,
  onGreenModeChange,
  notation,
  onNotationChange,
  midiData
  // onMidiDataChange // Removed for now as MIDI generation is internal to ABCJS synth
}) => {
  const { isDarkMode } = useTheme();
  const sheetMusicRef = useRef(null);
  const audioControlRef = useRef(null);
  const synthControllerRef = useRef(null);
  const visualObjRef = useRef(null);
  const abcContainerRef = useRef(null);
  const audioPortalRef = useRef(null);
  const [renderState, setRenderState] = useState({
    status: 'idle', // 'idle' | 'rendering' | 'success' | 'error'
    message: ''
  });
  
  const debouncedNotation = useDebounce(notation, 50);

  // Function to validate and format incomplete ABC notation
  const formatAbcNotation = (input) => {
    if (!input) return null;
    
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;

    // 使用更精确的头部检测正则表达式
    const headers = {
      X: /^X:\s*\d+/m.test(trimmed),
      M: /^M:\s*\d+\/\d+/m.test(trimmed),
      L: /^L:\s*\d+\/\d+/m.test(trimmed),
      K: /^K:\s*[A-Ga-g]/m.test(trimmed)
    };

    let output = trimmed;
    
    // 仅添加缺失的头部
    if (!headers.X) output = `X:1\n${output}`;
    if (!headers.M) output = `M:4/4\n${output}`;
    if (!headers.L) output = `L:1/8\n${output}`;
    if (!headers.K) output = `K:C\n${output}`;

    // 确保头部顺序正确
    const orderedHeaders = [];
    if (!headers.X) orderedHeaders.push('X:1');
    if (!headers.M) orderedHeaders.push('M:4/4');
    if (!headers.L) orderedHeaders.push('L:1/8');
    if (!headers.K) orderedHeaders.push('K:C');
    
    return orderedHeaders.length > 0 
      ? `${orderedHeaders.join('\n')}\n${trimmed}`
      : trimmed;
  };

  // Main rendering effect
  useEffect(() => {
    let isActive = true;
    let synthControl = null;
    
    const safeSetState = (newState) => {
      if (isActive) setRenderState(prev => ({ ...prev, ...newState }));
    };

    const renderOptions = { 
      responsive: 'resize',
      add_classes: true,
      staffwidth: sheetMusicRef.current?.clientWidth * 0.9 || 800
    };


    const renderAbc = async () => {
      try {
        if (!isActive || isGreenMode) return;
        
        // 清空专用容器
        if (abcContainerRef.current) {
          abcContainerRef.current.innerHTML = '';
        }

        // 直接使用格式化后的内容，无需长度验证
        const formattedNotation = formatAbcNotation(debouncedNotation);
        if (!formattedNotation) {
          safeSetState({ status: 'idle', message: '' });
          return;
        }

        // 安全设置音频参数
        const audioParams = {
          chordsOff: false,
          qpm: 120,
          swing: 0 // Default swing value
        };

        // 渲染ABC到专用容器
        // Ensure abcContainerRef.current is not null before rendering
        if (!abcContainerRef.current) {
          console.error('ABC container reference is null');
          safeSetState({ 
            status: 'error',
            message: 'Error rendering notation: Container element not found'
          });
          return;
        }
        
        let visualObj;
        try {
          visualObj = abcjs.renderAbc(
            abcContainerRef.current,
            formattedNotation, 
            renderOptions
          )[0];
        } catch (err) {
          console.error('Error rendering ABC notation:', err);
          safeSetState({
            status: 'error',
            message: `Error rendering notation: ${err.message}`
          });
          return;
        }

        // 初始化音频控制
        if (audioPortalRef.current) {
          try {
            synthControl = new abcjs.synth.SynthController();
            
            synthControl.load(audioPortalRef.current, audioParams, {
              displayLoop: true,
              displayRestart: true,
              displayPlay: true
            });

            // 初始化音频合成器
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const synth = new abcjs.synth.CreateSynth();
            
            if (visualObj) {
              await synth.init({
                visualObj: visualObj,
                audioContext: audioContext
              });
              
              // 关联控制器与乐谱
              await synthControl.setTune(visualObj, false);
              
              // 预加载音色
              await synth.prime();
            }
          } catch (audioErr) {
            console.error('Audio initialization error:', audioErr);
            // Continue without audio if there's an error
          }
        }

        safeSetState({ status: 'success', message: '' });

        console.log('Current Render Options:', renderOptions);
        console.log('Current Audio Params:', audioParams);
      } catch (error) {
        console.error('Rendering error:', error);
        safeSetState({ 
          status: 'error',
          message: `Error rendering notation: ${error.message}`
        });
      }
    };

    // 添加防抖保护
    const debouncedRender = _.debounce(renderAbc, 100);
    debouncedRender();

    return () => {
      isActive = false;
      debouncedRender.cancel();
      
      // 安全清理音频资源
      if (synthControl) {
        if (synthControl.stop) synthControl.stop();
        if (synthControl.destroy) synthControl.destroy();
        if (synthControl.synth?.audioContext) {
          synthControl.synth.audioContext.close();
        }
      }
      
      // 清空专用容器
      if (abcContainerRef.current) {
        abcContainerRef.current.innerHTML = '';
      }
      if (audioPortalRef.current) {
        audioPortalRef.current.innerHTML = '';
      }
    };
  }, [debouncedNotation, isGreenMode]);
  
  // Function to download generated sheet music as SVG
  const downloadSheetMusicSVG = () => {
    if (!isGreenMode && sheetMusicRef.current) {
      const svgElement = sheetMusicRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'sheet_music.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      }
    }
  };
  
  // Function to download MIDI generated by ABCJS
  const downloadAbcMidi = () => {
    if (!isGreenMode && notation) { // Use original notation for MIDI generation
      try {
        // Format the notation for MIDI generation 
        const formattedNotation = formatAbcNotation(notation);
        if (!formattedNotation) {
          alert("Cannot generate MIDI: Invalid ABC notation.");
          return;
        }
        
        const midiBuffer = abcjs.synth.getMidiFile(formattedNotation, { midiOutputType: 'binary' });
        const blob = new Blob([midiBuffer], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'music_from_abc.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
         console.error("Error generating MIDI from ABC:", error);
         alert("Could not generate MIDI file.");
      }
    }
  };

  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-md h-full flex flex-col",
      isDarkMode ? "bg-gray-800" : "bg-white"
    )}>
      {/* Header with Mode Toggle */}
      <div className={cn(
        "px-6 py-4 flex justify-between items-center",
        isDarkMode ? "bg-blue-900" : "bg-blue-500",
        "text-white flex-shrink-0" // Prevent header from shrinking
      )}>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎹</span>
          <h3 className="text-xl font-semibold">
            {isGreenMode ? "MIDI Output" : "ABC Notation & Sheet Music"}
          </h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">🍃 Green Mode</span>
          <ToggleSwitch 
            isOn={isGreenMode} 
            setIsOn={onGreenModeChange} // Use the passed handler
            label="" 
          />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-4 flex-grow overflow-y-auto"> { /* Allow content to scroll */}
        {isGreenMode ? (
          // --- Green Mode (MIDI Renderer) ---
          <div className="midi-visualizer-container h-full">
            <MidiRenderer midiData={midiData} />
          </div>
        ) : (
          // --- Standard Mode (ABC Notation & Sheet Music) ---
          <div className="flex flex-col h-full space-y-4">
            {/* ABC Notation Input - Value uses the live `notation` prop */}
            <div>
              <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-gray-300" : "text-gray-700")}>
                ABC Notation
              </label>
              <textarea
                value={notation || ''} // Use the live notation prop here
                onChange={(e) => onNotationChange?.(e.target.value)}
                placeholder="Enter ABC Notation Here:C D E F | G A B c |"
                className={cn(
                  "w-full p-3 border rounded-lg font-mono text-sm h-40", // Reduced height
                  "focus:outline-none focus:ring-2",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-600"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-blue-400"
                )}
              />
            </div>

            {/* Sheet Music Display & Audio Controls */}
            <div className="flex-grow flex flex-col">
              <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-gray-300" : "text-gray-700")}>
                Sheet Music & Playback
              </label>

              {renderState.status === 'error' && (
                <div className="mb-2 p-2 bg-red-100 border border-red-300 text-red-600 rounded-md text-sm">
                  {renderState.message}
                </div>
              )}

              <div 
                ref={sheetMusicRef}
                className={cn(
                  "w-full flex-grow border rounded-lg overflow-auto p-2",
                  isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                )}
              >
                {/* 新增专用容器 */}
                <div ref={abcContainerRef} />
                {renderState.status === 'idle' && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Sheet music will appear here when you enter valid ABC notation.
                  </div>
                )}
              </div>
            </div>

            {/* 音频控制容器 */}
            <div 
              ref={audioPortalRef}
              className="mb-2 abcjs-audio"
            />

            {/* Download Buttons */}
            <div className="flex-shrink-0 flex flex-wrap justify-center gap-2 pt-2">
              <button 
                onClick={downloadSheetMusicSVG}
                disabled={!notation || renderState.status !== 'success'} // Only enable when rendering is successful
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium text-white",
                  (notation && renderState.status === 'success')
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-gray-400 cursor-not-allowed"
                )}
              >
                DOWNLOAD SHEET (SVG)
              </button>
              <button 
                onClick={downloadAbcMidi}
                disabled={!notation || renderState.status !== 'success'} // Only enable when rendering is successful
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium text-white",
                  (notation && renderState.status === 'success')
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-gray-400 cursor-not-allowed"
                )}
              >
                DOWNLOAD MIDI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Component Stack:', info.componentStack);
    console.error('Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // 添加错误上报逻辑
    if (typeof window.trackJs !== 'undefined') {
      window.trackJs.track({
        message: 'NotationSection Error',
        error: error,
        componentStack: info.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Sheet music display unavailable. Please try refreshing.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SafeNotationSection(props) {
  return (
    <ErrorBoundary>
      <NotationSection {...props} />
    </ErrorBoundary>
  );
} 