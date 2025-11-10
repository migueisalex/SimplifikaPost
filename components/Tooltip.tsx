import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // By checking for text in the event handler, we prevent an unnecessary state update
  // and re-render cycle when there's no tooltip to display. This can prevent
  // subtle visual glitches.
  const handleMouseEnter = () => {
    if (text) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div 
          className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-90 dark:bg-gray-700 whitespace-nowrap z-10"
          role="tooltip"
        >
          {text}
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-gray-900 dark:border-l-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
