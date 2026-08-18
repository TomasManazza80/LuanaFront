import React from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

// Import required CSS for the viewer
import '@photo-sphere-viewer/core/index.css';

interface VirtualTourViewerProps {
  url: string;
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({ url }) => {
  if (!url) return null;

  // Simple heuristic to determine if the URL is an image (ends with image extension or hosted in imagekit)
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url) || url.includes('ik.imagekit.io');

  return (
    <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden shadow-lg border border-gray-200/20 bg-gray-900/50 backdrop-blur-sm relative group z-0">
      {/* Skeleton / Loading state (underneath iframe/viewer) */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      
      {isImage ? (
        <div className="w-full h-full relative z-10">
          <ReactPhotoSphereViewer
            src={url}
            height={"100%"}
            width={"100%"}
          />
        </div>
      ) : (
        <iframe
          src={url}
          title="Recorrido Virtual 3D"
          className="w-full h-full border-0 relative z-10"
          allowFullScreen
          allow="xr-spatial-tracking; vr; gyroscope; accelerometer; fullscreen; autoplay"
          loading="lazy"
        ></iframe>
      )}
      
      {/* Subtle overlay effect that disappears on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-20"></div>
    </div>
  );
};
