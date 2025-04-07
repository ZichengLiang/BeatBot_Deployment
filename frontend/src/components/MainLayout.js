import React from 'react';
import AppSidebar from './AppSidebar';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = ({ children, className }) => {
  const { isDarkMode } = useTheme();

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