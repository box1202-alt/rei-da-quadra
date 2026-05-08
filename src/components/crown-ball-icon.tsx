
import React from 'react';

export function CrownBallIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <circle cx="12" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14C12 14 10 12 8 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M16 14C16 14 14 12 12 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 14L12 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M7 6L5 9H19L17 6L14.5 8L12 4L9.5 8L7 6Z" fill="currentColor" />
    </svg>
  );
}
