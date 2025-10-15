
import React from 'react';

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13-4-4m0 0l4-4m-4 4h12M17 19l4-4m0 0l-4-4m4 4H9" />
    </svg>
);
