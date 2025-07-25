'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, Save, Settings } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface GLBUploadProps {
  onModelUploaded?: (model: any) => void;
  cameraPosition?: {
    longitude: number;
    latitude: number;
    height: number;
  };
}

interface ModelProperties {
  name: string;
  description: string;
  scale: number;
  heading: number;
  pitch: number;
  roll: number;
  category: string;
  tags: string[];
  isPublic: boolean;
}

const GLBUpload: React.FC<GLBUploadProps> = ({ onModelUploaded, cameraPosition }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [modelProperties, setModelProperties] = useState<ModelProperties>({
    name: '',
    description: '',
    scale: 1.0,
    heading: 0,
    pitch: 0,
    roll: 0,
    category: '',
    tags: [],
    isPublic: true
  });

  // Load categories from API
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const token = localStorage.getItem('authToken');
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Failed to load categories:', result.message);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      setSelectedFile(file);
      // Auto-generate name from filename
      const nameWithoutExtension = file.name.replace(/\.glb$/i, '');
      setModelProperties(prev => ({
        ...prev,
        name: prev.name || nameWithoutExtension
      }));
    } else {
      alert('Please select a valid GLB file');
    }
  }, []);

  const handlePropertyChange = useCallback((property: keyof ModelProperties, value: any) => {
    setModelProperties(prev => ({
      ...prev,
      [property]: value
    }));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !cameraPosition) {
      alert('Please select a GLB file and ensure camera position is available');
      return;
    }

    if (!modelProperties.name.trim()) {
      alert('Please enter a model name');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('glbFile', selectedFile);
      formData.append('name', modelProperties.name);
      formData.append('description', modelProperties.description);
      formData.append('cameraLongitude', cameraPosition.longitude.toString());
      formData.append('cameraLatitude', cameraPosition.latitude.toString());
      formData.append('cameraHeight', cameraPosition.height.toString());
      formData.append('scale', modelProperties.scale.toString());
      formData.append('heading', modelProperties.heading.toString());
      formData.append('pitch', modelProperties.pitch.toString());
      formData.append('roll', modelProperties.roll.toString());
      formData.append('category', modelProperties.category);
      formData.append('tags', JSON.stringify(modelProperties.tags));
      formData.append('isPublic', modelProperties.isPublic.toString());

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/models/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Model uploaded and processed successfully!');
        onModelUploaded?.(result.data);
        
        // Reset form
        setSelectedFile(null);
        setModelProperties({
          name: '',
          description: '',
          scale: 1.0,
          heading: 0,
          pitch: 0,
          roll: 0,
          category: '',
          tags: [],
          isPublic: true
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    handlePropertyChange('tags', tags);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload GLB Model
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select GLB File
            </label>
            <input
              type="file"
              accept=".glb"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FileText className="w-4 h-4" />
              <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      </Card>

      {/* Model Properties Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Model Properties
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              value={modelProperties.name}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter model name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={modelProperties.category}
              onChange={(e) => handlePropertyChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loadingCategories}
            >
              <option value="">-- Select Category --</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {loadingCategories && (
              <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={modelProperties.description}
              onChange={(e) => handlePropertyChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Enter model description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Scale
            </label>
            <input
              type="number"
              value={modelProperties.scale}
              onChange={(e) => handlePropertyChange('scale', parseFloat(e.target.value) || 1)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Heading (degrees)
            </label>
            <input
              type="number"
              value={modelProperties.heading}
              onChange={(e) => handlePropertyChange('heading', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              max="360"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Pitch (degrees)
            </label>
            <input
              type="number"
              value={modelProperties.pitch}
              onChange={(e) => handlePropertyChange('pitch', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="-90"
              max="90"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Roll (degrees)
            </label>
            <input
              type="number"
              value={modelProperties.roll}
              onChange={(e) => handlePropertyChange('roll', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="-180"
              max="180"
              step="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={modelProperties.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelProperties.isPublic}
                onChange={(e) => handlePropertyChange('isPublic', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Make model public</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !modelProperties.name.trim() || uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Upload & Process Model
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GLBUpload;
