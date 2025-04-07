import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // Default avatar if user doesn't have one
  const avatar = user?.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  
  // Use user's full name or email as fallback
  const displayName = user?.user_metadata?.full_name || user?.email || 'Guest';
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className={cn(
        "p-4 border-t flex justify-center", 
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <button
          onClick={() => navigate('/login')}
          className={cn(
            "flex items-center space-x-2 p-2 rounded-md transition-colors",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          )}
        >
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 border-t", 
      isDarkMode ? "border-gray-800" : "border-gray-200"
    )}>
      <div className="flex items-center space-x-3">
        <img 
          src={avatar} 
          alt="User avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
        />
        <div className="overflow-hidden">
          <p className={cn(
            "font-medium truncate max-w-[180px]",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>
            {displayName}
          </p>
          <p className={cn(
            "text-xs truncate max-w-[180px]",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {user.email}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className={cn(
          "w-full mt-3 px-3 py-2 text-sm rounded-md text-left transition-colors flex items-center space-x-2",
          isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
        )}
      >
        <span> | 🎶 Sign out 🎵 :|</span>
      </button>
    </div>
  );
};

export default UserProfile; 