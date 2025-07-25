'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CesiumMap, { CameraPosition } from '@/components/CesiumMap';
import GLBUpload from '@/components/GLBUpload';
import AuthPage from '@/components/AuthPage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Upload, List, Settings, LogOut, User, Navigation } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description?: string;
  url: string;
  longitude: number;
  latitude: number;
  height: number;
  scale: number;
  heading: number;
  pitch: number;
  roll: number;
  modelCategory?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MapViewer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [flyToModelId, setFlyToModelId] = useState<string | undefined>(undefined);

  // Check for existing authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAuthToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle authentication success
  const handleAuthSuccess = useCallback((userData: User, token: string) => {
    setUser(userData);
    setAuthToken(token);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    setModels([]);
    setSelectedModel(null);
  }, []);

  // Handle camera movement
  const handleCameraMove = useCallback((position: CameraPosition) => {
    setCameraPosition(position);
  }, []);

  // Handle model upload
  const handleModelUploaded = useCallback((newModel: Model) => {
    setModels(prev => [newModel, ...prev]);
  }, []);

  // Handle model click
  const handleModelClick = useCallback((model: any) => {
    setSelectedModel(model);
  }, []);

  // Handle fly to model
  const handleFlyToModel = useCallback((modelId: string) => {
    setFlyToModelId(modelId);
    // Reset after a short delay to allow re-triggering
    setTimeout(() => setFlyToModelId(undefined), 100);
  }, []);

  // Load models from API
  const loadModels = useCallback(async () => {
    if (!authToken) return;
    
    setLoading(true);
    try {
      // Call backend directly
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/models/active-for-map`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        // Ensure tilesetUrl has full backend URL
        const modelsWithFullUrls = result.data.map((model: any) => ({
          ...model,
          tilesetUrl: model.tilesetUrl.startsWith('http') 
            ? model.tilesetUrl 
            : `${BACKEND_URL}${model.tilesetUrl}`
        }));
        
        setModels(modelsWithFullUrls);
        console.log('Loaded active models for map:', modelsWithFullUrls);
      } else {
        console.error('Failed to load models:', result.message);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Load models when user authenticates
  useEffect(() => {
    if (user && authToken) {
      loadModels();
    }
  }, [user, authToken, loadModels]);

  // Show authentication page if not logged in
  if (!user || !authToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              MapVN - 3D Model Viewer
            </h1>
            <div className="flex items-center gap-4">
              {cameraPosition && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  <span className="font-medium">Camera:</span>{' '}
                  {cameraPosition.latitude.toFixed(6)}, {cameraPosition.longitude.toFixed(6)} 
                  <span className="text-gray-500 ml-2">
                    ({cameraPosition.height.toFixed(0)}m)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
              <Button onClick={loadModels} disabled={loading} size="sm">
                {loading ? 'Loading...' : 'Refresh Models'}
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <Tabs defaultValue="upload" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Models ({models.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 p-4 overflow-y-auto">
              <GLBUpload
                onModelUploaded={handleModelUploaded}
                cameraPosition={cameraPosition || undefined}
              />
            </TabsContent>

            <TabsContent value="models" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {models.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No models uploaded yet</p>
                    <p className="text-sm">Upload your first GLB model to get started</p>
                  </div>
                ) : (
                  models.map((model) => (
                    <Card
                      key={model.id}
                      className={`p-4 transition-colors ${
                        selectedModel?.id === model.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 
                            className="font-medium text-gray-800 cursor-pointer"
                            onClick={() => setSelectedModel(model)}
                          >
                            {model.name}
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlyToModel(model.id)}
                            className="ml-2"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Fly To
                          </Button>
                        </div>
                        {model.description && (
                          <p className="text-sm text-gray-600">{model.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{model.modelCategory || 'Uncategorized'}</span>
                          <span>by {model.user.name}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Position: {model.latitude.toFixed(4)}, {model.longitude.toFixed(4)}
                        </div>
                        {model.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {model.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <CesiumMap
            className="w-full h-full"
            models={models}
            onCameraMove={handleCameraMove}
            onModelClick={handleModelClick}
            flyToModel={flyToModelId}
          />

          {/* Model Details Overlay */}
          {selectedModel && (
            <div className="absolute top-4 right-4 w-80">
              <Card className="p-4 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {selectedModel.name}
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedModel(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  {selectedModel.description && (
                    <p className="text-gray-600">{selectedModel.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Scale:</span> {selectedModel.scale}
                    </div>
                    <div>
                      <span className="font-medium">Heading:</span> {selectedModel.heading}°
                    </div>
                    <div>
                      <span className="font-medium">Pitch:</span> {selectedModel.pitch}°
                    </div>
                    <div>
                      <span className="font-medium">Roll:</span> {selectedModel.roll}°
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <div>Latitude: {selectedModel.latitude.toFixed(6)}</div>
                      <div>Longitude: {selectedModel.longitude.toFixed(6)}</div>
                      <div>Height: {selectedModel.height.toFixed(2)}m</div>
                    </div>
                  </div>

                  {selectedModel.tags.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViewer;
