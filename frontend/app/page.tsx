'use client';

import { useState, useEffect } from 'react';
import CesiumMap from '@/components/CesiumMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { healthCheck, modelsAPI, categoriesAPI, geojsonAPI } from '@/lib/api';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [models, setModels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [geojsons, setGeojsons] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [show3DTiles, setShow3DTiles] = useState<boolean>(false);

  // Test API connection
  const testAPI = async () => {
    setIsLoading(true);
    try {
      const response = await healthCheck();
      setApiStatus(`✅ Backend connected: ${response.data.message}`);
    } catch (error) {
      setApiStatus('❌ Backend connection failed');
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load models
  const loadModels = async () => {
    setIsLoading(true);
    try {
      const response = await modelsAPI.getAll();
      setModels(response.data.data.models);
      setApiStatus(`✅ Loaded ${response.data.data.models.length} models`);
    } catch (error) {
      setApiStatus('❌ Failed to load models');
      console.error('Models Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
      setApiStatus(`✅ Loaded ${response.data.data.length} categories`);
    } catch (error) {
      setApiStatus('❌ Failed to load categories');
      console.error('Categories Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load GeoJSON data
  const loadGeoJsons = async () => {
    setIsLoading(true);
    try {
      const response = await geojsonAPI.getAll();
      setGeojsons(response.data.data.geojsons);
      setApiStatus(`✅ Loaded ${response.data.data.geojsons.length} GeoJSON datasets`);
    } catch (error) {
      setApiStatus('❌ Failed to load GeoJSON data');
      console.error('GeoJSON Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await testAPI();
      await loadModels();
      await loadCategories();
      await loadGeoJsons();
    };
    
    loadAllData();
  }, []);

  const handleModelClick = (model: any) => {
    setSelectedModel(model);
    console.log('Model clicked:', model);
  };

  const handleMapClick = (position: { latitude: number; longitude: number; altitude: number }) => {
    console.log('Map clicked at:', position);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-screen relative">
        <CesiumMap
          className="w-full h-full"
          models={models}
          geojsons={geojsons}
          onModelClick={handleModelClick}
          onMapClick={handleMapClick}
          show3DTiles={show3DTiles}
        />
        {/* Map Overlay Info */}
        {/* <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-800">Map Info</h3>
          <div className="mt-1 space-y-1 text-xs text-gray-600">
            <p>📍 {models.length} 3D Models</p>
            <p>🗺️ {geojsons.length} GeoJSON Layers</p>
            <p>📂 {categories.length} Categories</p>
            <p>🌍 Vietnam Digital Twin</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
