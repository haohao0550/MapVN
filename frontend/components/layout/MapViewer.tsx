'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CesiumMap, { CameraPosition } from '@/components/map/CesiumMap';
import GLBUpload from '@/components/features/GLBUpload';
import AuthPage from '@/components/features/AuthPage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Upload, List, Settings, LogOut, User, Navigation, Edit, Eye, Trash2 } from 'lucide-react';

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
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [viewingModel, setViewingModel] = useState<Model | null>(null);
  const [editForm, setEditForm] = useState({
    longitude: 0,
    latitude: 0,
    height: 0,
    scale: 1,
    heading: 0,
    pitch: 0,
    roll: 0
  });

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

  // Handle edit model
  const handleEditModel = useCallback((model: Model) => {
    setEditingModel(model);
    setEditForm({
      longitude: model.longitude,
      latitude: model.latitude,
      height: model.height,
      scale: model.scale,
      heading: model.heading,
      pitch: model.pitch,
      roll: model.roll
    });
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback(async () => {
    if (!editingModel || !authToken) return;

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/models/${editingModel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      if (result.success) {
        // Update models list
        setModels(prev => prev.map(model => 
          model.id === editingModel.id 
            ? { ...model, ...editForm }
            : model
        ));
        setEditingModel(null);
        console.log('Model updated successfully');
      } else {
        console.error('Failed to update model:', result.message);
      }
    } catch (error) {
      console.error('Error updating model:', error);
    } finally {
      setLoading(false);
    }
  }, [editingModel, editForm, authToken]);

  // Handle delete model
  const handleDeleteModel = useCallback(async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      if (result.success) {
        // Remove from models list
        setModels(prev => prev.filter(model => model.id !== modelId));
        if (selectedModel?.id === modelId) {
          setSelectedModel(null);
        }
        console.log('Model deleted successfully');
      } else {
        console.error('Failed to delete model:', result.message);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setLoading(false);
    }
  }, [authToken, selectedModel]);

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
    <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="upload" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Models ({models.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 p-4 overflow-y-auto min-h-0">
              <GLBUpload
                onModelUploaded={handleModelUploaded}
                cameraPosition={cameraPosition || undefined}
              />
            </TabsContent>

            <TabsContent value="models" className="flex-1 p-4 overflow-y-auto min-h-0">
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
                            className="font-medium text-gray-800 cursor-pointer flex-1"
                            onClick={() => setSelectedModel(model)}
                          >
                            {model.name}
                          </h3>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFlyToModel(model.id)}
                              title="Fly to model"
                            >
                              <Navigation className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingModel(model)}
                              title="View details"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditModel(model)}
                              title="Edit model"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteModel(model.id)}
                              title="Delete model"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
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
        <div className="flex-1 relative h-full overflow-hidden">
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

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit Model: {editingModel.name}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editForm.longitude}
                    onChange={(e) => setEditForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editForm.latitude}
                    onChange={(e) => setEditForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.height}
                  onChange={(e) => setEditForm(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Scale</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editForm.scale}
                  onChange={(e) => setEditForm(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Heading (°)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="360"
                    value={editForm.heading}
                    onChange={(e) => setEditForm(prev => ({ ...prev, heading: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pitch (°)</label>
                  <input
                    type="number"
                    step="1"
                    min="-90"
                    max="90"
                    value={editForm.pitch}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Roll (°)</label>
                  <input
                    type="number"
                    step="1"
                    min="-180"
                    max="180"
                    value={editForm.roll}
                    onChange={(e) => setEditForm(prev => ({ ...prev, roll: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSaveEdit} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingModel(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Model Details Modal */}
      {viewingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Model Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingModel(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">{viewingModel.name}</h3>
                {viewingModel.description && (
                  <p className="text-gray-600 mt-1">{viewingModel.description}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Position & Orientation</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Longitude:</span>
                    <div className="text-gray-600">{viewingModel.longitude.toFixed(6)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Latitude:</span>
                    <div className="text-gray-600">{viewingModel.latitude.toFixed(6)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Height:</span>
                    <div className="text-gray-600">{viewingModel.height.toFixed(2)} m</div>
                  </div>
                  <div>
                    <span className="font-medium">Scale:</span>
                    <div className="text-gray-600">{viewingModel.scale}</div>
                  </div>
                  <div>
                    <span className="font-medium">Heading:</span>
                    <div className="text-gray-600">{viewingModel.heading}°</div>
                  </div>
                  <div>
                    <span className="font-medium">Pitch:</span>
                    <div className="text-gray-600">{viewingModel.pitch}°</div>
                  </div>
                  <div>
                    <span className="font-medium">Roll:</span>
                    <div className="text-gray-600">{viewingModel.roll}°</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="text-gray-600 ml-2">{viewingModel.modelCategory || 'Uncategorized'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Uploaded by:</span>
                    <span className="text-gray-600 ml-2">{viewingModel.user.name} ({viewingModel.user.email})</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="text-gray-600 ml-2">{new Date(viewingModel.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Public:</span>
                    <span className="text-gray-600 ml-2">{viewingModel.isPublic ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {viewingModel.tags.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {viewingModel.tags.map((tag, index) => (
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

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => handleFlyToModel(viewingModel.id)}
                  className="flex-1"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Fly To Model
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingModel(null);
                    handleEditModel(viewingModel);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
