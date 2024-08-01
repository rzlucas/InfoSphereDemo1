import React from 'react';
import './VideoBackground.css';

const VideoBackground = () => {
  return (
    <div className="video-background">
      <video autoPlay loop muted playsInline>
        <source src="/fondo.mp4" type="video/mp4" />
      </video>
      <div className="overlay"></div>
    </div>
  );
};

export default VideoBackground;
