import React, { useState } from 'react';

function ImageLoader({ src, alt, className, width, height }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={`image-loader-container ${!isLoaded ? 'skeleton-image' : ''} ${className || ''}`}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : '100%', 
        position: 'relative'
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}

export default ImageLoader;
