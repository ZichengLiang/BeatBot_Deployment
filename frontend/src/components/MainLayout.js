import React from 'react';
import AppSidebar from './AppSidebar';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = ({ children, className }) => {
  const { isDarkMode } = useTheme();
  const { loading } = useAuth();

  // Show simple loading indicator while auth is being checked
  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center h-screen",
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-screen",
      isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Fixed width sidebar */}
      <div className="w-64 h-full fixed left-0 top-0 z-40 overflow-y-auto">
        <AppSidebar />
      </div>
      
      {/* Main content with padding for sidebar */}
      <main className={cn(
        "flex-1 ml-64 overflow-auto transition-colors",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 