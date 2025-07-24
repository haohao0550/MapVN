'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface CameraPosition {
  longitude: number;
  latitude: number;
  height: number;
}

interface CesiumMapProps {
  className?: string;
  models?: any[];
  geojsons?: any[];
  onModelClick?: (model: any) => void;
  onMapClick?: (position: { latitude: number; longitude: number; altitude: number }) => void;
  onCameraMove?: (position: CameraPosition) => void;
}

// ===== SIMPLE CESIUM VIEWER =====
const SimpleCesiumViewer: React.FC<CesiumMapProps> = ({
  models = [],
  geojsons = [],
  onModelClick,
  onMapClick,
  onCameraMove
}) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const modelsRef = useRef<any[]>([]);

  const getCameraPosition = useCallback(() => {
    if (!viewerRef.current) return null;
    
    const camera = viewerRef.current.camera;
    const position = camera.positionCartographic;
    
    return {
      longitude: position.longitude * (180 / Math.PI),
      latitude: position.latitude * (180 / Math.PI),
      height: position.height
    };
  }, []);

  const loadModels = useCallback(async (Cesium: any) => {
    if (!viewerRef.current || !models.length) return;

    // Clear existing models
    modelsRef.current.forEach(model => {
      if (model && !model.isDestroyed()) {
        viewerRef.current.entities.remove(model);
      }
    });
    modelsRef.current = [];

    // Load new models
    for (const model of models) {
      try {
        const position = Cesium.Cartesian3.fromDegrees(
          model.longitude,
          model.latitude,
          model.height
        );

        const heading = Cesium.Math.toRadians(model.heading || 0);
        const pitch = Cesium.Math.toRadians(model.pitch || 0);
        const roll = Cesium.Math.toRadians(model.roll || 0);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));

        const entity = viewerRef.current.entities.add({
          name: model.name,
          position: position,
          orientation: orientation,
          model: {
            uri: model.url,
            scale: model.scale || 1.0,
            minimumPixelSize: 128,
            maximumScale: 20000
          },
          properties: model
        });

        modelsRef.current.push(entity);
        console.log(`Loaded model: ${model.name} at ${model.longitude}, ${model.latitude}`);
      } catch (error) {
        console.error(`Error loading model ${model.name}:`, error);
      }
    }
  }, [models]);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeCesium = () => {
      if (!cesiumContainerRef.current || !mounted) return;

      try {
        console.log('Initializing enhanced Cesium viewer...');
        
        // Import Cesium directly
        import('cesium').then((Cesium) => {
          if (!mounted) return;

          console.log('Cesium imported successfully');

          // Set Ion token if available
          if (process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN) {
            Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN;
            console.log('Ion token set');
          }

          // Create enhanced viewer
          viewerRef.current = new Cesium.Viewer(cesiumContainerRef.current!, {
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            vrButton: false,
            geocoder: false,
            infoBox: true,
            selectionIndicator: true
          });

          // Fly to Vietnam
          viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(105.8542, 21.0285, 2000000)
          });

          // Handle camera movement
          if (onCameraMove) {
            viewerRef.current.camera.moveEnd.addEventListener(() => {
              const position = getCameraPosition();
              if (position) {
                onCameraMove(position);
              }
            });
          }

          // Handle model clicks
          if (onModelClick) {
            viewerRef.current.selectedEntityChanged.addEventListener((selectedEntity: any) => {
              if (selectedEntity && selectedEntity.properties) {
                onModelClick(selectedEntity.properties);
              }
            });
          }

          // Handle map clicks
          if (onMapClick) {
            viewerRef.current.cesiumWidget.canvas.addEventListener('click', (event: MouseEvent) => {
              const pick = viewerRef.current.camera.getPickRay(new Cesium.Cartesian2(event.clientX, event.clientY));
              const intersection = viewerRef.current.scene.globe.pick(pick, viewerRef.current.scene);
              
              if (intersection) {
                const cartographic = Cesium.Cartographic.fromCartesian(intersection);
                onMapClick({
                  latitude: cartographic.latitude * (180 / Math.PI),
                  longitude: cartographic.longitude * (180 / Math.PI),
                  altitude: cartographic.height
                });
              }
            });
          }

          // Load models
          loadModels(Cesium);

          console.log('Enhanced Cesium viewer created and positioned');

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
  }, [onCameraMove, onMapClick, onModelClick, getCameraPosition, loadModels]);

  // Update models when models prop changes
  useEffect(() => {
    if (viewerRef.current) {
      import('cesium').then((Cesium) => {
        loadModels(Cesium);
      });
    }
  }, [models, loadModels]);

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
export type { CesiumMapProps, CameraPosition };
