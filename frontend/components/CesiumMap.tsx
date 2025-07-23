'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface CesiumMapProps {
  className?: string;
  models?: any[];
  geojsons?: any[];
  onModelClick?: (model: any) => void;
  onMapClick?: (position: { latitude: number; longitude: number; altitude: number }) => void;
}

// ===== SIMPLE CESIUM VIEWER =====
const SimpleCesiumViewer: React.FC<CesiumMapProps> = ({
  models = [],
  geojsons = [],
  onModelClick,
  onMapClick
}) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeCesium = () => {
      if (!cesiumContainerRef.current || !mounted) return;

      try {
        console.log('Initializing simple Cesium viewer...');
        
        // Import Cesium directly
        import('cesium').then((Cesium) => {
          if (!mounted) return;

          console.log('Cesium imported successfully');

          // Set Ion token if available
          if (process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN) {
            Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN;
            console.log('Ion token set');
          }

          // Create simple viewer
          viewerRef.current = new Cesium.Viewer(cesiumContainerRef.current!, {
            homeButton: false,
          });   

          // Fly to Vietnam
          viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(105.8542, 21.0285, 2000000)
          });

          console.log('Cesium viewer created and positioned');

        }).catch((err) => {
          console.error('Failed to import Cesium:', err);
          setError('Failed to load Cesium library');
        });

      } catch (err) {
        console.error('Error in initializeCesium:', err);
        setError('Failed to initialize map');
      }
    };

    // Start initialization after a short delay
    initTimeout = setTimeout(initializeCesium, 500);

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-red-700 font-medium">Map Load Failed</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cesiumContainerRef} 
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// ===== DYNAMIC WRAPPER =====
const CesiumComponent = dynamic(
  () => Promise.resolve({ default: SimpleCesiumViewer }),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Map Component...</p>
        </div>
      </div>
    )
  }
);

// ===== MAIN COMPONENT =====
const CesiumMap: React.FC<CesiumMapProps> = ({ className = '', ...props }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <CesiumComponent {...props} />
    </div>
  );
};

export default CesiumMap;
export type { CesiumMapProps };
