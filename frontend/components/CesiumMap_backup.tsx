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
                    coordinates: [] as any // Allow array assignment
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

// Clean Cesium viewer component
const CesiumViewer: React.FC<CesiumMapProps> = ({
    onModelClick,
    onMapClick,
    geojsons,
}) => {
    const viewerRef = useRef<any>(null);
    const cesiumRef = useRef<any>(null);
    const geoJsonDataSourceRef = useRef<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isViewerReady, setIsViewerReady] = useState(false);
    const [displayMode, setDisplayMode] = useState<'polygon' | 'point'>('polygon');
    
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

        if (!vnGeo || !vnGeo.data) return;

        const loadGeoJson = async () => {
            try {
                setIsLoading(true);

                let processedData;
                let loadOptions;

                if (displayMode === 'point') {
                    processedData = convertToPoints(vnGeo.data);
                    loadOptions = {
                        markerSize: 24,
                        // markerSymbol: 'marker',
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

    // Add sample cities and click handlers
    // useEffect(() => {
    //     if (!isViewerReady || !viewerRef.current || !cesiumRef.current) return;

    //     const viewer = viewerRef.current;
    //     const Cesium = cesiumRef.current;

    //     const cities = [
    //         { name: 'Hà Nội', lon: 105.8342, lat: 21.0278, color: Cesium.Color.RED },
    //         { name: 'TP HCM', lon: 106.6602, lat: 10.7769, color: Cesium.Color.BLUE },
    //         { name: 'Đà Nẵng', lon: 108.2208, lat: 16.0544, color: Cesium.Color.GREEN },
    //     ];

    //     viewer.entities.removeAll();

    //     cities.forEach(city => {
    //         viewer.entities.add({
    //             name: city.name,
    //             position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
    //             point: {
    //                 pixelSize: 10,
    //                 color: city.color,
    //                 outlineColor: Cesium.Color.WHITE,
    //                 outlineWidth: 2,
    //                 heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    //             },
    //             label: {
    //                 text: city.name,
    //                 font: '12pt sans-serif',
    //                 pixelOffset: new Cesium.Cartesian2(0, -25),
    //                 fillColor: Cesium.Color.WHITE,
    //                 outlineColor: Cesium.Color.BLACK,
    //                 outlineWidth: 1,
    //                 style: Cesium.LabelStyle.FILL_AND_OUTLINE
    //             }
    //         });
    //     });

    //     // Set up click handler
    //     if (onMapClick) {
    //         const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //         handler.setInputAction((event: any) => {
    //             const cartesian = viewer.scene.pickPosition(event.position);
    //             if (Cesium.defined(cartesian)) {
    //                 const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    //                 const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    //                 const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //                 const altitude = cartographic.height;
    //                 onMapClick({ latitude, longitude, altitude });
    //             }
    //         }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            
    //         return () => {
    //             if (!handler.isDestroyed()) {
    //                 handler.destroy();
    //             }
    //         };
    //     }
    // }, [isViewerReady, onMapClick]);

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