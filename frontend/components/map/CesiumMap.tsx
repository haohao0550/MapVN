'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

export interface CameraPosition {
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
  onRegionClick?: (regionInfo: any) => void; // New prop for region clicks
  flyToModel?: string; // Model ID to fly to
}

// Helper function to validate and clean GeoJSON data
const validateAndCleanGeoJSON = (geoJsonData: any) => {
  if (!geoJsonData || !geoJsonData.features) {
    return geoJsonData;
  }

  const cleanedFeatures = geoJsonData.features.filter((feature: any) => {
    if (!feature.geometry || !feature.geometry.coordinates) {
      return false;
    }

    // Check for valid coordinates
    const validateCoordinates = (coords: any): boolean => {
      if (!Array.isArray(coords)) return false;
      
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        // Single coordinate pair
        return !isNaN(coords[0]) && !isNaN(coords[1]) && 
               Math.abs(coords[0]) <= 180 && Math.abs(coords[1]) <= 90;
      }
      
      // Array of coordinates
      return coords.every((coord: any) => validateCoordinates(coord));
    };

    // Validate geometry type
    const geometry = feature.geometry;
    switch (geometry.type) {
      case 'Point':
        return validateCoordinates(geometry.coordinates);
      case 'LineString':
        return geometry.coordinates.length >= 2 && validateCoordinates(geometry.coordinates);
      case 'Polygon':
        return geometry.coordinates.every((ring: any) => 
          ring.length >= 4 && validateCoordinates(ring) &&
          // Check that first and last points are the same (closed ring)
          ring[0][0] === ring[ring.length - 1][0] && 
          ring[0][1] === ring[ring.length - 1][1]
        );
      case 'MultiPolygon':
        return geometry.coordinates.every((polygon: any) =>
          polygon.every((ring: any) => 
            ring.length >= 4 && validateCoordinates(ring) &&
            ring[0][0] === ring[ring.length - 1][0] && 
            ring[0][1] === ring[ring.length - 1][1]
          )
        );
      default:
        return true;
    }
  });

  return {
    ...geoJsonData,
    features: cleanedFeatures
  };
};

// ===== SIMPLE CESIUM VIEWER =====
const SimpleCesiumViewer: React.FC<CesiumMapProps> = ({
  models = [],
  geojsons = [],
  onModelClick,
  onMapClick,
  onCameraMove,
  onRegionClick,
  flyToModel
}) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const modelsRef = useRef<any[]>([]);
  const geoJsonDataSourcesRef = useRef<any[]>([]);

  // Debug: Log models prop changes
  useEffect(() => {
    console.log('CesiumMap models prop changed:', models);
    console.log('Models count:', models.length);
    if (models.length > 0) {
      console.log('First model:', models[0]);
    }
  }, [models]);

  const flyToModelById = useCallback(async (modelId: string, Cesium: any) => {
    if (!viewerRef.current || !modelId) return;

    // Find the model in our refs
    const modelRef = modelsRef.current.find(ref => ref.modelData.id === modelId);
    if (modelRef && modelRef.primitive) {
      try {
        console.log(`Flying to model: ${modelRef.name}`);
        await viewerRef.current.zoomTo(modelRef.primitive, new Cesium.HeadingPitchRange(0.0, -0.3, 100.0));
        console.log(`Successfully flew to model: ${modelRef.name}`);
      } catch (error) {
        console.error(`Error flying to model ${modelRef.name}:`, error);
      }
    } else {
      // If not found in primitives, try to fly to model coordinates
      const model = models.find(m => m.id === modelId);
      if (model) {
        try {
          console.log(`Flying to model coordinates: ${model.name} at ${model.longitude}, ${model.latitude}`);
          await viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              model.longitude, 
              model.latitude, 
              model.height + 1000 // Add 1000m height for better view
            ),
            duration: 3.0
          });
          console.log(`Successfully flew to model coordinates: ${model.name}`);
        } catch (error) {
          console.error(`Error flying to model coordinates ${model.name}:`, error);
        }
      }
    }
  }, [models]);

  const loadGeoJSONs = useCallback(async (Cesium: any) => {
    if (!viewerRef.current || !geojsons.length) {
      console.log('No viewer or GeoJSONs to load');
      return;
    }

    console.log(`Loading ${geojsons.length} GeoJSON layers...`);

    // Clear existing GeoJSON data sources
    geoJsonDataSourcesRef.current.forEach(dataSource => {
      if (dataSource && !dataSource.isDestroyed) {
        viewerRef.current.dataSources.remove(dataSource);
      }
    });
    geoJsonDataSourcesRef.current = [];

    // Load new GeoJSON data
    for (const geoJsonItem of geojsons) {
      try {
        console.log(`Loading GeoJSON: ${geoJsonItem.name}`);
        
        // Validate and clean GeoJSON data
        const cleanedData = validateAndCleanGeoJSON(geoJsonItem.data);
        
        const dataSource = await Cesium.GeoJsonDataSource.load(cleanedData, {
          name: geoJsonItem.name,
          stroke: Cesium.Color.fromCssColorString(geoJsonItem.color || '#3B82F6'),
          fill: Cesium.Color.fromCssColorString(geoJsonItem.color || '#3B82F6').withAlpha(0.3),
          strokeWidth: 2,
          clampToGround: true
        });

        // Add region information to entities for click handling
        const entities = dataSource.entities.values;
        for (const entity of entities) {
          entity.properties = entity.properties || new Cesium.PropertyBag();
          entity.properties.regionType = geoJsonItem.type;
          entity.properties.regionName = geoJsonItem.name;
          entity.properties.regionColor = geoJsonItem.color;
          
          // Get region data from GeoJSON properties
          if (entity.properties && entity.properties.propertyNames) {
            const props: Record<string, any> = {};
            entity.properties.propertyNames.forEach((propName: string) => {
              props[propName] = entity.properties[propName];
            });
            entity.properties.regionData = props;
          }
        }

        viewerRef.current.dataSources.add(dataSource);
        geoJsonDataSourcesRef.current.push(dataSource);
        
        console.log(`GeoJSON loaded successfully: ${geoJsonItem.name}`);
      } catch (error) {
        console.error(`Error loading GeoJSON ${geoJsonItem.name}:`, error);
      }
    }
  }, [geojsons]);

  // Debug: Log geojsons prop changes
  useEffect(() => {
    console.log('CesiumMap geojsons prop changed:', geojsons);
    console.log('GeoJSONs count:', geojsons.length);
  }, [geojsons]);

  // Handle flyToModel prop changes
  useEffect(() => {
    if (flyToModel && viewerRef.current) {
      import('cesium').then((Cesium) => {
        flyToModelById(flyToModel, Cesium);
      });
    }
  }, [flyToModel, flyToModelById]);

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
    if (!viewerRef.current || !models.length) {
      console.log('No viewer or models to load');
      return;
    }

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

    // Load new models as 3D Tilesets using Cesium pattern
    for (const model of models) {
      try {
        console.log(`Loading 3D Tiles model: ${model.name} from ${model.tilesetUrl || model.url}`);
        
        const tilesetUrl = model.tilesetUrl || model.url;
        
        // Ensure full URL
        const fullUrl = tilesetUrl.startsWith('http') 
          ? tilesetUrl 
          : `http://localhost:4000${tilesetUrl}`;
        
        console.log(`Full tileset URL: ${fullUrl}`);

        // Use Cesium.Cesium3DTileset.fromUrl pattern like in Sandcastle
        let tileset;
        try {
          tileset = await Cesium.Cesium3DTileset.fromUrl(fullUrl, {
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

        // Add to scene like in Sandcastle
        viewerRef.current.scene.primitives.add(tileset);
        console.log(`Tileset added to scene: ${model.name}`);

        // Store reference for cleanup
        const modelRef = {
          primitive: tileset,
          modelData: model,
          name: model.name,
          isDestroyed: () => tileset ? tileset.isDestroyed() : true
        };
        
        modelsRef.current.push(modelRef);

        // Zoom to tileset like in Sandcastle
        try {
          await viewerRef.current.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.3, 0.0));
          console.log(`Zoomed to tileset: ${model.name}`);
        } catch (zoomError) {
          console.error(`Error zooming to tileset ${model.name}:`, zoomError);
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

        // Handle model clicks and region clicks
        if (onModelClick || onRegionClick) {
          viewerRef.current.cesiumWidget.canvas.addEventListener('click', (event: MouseEvent) => {
            const pickedObject = viewerRef.current.scene.pick(new Cesium.Cartesian2(event.clientX, event.clientY));
            
            if (Cesium.defined(pickedObject)) {
              // Check if it's a model
              const clickedModel = modelsRef.current.find(model => 
                model.primitive === pickedObject.primitive
              );
              
              if (clickedModel && onModelClick) {
                onModelClick(clickedModel.modelData);
                return;
              }

              // Check if it's a GeoJSON entity (region)
              if (pickedObject.id && pickedObject.id.properties && onRegionClick) {
                const entity = pickedObject.id;
                const properties = entity.properties;
                
                if (properties.regionType && properties.regionName) {
                  const regionInfo = {
                    type: properties.regionType.getValue(),
                    name: properties.regionName.getValue(),
                    color: properties.regionColor.getValue(),
                    data: properties.regionData ? properties.regionData.getValue() : {},
                    entity: entity
                  };
                  
                  onRegionClick(regionInfo);
                }
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

        // Load models and GeoJSONs
        await loadModels(Cesium);
        await loadGeoJSONs(Cesium);

        console.log('Enhanced Cesium viewer created and positioned');

      } catch (err) {
        console.error('Failed to create Cesium viewer:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
  }, [onCameraMove, onMapClick, onModelClick, onRegionClick, getCameraPosition, loadModels, loadGeoJSONs]);

  // Update models when models prop changes
  useEffect(() => {
    if (viewerRef.current) {
      import('cesium').then((Cesium) => {
        loadModels(Cesium);
      });
    }
  }, [models, loadModels]);

  // Update GeoJSONs when geojsons prop changes
  useEffect(() => {
    if (viewerRef.current) {
      import('cesium').then((Cesium) => {
        loadGeoJSONs(Cesium);
      });
    }
  }, [geojsons, loadGeoJSONs]);

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
  ssr: false
});

export default CesiumMapComponent;
