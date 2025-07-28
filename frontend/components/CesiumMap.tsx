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
    // New props for dynamic API integration
    apiBaseUrl?: string; // e.g., '/api/geojsons'
    availableProvinces?: Array<{ id: string; name: string; }>; // List of provinces with their IDs
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
    apiBaseUrl = '/api/geojsons',
    availableProvinces = []
}) => {
    // Auto-generate available provinces from geojsons if not provided
    const computedAvailableProvinces = React.useMemo(() => {
        if (availableProvinces.length > 0) {
            return availableProvinces;
        }
        
        // Extract provinces from geojsons (exclude 'Viet_Nam' as it's for TinhThanh mode)
        if (Array.isArray(geojsons)) {
            return geojsons
                .filter(g => g.name && g.name !== 'Viet_Nam' && (g.data || g.geojson))
                .map(g => ({
                    id: String(g.id || g.name), // Ensure ID is always string
                    name: g.name,
                    originalItem: g // Keep reference to original item for debugging
                }));
        }
        
        return [];
    }, [geojsons, availableProvinces]);

    const viewerRef = useRef<any>(null);
    const cesiumRef = useRef<any>(null);
    const geoJsonDataSourceRef = useRef<any>(null);
    const clickHandlerRef = useRef<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isViewerReady, setIsViewerReady] = useState(false);
    const [viewMode, setViewMode] = useState<'TinhThanh' | 'XaPhuong'>('TinhThanh');
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [provinceInfo, setProvinceInfo] = useState<ProvinceInfo | null>(null);
    const [loadingXaPhuong, setLoadingXaPhuong] = useState<boolean>(false);
    
    // Track if data has been loaded to prevent re-loading
    const [dataLoadedFor, setDataLoadedFor] = useState<string>('');
    
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

    // Handle view mode change
    const handleViewModeChange = (newViewMode: 'TinhThanh' | 'XaPhuong') => {
        setViewMode(newViewMode);
        setDataLoadedFor(''); // Reset data loaded tracker
        // Reset selected province when switching modes
        if (newViewMode === 'XaPhuong' && computedAvailableProvinces.length > 0) {
            setSelectedProvinceId(computedAvailableProvinces[0].id);
        } else {
            setSelectedProvinceId('');
        }
    };

    // Fetch GeoJSON data by ID from API or from local geojsons
    const fetchGeoJsonById = async (id: string) => {
        try {
            console.log(`Looking for GeoJSON with ID: ${id}`);
            console.log('Available geojsons:', geojsons?.map(g => ({ 
                id: g.id, 
                name: g.name, 
                hasData: !!(g.data || g.geojson),
                keys: Object.keys(g)
            })));
            
            // First check if data is already in geojsons array
            // Try to match by ID first, then by name, then by string/number conversion
            const localGeoJson = Array.isArray(geojsons) ? 
                geojsons.find(g => {
                    // Direct ID match
                    if (g.id === id) return true;
                    // String/number ID match  
                    if (String(g.id) === String(id)) return true;
                    // Name match (fallback)
                    if (g.name === id) return true;
                    return false;
                }) : null;
                
            if (localGeoJson) {
                // Try different possible data field names
                const geoJsonData = localGeoJson.data || localGeoJson.geojson || localGeoJson.geometry;
                
                if (geoJsonData) {
                    console.log(`Using local GeoJSON data for ${id}:`, geoJsonData);
                    return {
                        ...localGeoJson,
                        data: geoJsonData
                    };
                } else {
                    console.log(`Local item found for ${id} but no valid data field:`, Object.keys(localGeoJson));
                }
            }
            
            console.log(`No local data found for ID: ${id}, fetching from API...`);
            
            // If not found locally, fetch from API
            const response = await fetch(`${apiBaseUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch GeoJSON: ${response.statusText} (${response.status})`);
            }
            const data = await response.json();
            console.log(`API response for ID ${id}:`, data);
            return data.success ? data.data : data;
        } catch (error) {
            console.error(`Error fetching GeoJSON for ID ${id}:`, error);
            throw error;
        }
    };

    // Memoize click handlers to prevent recreating them
    const setupTinhThanhClickHandler = useCallback(() => {
        if (!viewerRef.current || !cesiumRef.current) return;
        
        console.log("setupTinhThanhClickHandler");
        const viewer = viewerRef.current;
        const Cesium = cesiumRef.current;
        
        // Remove existing handler first
        if (clickHandlerRef.current && !clickHandlerRef.current.isDestroyed()) {
            clickHandlerRef.current.destroy();
        }
        
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        clickHandlerRef.current = handler;
        
        handler.setInputAction((event: any) => {
            const pickedObject = viewer.scene.pick(event.position);
            
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                const entity = pickedObject.id;
                
                // Get properties
                const properties = entity.properties;
                let propsObj: { [key: string]: any } = {};
                
                if (properties && properties.propertyNames) {
                    properties.propertyNames.forEach((key: string) => {
                        const propertyKey = `_${key}`;
                        const property = properties[propertyKey];
                        
                        if (property && property._value !== undefined) {
                            propsObj[key] = property._value;
                        } else if (property && property.value !== undefined) {
                            propsObj[key] = property.value;
                        } else {
                            propsObj[key] = property;
                        }
                    });
                }

                console.log("TinhThanh Properties: ", propsObj);
                
                // Get province name
                let provinceName = propsObj.ten_tinh || 'Unknown Province';
                
                // Get coordinates from polygon geometry
                let latitude: number, longitude: number, altitude = 0;
                
                if (entity.polygon && entity.polygon.hierarchy) {
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
                }
                
                // Create info object
                if (typeof latitude! === 'number' && typeof longitude! === 'number') {
                    const info: ProvinceInfo = {
                        name: provinceName,
                        latitude: latitude!,
                        longitude: longitude!,
                        altitude: altitude || 0,
                        properties: propsObj,
                        position: { x: 0, y: 0 }
                    };
                    
                    setProvinceInfo(info);
                    
                    if (onMapClick) {
                        onMapClick({ latitude: latitude!, longitude: longitude!, altitude: altitude || 0 });
                    }
                }
            } else {
                setProvinceInfo(null);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, [onMapClick]);

    const setupXaPhuongClickHandler = useCallback(() => {
        if (!viewerRef.current || !cesiumRef.current) return;
        
        console.log("setupXaPhuongClickHandler");
        const viewer = viewerRef.current;
        const Cesium = cesiumRef.current;
        
        // Remove existing handler first
        if (clickHandlerRef.current && !clickHandlerRef.current.isDestroyed()) {
            clickHandlerRef.current.destroy();
        }
        
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        clickHandlerRef.current = handler;
        
        handler.setInputAction((event: any) => {
            const pickedObject = viewer.scene.pick(event.position);
            
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                const entity = pickedObject.id;
                
                // Get properties
                const properties = entity.properties;
                let propsObj: { [key: string]: any } = {};

                if (properties && properties.propertyNames) {
                    properties.propertyNames.forEach((key: string) => {
                        const propertyKey = `_${key}`;
                        const property = properties[propertyKey];
                        
                        if (property && property._value !== undefined) {
                            propsObj[key] = property._value;
                        } else if (property && property.value !== undefined) {
                            propsObj[key] = property.value;
                        } else {
                            propsObj[key] = property;
                        }
                    });
                }

                console.log("XaPhuong Properties: ", propsObj);
                
                // Get ward/commune name
                let wardName = (propsObj as any).ten_xa || (propsObj as any).name || (propsObj as any).NAME || 'Unknown Ward/Commune';
                
                // Get coordinates from polygon geometry
                let latitude: number, longitude: number, altitude = 0;
                
                if (entity.polygon && entity.polygon.hierarchy) {
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
                }
                
                // Create info object for ward/commune
                if (typeof latitude! === 'number' && typeof longitude! === 'number') {
                    const selectedProvinceName = computedAvailableProvinces.find(p => p.id === selectedProvinceId)?.name || 'Unknown Province';
                    
                    const info: ProvinceInfo = {
                        name: `${wardName} (${(propsObj as any).loai || 'Ward/Commune'})`,
                        latitude: latitude!,
                        longitude: longitude!,
                        altitude: altitude || 0,
                        properties: {
                            ...propsObj,
                            type: (propsObj as any).loai || 'Ward/Commune',
                            area_km2: (propsObj as any).dtich_km2 ? `${(propsObj as any).dtich_km2} km²` : 'N/A',
                            population: (propsObj as any).dan_so ? (propsObj as any).dan_so.toLocaleString() : 'N/A',
                            population_density: (propsObj as any).matdo_km2 ? `${(propsObj as any).matdo_km2.toLocaleString()} people/km²` : 'N/A',
                            ward_code: (propsObj as any).ma_xa || 'N/A',
                            province: (propsObj as any).ten_tinh || selectedProvinceName,
                            address: (propsObj as any).tru_so || 'Not available',
                            merger_info: (propsObj as any).sap_nhap || 'N/A'
                        },
                        position: { x: 0, y: 0 }
                    };
                    
                    setProvinceInfo(info);
                    
                    if (onMapClick) {
                        onMapClick({ latitude: latitude!, longitude: longitude!, altitude: altitude || 0 });
                    }
                }
            } else {
                setProvinceInfo(null);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, [onMapClick, computedAvailableProvinces, selectedProvinceId]);

    // Load GeoJSON data based on view mode and selected province
    useEffect(() => {
        if (!isViewerReady || !viewerRef.current || !cesiumRef.current) return;

        const viewer = viewerRef.current;
        const Cesium = cesiumRef.current;
        
        // Create a unique key for current data request
        const currentDataKey = viewMode === 'TinhThanh' ? 'TinhThanh' : `XaPhuong-${selectedProvinceId}`;
        
        // Skip if we've already loaded this data
        if (dataLoadedFor === currentDataKey) {
            console.log(`Data already loaded for: ${currentDataKey}`);
            return;
        }

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

        // Close existing popup
        setProvinceInfo(null);

        if (viewMode === 'TinhThanh') {
            loadTinhThanhData();
        } else if (viewMode === 'XaPhuong' && selectedProvinceId) {
            loadXaPhuongData();
        }

        async function loadTinhThanhData() {
            const ttGeo = Array.isArray(geojsons) ? geojsons.find(g => g.name === 'Viet_Nam') : null;
            
            if (!ttGeo || !ttGeo.data) return;

            console.log('TinhThanh GeoJSON data: ', ttGeo.data);

            try {
                setIsLoading(true);

                const processedData = sanitizeGeoJsonRobust(ttGeo.data);
                const loadOptions = {
                    stroke: Cesium.Color.YELLOW,
                    fill: Cesium.Color.YELLOW.withAlpha(0.15),
                    strokeWidth: 2,
                    clampToGround: false,
                    extrudedHeight: 0
                };

                if (!processedData.features || processedData.features.length === 0) {
                    throw new Error('No valid features found');
                }

                const dataSource = await Cesium.GeoJsonDataSource.load(processedData, loadOptions);
                
                if (viewer && !viewer.isDestroyed()) {
                    viewer.dataSources.add(dataSource);
                    geoJsonDataSourceRef.current = dataSource;
                    
                    // Province styling
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
                    
                    // Set up click handler AFTER data is loaded
                    setupTinhThanhClickHandler();
                    
                    // Position camera over Vietnam
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(105.8, 15.9, 1500000),
                        duration: 2.0
                    });
                    
                    // Mark data as loaded
                    setDataLoadedFor('TinhThanh');
                    setIsLoading(false);
                    setError(null);
                }

            } catch (err: any) {
                setError(`Failed to load TinhThanh data: ${err.message}`);
                setIsLoading(false);
            }
        }

        async function loadXaPhuongData() {
            if (!selectedProvinceId) return;

            try {
                setLoadingXaPhuong(true);
                setIsLoading(true);

                console.log(`Fetching XaPhuong data for province ID: ${selectedProvinceId}`);
                
                // Fetch GeoJSON data from API
                const geoJsonData = await fetchGeoJsonById(selectedProvinceId);
                
                if (!geoJsonData || !geoJsonData.data) {
                    throw new Error('No GeoJSON data received from API');
                }

                console.log(`XaPhuong GeoJSON data for ID ${selectedProvinceId}:`, geoJsonData.data);

                const processedData = sanitizeGeoJsonRobust(geoJsonData.data);
                const loadOptions = {
                    stroke: Cesium.Color.ORANGE,
                    fill: Cesium.Color.ORANGE.withAlpha(0.25),
                    strokeWidth: 1.5,
                    clampToGround: false,
                    extrudedHeight: 0
                };

                if (!processedData.features || processedData.features.length === 0) {
                    throw new Error('No valid ward/commune features found');
                }

                const dataSource = await Cesium.GeoJsonDataSource.load(processedData, loadOptions);
                
                if (viewer && !viewer.isDestroyed()) {
                    viewer.dataSources.add(dataSource);
                    geoJsonDataSourceRef.current = dataSource;
                    
                    // Ward/commune styling
                    const entities = dataSource.entities.values;
                    const wardColors = [
                        '#FF8A80', '#FFB74D', '#81C784', '#64B5F6', '#BA68C8', '#4DB6AC', '#F06292',
                        '#FFD54F', '#A1C181', '#90CAF9', '#CE93D8', '#80CBC4', '#FF8A65', '#FFF176',
                        '#C5E1A5', '#B39DDB', '#80DEEA', '#FFCC02', '#DCEDC8', '#E1BEE7', '#B2DFDB',
                        '#FFCDD2', '#F8BBD9', '#C8E6C9', '#BBDEFB', '#D1C4E9', '#B2EBF2', '#FFECB3',
                        '#F3E5F5', '#E0F2F1', '#FCE4EC', '#E8F5E8', '#F3E5F5', '#E1F5FE'
                    ];

                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];
                        if (entity.polygon) {
                            const colorHex = wardColors[i % wardColors.length];
                            const fillColor = Cesium.Color.fromCssColorString(colorHex).withAlpha(0.7);
                            const outlineColor = Cesium.Color.fromCssColorString(colorHex).darken(0.3, new Cesium.Color());

                            entity.polygon.material = fillColor;
                            entity.polygon.outline = true;
                            entity.polygon.outlineColor = outlineColor;
                            entity.polygon.height = 0;
                            entity.polygon.extrudedHeight = undefined;
                        }
                    }
                    
                    // Set up click handler AFTER data is loaded
                    setupXaPhuongClickHandler();
                    
                    // Focus camera on the selected province
                    const selectedProvince = computedAvailableProvinces.find(p => p.id === selectedProvinceId);
                    if (selectedProvince) {
                        // Get bounds from the loaded data to center camera appropriately
                        const rectangle = dataSource.entities.computeScreenSpacePosition ? 
                            Cesium.Rectangle.fromDegrees(102, 8, 110, 24) : // Fallback bounds
                            Cesium.Rectangle.fromDegrees(102, 8, 110, 24);
                        
                        viewer.camera.flyTo({
                            destination: viewer.camera.getRectangleCameraCoordinates(rectangle),
                            duration: 2.0
                        });
                    }
                    
                    // Mark data as loaded
                    setDataLoadedFor(`XaPhuong-${selectedProvinceId}`);
                    setIsLoading(false);
                    setLoadingXaPhuong(false);
                    setError(null);
                }

            } catch (err: unknown) {
                console.error('Error loading ward/commune data:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(`Failed to load XaPhuong data: ${errorMessage}`);
                setIsLoading(false);
                setLoadingXaPhuong(false);
            }
        }

    }, [isViewerReady, geojsons, viewMode, selectedProvinceId, apiBaseUrl, computedAvailableProvinces, setupTinhThanhClickHandler, setupXaPhuongClickHandler, fetchGeoJsonById, dataLoadedFor]);

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
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <div ref={measuredRef} className="w-full h-full" />
            
            {(isLoading || loadingXaPhuong) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto mb-4"></div>
                        <p className="text-white font-medium">
                            {loadingXaPhuong ? 'Loading ward/commune data...' : 'Loading map...'}
                        </p>
                    </div>
                </div>
            )}

            {/* View Mode Indicator */}
            <div className="absolute top-4 left-4 z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">
                    {viewMode === 'TinhThanh' ? '🏛️ Province View' : 
                     `🏘️ ${computedAvailableProvinces.find(p => p.id === selectedProvinceId)?.name || 'Ward/Commune'} View`}
                </div>
            </div>

            {/* View Mode Selector */}
            <div className="absolute top-4 right-4 z-20 space-y-2">
                <select 
                    value={viewMode}
                    onChange={(e) => handleViewModeChange(e.target.value as 'TinhThanh' | 'XaPhuong')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || loadingXaPhuong}
                >
                    <option value="TinhThanh">Tỉnh thành</option>
                    <option value="XaPhuong">Xã phường</option>
                </select>
                
                {/* Province Selector - Only visible when XaPhuong mode is selected */}
                {viewMode === 'XaPhuong' && computedAvailableProvinces.length > 0 && (
                    <select 
                        value={selectedProvinceId}
                        onChange={(e) => setSelectedProvinceId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading || loadingXaPhuong}
                    >
                        {computedAvailableProvinces.map((province) => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                )}
                
                {/* Show message if no provinces available for XaPhuong mode */}
                {viewMode === 'XaPhuong' && computedAvailableProvinces.length === 0 && (
                    <div className="w-full px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-800">
                        No provinces available
                    </div>
                )}
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

    // Log geojson names on mount if available
    useEffect(() => {
        setIsClient(true);
        if (props.geojsons && Array.isArray(props.geojsons)) {
            const names = props.geojsons.map(g => g.name || '[no name]');
            // console.log('GeoJSONs received from backend:', names);
            // console.log('Full GeoJSONs structure:', props.geojsons.map(g => ({
            //     id: g.id,
            //     name: g.name,
            //     hasData: !!g.data,
            //     dataType: typeof g.data
            // })));
        } else {
            console.log('No geojsons received from backend.');
        }
        
        if (props.availableProvinces && Array.isArray(props.availableProvinces)) {
            console.log('Available provinces:', props.availableProvinces);
        } else if (props.geojsons && Array.isArray(props.geojsons)) {
            // Log auto-computed provinces
            const autoProvinces = props.geojsons
                .filter(g => g.name && g.name !== 'Viet_Nam')
                .map(g => ({ id: g.id || g.name, name: g.name }));
            console.log('Auto-computed available provinces:', autoProvinces);
        }
    }, [props.geojsons, props.availableProvinces]);

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