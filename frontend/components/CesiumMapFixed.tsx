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
  const [isLoading, setIsLoading] = useState(true);
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

    console.log(`Loading ${models.length} models...`);

    // Clear existing models
    modelsRef.current.forEach(model => {
      if (model && typeof model.isDestroyed === 'function' && !model.isDestroyed()) {
        if (model.primitive) {
          viewerRef.current.scene.primitives.remove(model.primitive);
        } else {
          viewerRef.current.entities.remove(model);
        }
      }
    });
    modelsRef.current = [];

    // Load new models as 3D Tilesets
    for (const model of models) {
      try {
        console.log(`Loading 3D Tiles model: ${model.name} from ${model.tilesetUrl || model.url}`);
        
        const tilesetUrl = model.tilesetUrl || model.url;
        
        // Create tileset with error handling
        console.log(`Creating tileset for URL: ${tilesetUrl}`);
        
        // Test URL accessibility first
        try {
          const testResponse = await fetch(tilesetUrl);
          if (!testResponse.ok) {
            console.error(`Tileset URL not accessible: ${tilesetUrl}, status: ${testResponse.status}`);
            continue;
          }
          console.log(`Tileset URL accessible: ${tilesetUrl}`);
        } catch (fetchError) {
          console.error(`Failed to fetch tileset from ${tilesetUrl}:`, fetchError);
          continue;
        }

        let tileset;
        try {
          // Use constructor method with proper error handling
          tileset = new Cesium.Cesium3DTileset({
            url: tilesetUrl,
            debugShowBoundingVolume: false,
            debugShowContentBoundingVolume: false,
          });
          
          console.log(`Tileset created successfully for ${model.name}`);
        } catch (tilesetError) {
          console.error(`Error creating tileset for ${model.name}:`, tilesetError);
          continue;
        }

        if (!tileset) {
          console.error(`Failed to create tileset for ${model.name}`);
          continue;
        }

        // Add to scene
        const addedTileset = viewerRef.current.scene.primitives.add(tileset);
        console.log(`Tileset added to scene: ${model.name}`);

        // Store reference for cleanup
        const modelRef = {
          primitive: addedTileset,
          modelData: model,
          name: model.name,
          isDestroyed: () => addedTileset ? addedTileset.isDestroyed() : true
        };
        
        modelsRef.current.push(modelRef);

        // Wait for tileset to load
        if (addedTileset && addedTileset.readyPromise) {
          try {
            await addedTileset.readyPromise;
            console.log(`3D Tiles loaded successfully: ${model.name}`);
            
            // Optional: Fly to the tileset if it's the only one
            if (models.length === 1) {
              await viewerRef.current.zoomTo(addedTileset);
              console.log(`Zoomed to tileset: ${model.name}`);
            }
          } catch (readyError) {
            console.error(`Error waiting for tileset ${model.name}:`, readyError);
          }
        }

        console.log(`Added 3D Tiles: ${model.name} at ${model.longitude}, ${model.latitude}`);
      } catch (error) {
        console.error(`Error loading 3D Tiles ${model.name}:`, error);
      }
    }
  }, [models]);

  // Check WebGL support
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeCesium = async () => {
      if (!cesiumContainerRef.current || !mounted) return;

      try {
        console.log('Checking WebGL support...');
        
        if (!checkWebGLSupport()) {
          setError('WebGL is not supported in this browser. Please update your browser or graphics drivers.');
          setIsLoading(false);
          return;
        }

        console.log('WebGL supported, initializing Cesium viewer...');
        
        // Import Cesium with better error handling
        const Cesium = await import('cesium');
        
        if (!mounted) return;

        console.log('Cesium imported successfully');

        // Set Ion token if available
        if (process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN) {
          Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN;
          console.log('Ion token set');
        }

        // Create enhanced viewer with WebGL context options
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
          selectionIndicator: true,
          contextOptions: {
            webgl: {
              alpha: false,
              depth: true,
              stencil: false,
              antialias: true,
              powerPreference: "high-performance",
              premultipliedAlpha: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false
            }
          }
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
          viewerRef.current.cesiumWidget.canvas.addEventListener('click', (event: MouseEvent) => {
            const pickedObject = viewerRef.current.scene.pick(new Cesium.Cartesian2(event.clientX, event.clientY));
            
            if (Cesium.defined(pickedObject)) {
              // Find associated model data
              const clickedModel = modelsRef.current.find(model => 
                model.primitive === pickedObject.primitive
              );
              
              if (clickedModel) {
                onModelClick(clickedModel.modelData);
              }
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
        await loadModels(Cesium);

        setIsLoading(false);
        console.log('Enhanced Cesium viewer created and positioned');

      } catch (err) {
        console.error('Failed to create Cesium viewer:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
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
    if (viewerRef.current && !isLoading) {
      import('cesium').then((Cesium) => {
        loadModels(Cesium);
      });
    }
  }, [models, loadModels, isLoading]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4 text-4xl">❌</div>
          <p className="text-red-700 font-medium text-lg">Map Load Failed</p>
          <p className="text-red-600 text-sm mt-2 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50">
        <div className="text-center p-8">
          <div className="animate-spin text-blue-500 mb-4 text-4xl">🌍</div>
          <p className="text-blue-700 font-medium">Loading 3D Map...</p>
          <p className="text-blue-600 text-sm mt-1">Initializing WebGL and Cesium viewer</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cesiumContainerRef}
      className="w-full h-full"
      style={{ background: '#1e293b' }}
    />
  );
};

// Use dynamic import to avoid SSR issues
const CesiumMapComponent = dynamic(() => Promise.resolve(SimpleCesiumViewer), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-pulse text-4xl mb-4">🗺️</div>
        <p className="text-gray-600">Loading Map Component...</p>
      </div>
    </div>
  ),
});

export default CesiumMapComponent;
