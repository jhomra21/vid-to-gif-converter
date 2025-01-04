import React from 'react';

const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundPosition: '50% 50%',
          backgroundSize: '16px 16px',
          maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
        }}
      />
    </div>
  );
};

export default BackgroundPattern; 