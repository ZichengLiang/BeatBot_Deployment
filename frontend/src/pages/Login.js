import React from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabase'
import { useTheme } from '../contexts/ThemeContext'
import './Login.css'

const Login = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    
    return (
        <div className={`login-container ${isDarkMode ? 'dark' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center mb-4 rounded-lg shadow-md">
            <span className="text-white text-xl">🎵</span>
          </div>
          <h1>Welcome to AI Music Composer</h1>
          
          {/* Theme toggle button */}
          <button 
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="text-xl">{isDarkMode ? "☀️" : "🌙"}</span>
          </button>
          
          <div className="auth-section">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#0062ff',
                      brandAccent: '#0353e9',
                      inputBackground: isDarkMode ? '#2d3748' : 'white',
                      inputBorder: isDarkMode ? '#4a5568' : '#e2e8f0',
                      inputText: isDarkMode ? '#f7fafc' : '#1a202c',
                      inputLabelText: isDarkMode ? '#e2e8f0' : '#4a5568',
                      messageText: isDarkMode ? '#e2e8f0' : '#4a5568',
                      foreground: isDarkMode ? '#f7fafc' : '#1a202c',
                      baseBackground: 'transparent',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    height: '44px'
                  },
                  input: {
                    borderRadius: '6px',
                    backgroundColor: isDarkMode ? '#2d3748' : 'white',
                    color: isDarkMode ? '#f7fafc' : '#1a202c',
                  },
                  container: {
                    gap: '16px',
                  },
                  anchor: {
                    color: isDarkMode ? '#90cdf4' : '#3182ce',
                  },
                  divider: {
                    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                  },
                  message: {
                    color: isDarkMode ? '#e2e8f0' : '#4a5568',
                  },
                  label: {
                    color: isDarkMode ? '#e2e8f0' : '#4a5568',
                  }
                }
              }}
              theme={isDarkMode ? 'dark' : 'default'}
              providers={['google']}
              redirectTo={`${window.location.origin}`}
            />
          </div>
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            Made by TCD SwEng2025 Group 10
          </div>
        </div>
    )
}

export default Login
