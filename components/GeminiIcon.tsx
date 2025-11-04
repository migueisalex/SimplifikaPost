import React from 'react';

const GeminiIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={className} 
        fill="currentColor"
    >
        <path d="M12 0C11.1719 5.10938 8.10938 8.17188 3 9C8.10938 9.82812 11.1719 12.8906 12 18C12.8281 12.8906 15.8906 9.82812 21 9C15.8906 8.17188 12.8281 5.10938 12 0Z"></path>
    </svg>
);

export default GeminiIcon;
