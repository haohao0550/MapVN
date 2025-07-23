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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏗️ DTHub Platform
              </h1>
              <p className="text-sm text-gray-600">
                Digital Twin Vietnam with Cesium 3D Maps
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={testAPI}
                disabled={isLoading}
              >
                🏥 Health Check
              </Button>
              <Button 
                variant="outline" 
                onClick={loadModels}
                disabled={isLoading}
              >
                🏗️ Load Models ({models.length})
              </Button>
              <Button 
                variant="outline" 
                onClick={loadCategories}
                disabled={isLoading}
              >
                📋 Load Categories ({categories.length})
              </Button>
              <Button 
                variant="outline" 
                onClick={loadGeoJsons}
                disabled={isLoading}
              >
                🗺️ Load GeoJSON ({geojsons.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r overflow-y-auto">
          <div className="p-4">
            {/* API Status */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  {apiStatus || 'Click buttons to test API...'}
                </p>
                {isLoading && (
                  <div className="flex items-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-xs text-gray-500">Loading...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Model Info */}
            {selectedModel && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Selected Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-sm">{selectedModel.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedModel.description || 'No description'}
                  </p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p><strong>Position:</strong> {selectedModel.latitude?.toFixed(6)}, {selectedModel.longitude?.toFixed(6)}</p>
                    <p><strong>Category:</strong> {selectedModel.category?.name || 'Uncategorized'}</p>
                    <p><strong>Owner:</strong> {selectedModel.user?.name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Models List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">3D Models ({models.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                {models.length === 0 ? (
                  <p className="text-xs text-gray-500">No models loaded</p>
                ) : (
                  <div className="space-y-2">
                    {models.map((model) => (
                      <div 
                        key={model.id}
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedModel(model)}
                      >
                        <h4 className="font-medium text-xs">{model.name}</h4>
                        <p className="text-xs text-gray-500">
                          {model.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories List */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-40 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-500">No categories loaded</p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div 
                        key={category.id}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#gray' }}
                        ></div>
                        <span>{category.name}</span>
                        <span className="text-gray-400">
                          ({category._count?.models || 0})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <CesiumMap
            className="w-full h-full"
            models={models}
            geojsons={geojsons}
            onModelClick={handleModelClick}
            onMapClick={handleMapClick}
          />
          
          {/* Map Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-800">Map Info</h3>
            <div className="mt-1 space-y-1 text-xs text-gray-600">
              <p>📍 {models.length} 3D Models</p>
              <p>🗺️ {geojsons.length} GeoJSON Layers</p>
              <p>📂 {categories.length} Categories</p>
              <p>🌍 Vietnam Digital Twin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
