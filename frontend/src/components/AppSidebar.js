import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";
import UserProfile from "./UserProfile";

// Simple implementation without custom UI components yet
const AppSidebar = ({ tracks = [] }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const menuItems = [
    {
      title: "Home",
      path: "/",
      icon: "🏠",
    },
    {
      title: "Create Music",
      path: "/composer",
      icon: "🎼",
    },
    {
      title: "About",
      path: "/about",
      icon: "💬",
    },
  ];

  return (
    <div className={cn(
      "h-full border-r flex flex-col",
      isDarkMode 
        ? "bg-gray-900 border-gray-800 text-white" 
        : "bg-white border-gray-200 text-gray-800"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-ibm-blue flex items-center justify-center">
            <div className="text-white font-bold">🎵</div>
          </div>
          <span className="text-xl font-semibold">BeatBOot</span>
        </Link>
      </div>
      
      {/* Menu */}
      <div className="py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2 mx-2 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-primary text-primary-foreground" 
                    : isDarkMode
                      ? "hover:bg-gray-800" 
                      : "hover:bg-gray-100"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Composed Tracks Section */}
      {tracks.length > 0 && (
        <div className="py-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Composed Tracks
          </h3>
          <ul>
            {tracks.map((track, index) => (
              <li key={index}>
                <button 
                  onClick={() => track.onSelect?.(track)}
                  className="flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-lg">🎼</span>
                  <span className="truncate">{track.name || `Track ${index + 1}`}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* User Profile */}
      <div className="mt-auto">
        <UserProfile />
      </div>
      
      {/* Theme Toggle */}
      <div className={cn(
        "p-4 border-t",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <button
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center space-x-2 w-full p-2 rounded-md transition-colors",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          )}
        >
          <span className="text-lg">{isDarkMode ? "☀️" : "🌙"}</span>
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
        
        <div className={cn(
          "text-sm mt-4",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          Made by TCD SwEng2025 Group 10
        </div>
      </div>
    </div>
  );
};

export default AppSidebar; 