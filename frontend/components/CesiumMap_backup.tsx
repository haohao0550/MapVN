'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface CesiumMapProps {
    className?: string;
    models?: any[];
    geojsons?: any[];
    onModelClick?: (model: any) => void;
    onMapClick?: (position: { latitude: number; longitude: number; altitude: number }) => void;
    show3DTiles?: boolean;
    enableProvinceHighlight?: boolean;
    provinceColors?: Record<string, string>;
    loadVietnamGeoJson?: boolean;
}

// Province info interface
interface ProvinceInfo {
    name: string;
    latitude: number;
    longitude: number;
    altitude: number;
    properties: Record<string, any>;
    position: { x: number; y: number };
}

// Robust GeoJSON sanitizer
const sanitizeGeoJsonRobust = (geojson: any) => {
    if (!geojson || !geojson.features) return geojson;

    const isValidCoordinate = (coord: any) => {
        return Array.isArray(coord) && 
               coord.length >= 2 && 
               typeof coord[0] === 'number' && 
               typeof coord[1] === 'number' &&
               !isNaN(coord[0]) && !isNaN(coord[1]) &&
               isFinite(coord[0]) && isFinite(coord[1]) &&
               coord[0] >= -180 && coord[0] <= 180 &&
               coord[1] >= -90 && coord[1] <= 90;
    };

    const removeDuplicates = (coords: any[]) => {
        if (!coords || coords.length < 2) return coords;
        
        const unique = [coords[0]];
        const tolerance = 0.0001;
        
        for (let i = 1; i < coords.length; i++) {
            const current = coords[i];
            const last = unique[unique.length - 1];
            
            if (!isValidCoordinate(current)) continue;
            
            const distance = Math.sqrt(
                Math.pow(current[0] - last[0], 2) + 
                Math.pow(current[1] - last[1], 2)
            );
            
            if (distance > tolerance) {
                unique.push(current);
            }
        }
        
        return unique;
    };

    const cleanRing = (ring: any[]) => {
        if (!Array.isArray(ring) || ring.length < 4) return null;
        
        const validCoords = ring.filter(isValidCoordinate);
        if (validCoords.length < 4) return null;
        
        const cleaned = removeDuplicates(validCoords);
        if (cleaned.length < 3) return null;
        
        const first = cleaned[0];
        const last = cleaned[cleaned.length - 1];
        const tolerance = 0.0001;
        
        if (Math.abs(first[0] - last[0]) > tolerance || Math.abs(first[1] - last[1]) > tolerance) {
            cleaned.push([first[0], first[1]]);
        }
        
        return cleaned.length >= 4 ? cleaned : null;
    };

    const validFeatures = [];
    
    for (const feature of geojson.features) {
        if (!feature || !feature.geometry || !feature.geometry.coordinates) continue;
        
        try {
            const geomType = feature.geometry.type;
            let isValid = false;
            const newFeature = {
                type: 'Feature',
                properties: feature.properties || {},
                geometry: {
                    type: geomType,
                    coordinates: [] as any
                }
            };
            
            if (geomType === 'Polygon') {
                const rings = feature.geometry.coordinates;
                const cleanedRings = [];
                
                for (const ring of rings) {
                    const cleanedRing = cleanRing(ring);
                    if (cleanedRing) {
                        cleanedRings.push(cleanedRing);
                    }
                }
                
                if (cleanedRings.length > 0) {
                    newFeature.geometry.coordinates = cleanedRings;
                    isValid = true;
                }
            } else if (geomType === 'MultiPolygon') {
                const polygons = feature.geometry.coordinates;
                const cleanedPolygons = [];
                
                for (const polygon of polygons) {
                    const cleanedRings = [];
                    for (const ring of polygon) {
                        const cleanedRing = cleanRing(ring);
                        if (cleanedRing) {
                            cleanedRings.push(cleanedRing);
                        }
                    }
                    if (cleanedRings.length > 0) {
                        cleanedPolygons.push(cleanedRings);
                    }
                }
                
                if (cleanedPolygons.length > 0) {
                    newFeature.geometry.coordinates = cleanedPolygons;
                    isValid = true;
                }
            } else if (geomType === 'Point') {
                if (isValidCoordinate(feature.geometry.coordinates)) {
                    newFeature.geometry.coordinates = feature.geometry.coordinates;
                    isValid = true;
                }
            }
            
            if (isValid) {
                validFeatures.push(newFeature);
            }
        } catch (error) {
            continue;
        }
    }
    
    return {
        type: 'FeatureCollection',
        features: validFeatures
    };
};

// Convert to points at centroids
const convertToPoints = (geojson: any) => {
    if (!geojson || !geojson.features) return geojson;
    
    const pointFeatures = geojson.features.map((feature: any, index: number) => {
        if (!feature || !feature.geometry) return null;
        
        let centroid = [105.8, 15.9];
        
        try {
            const geom = feature.geometry;
            if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates[0]) {
                const ring = geom.coordinates[0];
                if (ring.length > 0) {
                    const validCoords = ring.filter((coord: any) => 
                        Array.isArray(coord) && coord.length >= 2 && 
                        !isNaN(coord[0]) && !isNaN(coord[1])
                    );
                    
                    if (validCoords.length > 0) {
                        const avgLon = validCoords.reduce((sum: number, coord: any) => sum + coord[0], 0) / validCoords.length;
                        const avgLat = validCoords.reduce((sum: number, coord: any) => sum + coord[1], 0) / validCoords.length;
                        centroid = [avgLon, avgLat];
                    }
                }
            } else if (geom.type === 'MultiPolygon' && geom.coordinates && geom.coordinates[0] && geom.coordinates[0][0]) {
                const ring = geom.coordinates[0][0];
                if (ring.length > 0) {
                    const validCoords = ring.filter((coord: any) => 
                        Array.isArray(coord) && coord.length >= 2 && 
                        !isNaN(coord[0]) && !isNaN(coord[1])
                    );
                    
                    if (validCoords.length > 0) {
                        const avgLon = validCoords.reduce((sum: number, coord: any) => sum + coord[0], 0) / validCoords.length;
                        const avgLat = validCoords.reduce((sum: number, coord: any) => sum + coord[1], 0) / validCoords.length;
                        centroid = [avgLon, avgLat];
                    }
                }
            }
        } catch (error) {
            // Use default centroid
        }
        
        return {
            type: 'Feature',
            properties: {
                ...feature.properties,
                name: feature.properties?.name || feature.properties?.NAME || `Province ${index + 1}`,
                originalType: feature.geometry?.type || 'Unknown'
            },
            geometry: {
                type: 'Point',
                coordinates: centroid
            }
        };
    }).filter(Boolean);
    
    return {
        type: 'FeatureCollection',
        features: pointFeatures
    };
};

// Province Info Panel Component - Fixed at bottom left
const ProvinceInfoPanel: React.FC<{
    info: ProvinceInfo | null;
    onClose: () => void;
}> = ({ info, onClose }) => {
    return (
        <div className="absolute bottom-4 left-4 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
            {!info ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="text-sm">Click on a province to view information</p>
                </div>
            ) : (
                <>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        ✕
                    </button>

                    {/* Province name */}
                    <h3 className="font-bold text-lg text-gray-800 mb-3 pr-8">
                        📍 {info.name}
                    </h3>

                    {/* Coordinates */}
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Latitude:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {info.latitude.toFixed(4)}°
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Longitude:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {info.longitude.toFixed(4)}°
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Altitude:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {info.altitude.toFixed(0)}m
                            </span>
                        </div>
                    </div>

                    {/* Additional properties */}
                    {Object.keys(info.properties).length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                                ℹ️ Additional Information
                            </h4>
                            <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                                {Object.entries(info.properties).map(([key, value]) => {
                                    if (key === 'name' || key === 'NAME' || key === 'ten' || key === 'TEN') return null;
                                    return (
                                        <div key={key} className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium text-gray-600 capitalize mb-1">{key}:</div>
                                            <div className="font-mono text-gray-700 text-xs break-all">
                                                {String(value).substring(0, 100)}
                                                {String(value).length > 100 ? '...' : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Clean Cesium viewer component
const CesiumViewer: React.FC<CesiumMapProps> = ({
    onModelClick,
    onMapClick,
    geojsons,
}) => {
    const viewerRef = useRef<any>(null);
    const cesiumRef = useRef<any>(null);
    const geoJsonDataSourceRef = useRef<any>(null);
    const clickHandlerRef = useRef<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isViewerReady, setIsViewerReady] = useState(false);
    const [displayMode, setDisplayMode] = useState<'polygon' | 'point'>('polygon');
    const [provinceInfo, setProvinceInfo] = useState<ProvinceInfo | null>(null);
    
    const [cesiumContainerNode, setCesiumContainerNode] = useState<HTMLDivElement | null>(null);

    const measuredRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null) {
            setCesiumContainerNode(node);
        }
    }, []);

    // Initialize Cesium
    useEffect(() => {
        if (!cesiumContainerNode || viewerRef.current) return;

        let mounted = true;

        const initializeCesium = async () => {
            try {
                setIsLoading(true);
                
                const Cesium = await import('cesium');
                cesiumRef.current = Cesium;

                if (process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN) {
                    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN;
                }

                const viewer = new Cesium.Viewer(cesiumContainerNode, {
                    animation: false,
                    baseLayerPicker: false,
                    fullscreenButton: false,
                    geocoder: false,
                    homeButton: false,
                    infoBox: false,
                    sceneModePicker: false,
                    selectionIndicator: false,
                    timeline: false,
                    navigationHelpButton: false,
                    scene3DOnly: true,
                    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                });
                
                if (!mounted) { 
                    viewer.destroy(); 
                    return; 
                }

                viewerRef.current = viewer;

                // Set up imagery
                viewer.imageryLayers.removeAll(true);
                viewer.imageryLayers.addImageryProvider(
                    new Cesium.OpenStreetMapImageryProvider({
                        url: 'https://a.tile.openstreetmap.org/'
                    })
                );

                // Position camera over Vietnam
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(105.8, 15.9, 1500000),
                    duration: 1.0
                });
                
                setIsViewerReady(true);
                setIsLoading(false);

            } catch (err: any) {
                if (mounted) {
                    setError(`Failed to initialize map: ${err.message}`);
                    setIsLoading(false);
                }
            }
        };

        initializeCesium();

        return () => {
            mounted = false;
            if (clickHandlerRef.current && !clickHandlerRef.current.isDestroyed()) {
                clickHandlerRef.current.destroy();
            }
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
            }
            viewerRef.current = null;
            cesiumRef.current = null;
            setIsViewerReady(false);
        };
    }, [cesiumContainerNode]);

    // Load GeoJSON data
    useEffect(() => {
        if (!isViewerReady || !viewerRef.current || !cesiumRef.current) return;

        const viewer = viewerRef.current;
        const Cesium = cesiumRef.current;
        const vnGeo = Array.isArray(geojsons) ? geojsons.find(g => g.name === 'Vietnam Boundary') : null;

        // Remove existing data
        if (geoJsonDataSourceRef.current) {
            viewer.dataSources.remove(geoJsonDataSourceRef.current, true);
            geoJsonDataSourceRef.current = null;
        }

        // Remove existing click handler
        if (clickHandlerRef.current && !clickHandlerRef.current.isDestroyed()) {
            clickHandlerRef.current.destroy();
            clickHandlerRef.current = null;
        }

        if (!vnGeo || !vnGeo.data) return;

        console.log('Geojson data: ', vnGeo.data);

        const loadGeoJson = async () => {
            try {
                setIsLoading(true);

                let processedData;
                let loadOptions;

                if (displayMode === 'point') {
                    processedData = convertToPoints(vnGeo.data);
                    loadOptions = {
                        markerSize: 24,
                        markerColor: Cesium.Color.YELLOW,
                        clampToGround: true
                    };
                } else {
                    processedData = sanitizeGeoJsonRobust(vnGeo.data);
                    loadOptions = {
                        stroke: Cesium.Color.YELLOW,
                        fill: Cesium.Color.YELLOW.withAlpha(0.15),
                        strokeWidth: 2,
                        clampToGround: false,
                        extrudedHeight: 0
                    };
                }

                if (!processedData.features || processedData.features.length === 0) {
                    throw new Error('No valid features found');
                }

                const dataSource = await Cesium.GeoJsonDataSource.load(processedData, loadOptions);
                
                if (viewer && !viewer.isDestroyed()) {
                    viewer.dataSources.add(dataSource);
                    geoJsonDataSourceRef.current = dataSource;
                    
                    // Additional polygon styling
                    if (displayMode === 'polygon') {
                        const entities = dataSource.entities.values;
                        const provinceColors = [
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
                            '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#AED6F1',
                            '#A9DFBF', '#F9E79F', '#D7BDE2', '#A3E4D7', '#FAD7A0', '#D5A6BD', '#A9CCE3',
                            '#ABEBC6', '#F5B7B1', '#D6EAF8', '#A2D9CE', '#FCF3CF', '#E8DAEF', '#B2DFDB',
                            '#FFCDD2', '#E1F5FE', '#F3E5F5', '#E8F5E8', '#FFF3E0', '#F3E5F5'
                        ];

                        for (let i = 0; i < entities.length; i++) {
                            const entity = entities[i];
                            if (entity.polygon) {
                                const colorHex = provinceColors[i % provinceColors.length];
                                const fillColor = Cesium.Color.fromCssColorString(colorHex).withAlpha(0.8);
                                const outlineColor = Cesium.Color.fromCssColorString(colorHex).darken(0.4, new Cesium.Color());

                                entity.polygon.material = fillColor;
                                entity.polygon.outline = true;
                                entity.polygon.outlineColor = outlineColor;
                                entity.polygon.height = 0;
                                entity.polygon.extrudedHeight = undefined;
                            }
                        }
                    }
                    
                    // Set up click handler
                    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
                    clickHandlerRef.current = handler;
                    
                    handler.setInputAction((event: any) => {
                        const pickedObject = viewer.scene.pick(event.position);
                        
                        if (Cesium.defined(pickedObject) && pickedObject.id) {
                            const entity = pickedObject.id;
                            
                            // Close existing popup
                            setProvinceInfo(null);
                            
                            // Get properties
                            const properties = entity.properties;
                            // console.log("Property: ", properties);
                            let propsObj: { [key: string]: any } = {};

                            if (properties && properties.propertyNames) {
                                properties.propertyNames.forEach((key: string) => {
                                    // Truy cập property bằng cách thêm underscore prefix
                                    const propertyKey = `_${key}`;
                                    const property = properties[propertyKey];
                                    
                                    if (property && property._value !== undefined) {
                                        // Lấy giá trị từ _value của ConstantProperty
                                        propsObj[key] = property._value;
                                    } else if (property && property.value !== undefined) {
                                        // Fallback cho trường hợp không có _value
                                        propsObj[key] = property.value;
                                    } else {
                                        // Fallback cuối cùng
                                        propsObj[key] = property;
                                    }
                                });
                            }

                            console.log("Property: ", propsObj)
                            
                            // Get province name
                            let provinceName = propsObj.ten_tinh || 'Unknown Province';
                            
                            // Get coordinates
                            let latitude = propsObj.latitude ?? propsObj.lat ?? undefined;
                            let longitude = propsObj.longitude ?? propsObj.lon ?? undefined;
                            let altitude = propsObj.altitude ?? propsObj.height ?? 0;
                            
                            // If coordinates not available, compute from geometry
                            if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                                if (displayMode === 'polygon' && entity.polygon && entity.polygon.hierarchy) {
                                    const hierarchy = entity.polygon.hierarchy.getValue ? 
                                        entity.polygon.hierarchy.getValue() : entity.polygon.hierarchy;
                                    
                                    if (hierarchy && hierarchy.positions && hierarchy.positions.length > 0) {
                                        const cartographics = hierarchy.positions.map((pos: any) =>
                                            Cesium.Cartographic.fromCartesian(pos)
                                        );
                                        longitude = cartographics.reduce((sum: number, c: any) => 
                                            sum + Cesium.Math.toDegrees(c.longitude), 0) / cartographics.length;
                                        latitude = cartographics.reduce((sum: number, c: any) => 
                                            sum + Cesium.Math.toDegrees(c.latitude), 0) / cartographics.length;
                                        altitude = cartographics.reduce((sum: number, c: any) => 
                                            sum + c.height, 0) / cartographics.length;
                                    }
                                } else if (displayMode === 'point' && entity.position) {
                                    const position = entity.position.getValue ? 
                                        entity.position.getValue() : entity.position;
                                    const cartographic = Cesium.Cartographic.fromCartesian(position);
                                    longitude = Cesium.Math.toDegrees(cartographic.longitude);
                                    latitude = Cesium.Math.toDegrees(cartographic.latitude);
                                    altitude = cartographic.height;
                                }
                            }
                            
                            // Create info object
                            if (typeof latitude === 'number' && typeof longitude === 'number') {
                                const info: ProvinceInfo = {
                                    name: provinceName,
                                    latitude,
                                    longitude,
                                    altitude: altitude || 0,
                                    properties: propsObj,
                                    position: { x: 0, y: 0 } // Not needed for fixed panel
                                };
                                
                                setProvinceInfo(info);
                                
                                // Also call the original onMapClick if provided
                                if (onMapClick) {
                                    onMapClick({ latitude, longitude, altitude: altitude || 0 });
                                }
                            }
                        } else {
                            // Clicked on empty space, close popup
                            setProvinceInfo(null);
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    
                    setIsLoading(false);
                    setError(null);
                }

            } catch (err: any) {
                if (displayMode === 'polygon') {
                    // Auto-fallback to point mode
                    setDisplayMode('point');
                    return;
                }
                
                setError(`Failed to load map data: ${err.message}`);
                setIsLoading(false);
            }
        };

        loadGeoJson();

    }, [isViewerReady, geojsons, displayMode]);

    // Close popup when clicking outside
    const handleClosePopup = () => {
        setProvinceInfo(null);
    };

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
                <div className="text-center max-w-md p-6">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <p className="text-red-700 font-medium mb-2">Map Error</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <div className="space-x-3">
                        <button 
                            onClick={() => {setError(null); setDisplayMode('point');}}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Try Point Mode
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <div ref={measuredRef} className="w-full h-full" />
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto mb-4"></div>
                        <p className="text-white font-medium">Loading map...</p>
                    </div>
                </div>
            )}

            {displayMode === 'point' && !isLoading && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm z-20">
                    📍 Point View
                </div>
            )}

            <div className="absolute top-4 right-4 z-20">
                <select 
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    <option value="polygon">Boundary View</option>
                    <option value="point">Point View</option>
                </select>
            </div>

            {/* Province Info Panel - Fixed at bottom left */}
            <ProvinceInfoPanel 
                info={provinceInfo} 
                onClose={handleClosePopup}
            />
        </div>
    );
};

// Dynamic wrapper
const CesiumComponent = dynamic(
    () => Promise.resolve({ default: CesiumViewer }),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading Map...</p>
                </div>
            </div>
        )
    }
);

// Main component
const CesiumMap: React.FC<CesiumMapProps> = ({ className = '', ...props }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
                <div className="text-center">
                    <div className="animate-pulse">
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
                    </div>
                    <p className="text-gray-500 text-sm mt-3">Initializing...</p>
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