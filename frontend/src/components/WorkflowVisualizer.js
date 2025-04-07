import React from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const WorkflowVisualizer = ({ currentState, isGreenMode }) => {
  const { isDarkMode } = useTheme();
  
  // Workflow steps in order
  const steps = [
    { id: 'start', title: 'Start' },
    { id: 'create_analysts', title: 'Creating Music Analysts' },
    { id: 'interview', title: 'Music Analysis' },
    { id: isGreenMode ? 'compose_final_music' : 'compose_sections', title: isGreenMode ? 'MIDI Generation' : 'Section Composition' },
    { id: isGreenMode ? '' : 'compose_final_music', title: isGreenMode ? '' : 'Notation Generation' },
    { id: 'end', title: 'Complete' },
  ].filter(step => step.title); // Filter out empty steps
  
  // If no state is set, show dormant workflow
  if (!currentState) {
    return (
      <div className={cn(
        "rounded-xl p-4",
        isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
      )}>
        <h3 className="text-sm font-medium mb-3">Music Generation Workflow</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "rounded-full h-8 w-8 flex items-center justify-center text-xs font-semibold mb-2",
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                )}>
                  {index + 1}
                </div>
                <span className="text-xs text-center max-w-[80px] truncate">{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-grow mx-1",
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
  
  // Get the index of the current step
  const currentIndex = steps.findIndex(step => step.id === currentState.currentStep);
  const isError = currentState.currentStep === 'error';
  
  return (
    <div className={cn(
      "rounded-xl p-4 transition-all duration-300",
      isDarkMode 
        ? isError ? "bg-red-900/20" : "bg-indigo-900/10" 
        : isError ? "bg-red-50" : "bg-indigo-50"
    )}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={cn(
          "text-sm font-medium",
          isDarkMode 
            ? isError ? "text-red-400" : "text-indigo-400" 
            : isError ? "text-red-700" : "text-indigo-700"
        )}>
          Music Generation Workflow
        </h3>
        
        {/* Add status text */}
        <div className={cn(
          "text-xs px-2 py-1 rounded-full",
          currentState.animating 
            ? "animate-pulse " + (isDarkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-200 text-indigo-800")
            : isError
              ? isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-200 text-red-800"
              : currentState.currentStep === 'end'
                ? isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-200 text-green-800"
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
        )}>
          {isError ? "Error" : currentState.animating ? "Processing..." : currentState.currentStep === 'end' ? "Completed" : "In Progress"}
        </div>
      </div>
      
      <div className="relative">
        {/* Progress bar that fills based on current step */}
        <div className={cn(
          "absolute top-4 left-0 h-0.5 transition-all duration-700",
          isDarkMode 
            ? isError ? "bg-red-500" : "bg-indigo-500" 
            : isError ? "bg-red-500" : "bg-indigo-500",
          currentState.animating && "animate-pulse"
        )} 
        style={{ 
          width: isError ? '100%' : currentState.currentStep === 'end' ? '100%' : `${(currentIndex / (steps.length - 1)) * 100}%`,
          zIndex: 1
        }}/>
        
        {/* Fixed background track */}
        <div className={cn(
          "absolute top-4 left-0 right-0 h-0.5",
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        )} />
        
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            // Determine if this step is current, completed, or upcoming
            const isCompleted = currentIndex > index || currentState.currentStep === 'end';
            const isCurrent = currentIndex === index;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "rounded-full h-8 w-8 flex items-center justify-center text-xs font-semibold mb-2 transition-all duration-300 relative z-10",
                    isError 
                      ? isDarkMode ? "bg-red-900 text-red-200" : "bg-red-200 text-red-800"
                      : isCompleted
                        ? isDarkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white" 
                        : isCurrent
                          ? isDarkMode ? "bg-indigo-800 text-indigo-200 shadow-md shadow-indigo-900/30" : "bg-indigo-100 text-indigo-800 shadow-md shadow-indigo-500/20"
                          : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500",
                    isCurrent && currentState.animating && "animate-pulse"
                  )}>
                    {/* Show checkmark for completed steps */}
                    {isCompleted && !isError ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      // Show error icon if there's an error
                      isError && index === steps.length - 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        index + 1
                      )
                    )}
                  </div>
                  <span className={cn(
                    "text-xs text-center max-w-[80px]",
                    isError 
                      ? isDarkMode ? "text-red-400" : "text-red-700"
                      : isCurrent
                        ? isDarkMode ? "text-indigo-300 font-medium" : "text-indigo-800 font-medium"
                        : isCompleted
                          ? isDarkMode ? "text-indigo-400" : "text-indigo-700"
                          : isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="h-0.5 flex-grow mx-1 bg-transparent relative z-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Status message */}
      <div className={cn(
        "mt-3 text-xs",
        isError
          ? isDarkMode ? "text-red-400" : "text-red-700"
          : isDarkMode ? "text-indigo-300" : "text-indigo-700"
      )}>
        <p>{currentState.stepDescription}</p>
      </div>
    </div>
  );
};

export default WorkflowVisualizer; 