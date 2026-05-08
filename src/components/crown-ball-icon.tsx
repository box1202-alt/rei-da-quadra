
import React from 'react';

export function CrownBallIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Coroa conforme a imagem: 3 pontas com bolinhas nas pontas */}
      <path 
        d="M22 38 L10 18 L35 28 L50 8 L65 28 L90 18 L78 38 H22Z" 
        fill="currentColor" 
      />
      <circle cx="10" cy="18" r="3.5" fill="currentColor" />
      <circle cx="50" cy="8" r="3.5" fill="currentColor" />
      <circle cx="90" cy="18" r="3.5" fill="currentColor" />
      
      {/* Bola de Areia com gomos característicos */}
      <circle cx="50" cy="72" r="26" stroke="currentColor" strokeWidth="4" />
      
      {/* Linhas internas da bola (trama de futevôlei/beach sports) */}
      <line x1="24" y1="72" x2="76" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="46" x2="50" y2="98" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Gomos curvos laterais */}
      <path 
        d="M38 50 Q45 72 38 94" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M62 50 Q55 72 62 94" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
  );
}
