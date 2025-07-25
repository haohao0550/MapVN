'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface GeoJSONFile {
  id: string;
  name: string;
  displayName: string;
  type: 'province' | 'district';
  url: string;
  color: string;
  isVisible: boolean;
}

interface GeoJSONViewerProps {
  onGeoJSONSelect?: (geoJsonData: any, file: GeoJSONFile) => void;
  onGeoJSONToggle?: (file: GeoJSONFile, visible: boolean) => void;
}

// Danh sách các file GeoJSON
const GEOJSON_FILES: GeoJSONFile[] = [
  // Tỉnh thành
  {
    id: 'tinh-thanh',
    name: 'Việt Nam (tỉnh thành).geojson',
    displayName: 'Việt Nam - Tỉnh Thành',
    type: 'province',
    url: '/geojsonmodel/VietNam/TinhThanh/Việt Nam (tỉnh thành).geojson',
    color: '#3B82F6', // Blue
    isVisible: false
  },
  // Xã phường - 34 files
  {
    id: 'an-giang',
    name: 'An Giang (phường xã).geojson',
    displayName: 'An Giang - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/An Giang (phường xã).geojson',
    color: '#EF4444', // Red
    isVisible: false
  },
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh (phường xã).geojson',
    displayName: 'Bắc Ninh - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Bắc Ninh (phường xã).geojson',
    color: '#10B981', // Green
    isVisible: false
  },
  {
    id: 'ca-mau',
    name: 'Cà Mau (phường xã).geojson',
    displayName: 'Cà Mau - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Cà Mau (phường xã).geojson',
    color: '#F59E0B', // Yellow
    isVisible: false
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ (phường xã).geojson',
    displayName: 'Cần Thơ - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Cần Thơ (phường xã).geojson',
    color: '#8B5CF6', // Purple
    isVisible: false
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng (phường xã).geojson',
    displayName: 'Cao Bằng - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Cao Bằng (phường xã).geojson',
    color: '#06B6D4', // Cyan
    isVisible: false
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng (phường xã).geojson',
    displayName: 'Đà Nẵng - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Đà Nẵng (phường xã).geojson',
    color: '#84CC16', // Lime
    isVisible: false
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk (phường xã).geojson',
    displayName: 'Đắk Lắk - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Đắk Lắk (phường xã).geojson',
    color: '#EC4899', // Pink
    isVisible: false
  },
  {
    id: 'dien-bien',
    name: 'Điện Biên (phường xã).geojson',
    displayName: 'Điện Biên - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Điện Biên (phường xã).geojson',
    color: '#F97316', // Orange
    isVisible: false
  },
  {
    id: 'dong-nai',
    name: 'Đồng Nai (phường xã).geojson',
    displayName: 'Đồng Nai - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Đồng Nai (phường xã).geojson',
    color: '#6366F1', // Indigo
    isVisible: false
  },
  {
    id: 'dong-thap',
    name: 'Đồng Tháp (phường xã).geojson',
    displayName: 'Đồng Tháp - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Đồng Tháp (phường xã).geojson',
    color: '#14B8A6', // Teal
    isVisible: false
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai (phường xã).geojson',
    displayName: 'Gia Lai - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Gia Lai (phường xã).geojson',
    color: '#DC2626', // Red-600
    isVisible: false
  },
  {
    id: 'ha-noi',
    name: 'Hà Nội (phường xã).geojson',
    displayName: 'Hà Nội - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Hà Nội (phường xã).geojson',
    color: '#2563EB', // Blue-600
    isVisible: false
  },
  {
    id: 'ha-tinh',
    name: 'Hà Tĩnh (phường xã).geojson',
    displayName: 'Hà Tĩnh - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Hà Tĩnh (phường xã).geojson',
    color: '#059669', // Green-600
    isVisible: false
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng (phường xã).geojson',
    displayName: 'Hải Phòng - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Hải Phòng (phường xã).geojson',
    color: '#D97706', // Amber-600
    isVisible: false
  },
  {
    id: 'hue',
    name: 'Huế (phường xã).geojson',
    displayName: 'Huế - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Huế (phường xã).geojson',
    color: '#7C3AED', // Violet-600
    isVisible: false
  },
  {
    id: 'hung-yen',
    name: 'Hưng Yên (phường xã).geojson',
    displayName: 'Hưng Yên - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Hưng Yên (phường xã).geojson',
    color: '#0891B2', // Cyan-600
    isVisible: false
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa (phường xã).geojson',
    displayName: 'Khánh Hòa - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Khánh Hòa (phường xã).geojson',
    color: '#65A30D', // Lime-600
    isVisible: false
  },
  {
    id: 'lai-chau',
    name: 'Lai Châu (phường xã).geojson',
    displayName: 'Lai Châu - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Lai Châu (phường xã).geojson',
    color: '#DB2777', // Pink-600
    isVisible: false
  },
  {
    id: 'lam-dong',
    name: 'Lâm Đồng (phường xã).geojson',
    displayName: 'Lâm Đồng - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Lâm Đồng (phường xã).geojson',
    color: '#EA580C', // Orange-600
    isVisible: false
  },
  {
    id: 'lang-son',
    name: 'Lạng Sơn (phường xã).geojson',
    displayName: 'Lạng Sơn - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Lạng Sơn (phường xã).geojson',
    color: '#4F46E5', // Indigo-600
    isVisible: false
  },
  {
    id: 'lao-cai',
    name: 'Lào Cai (phường xã).geojson',
    displayName: 'Lào Cai - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Lào Cai (phường xã).geojson',
    color: '#0D9488', // Teal-600
    isVisible: false
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An (phường xã).geojson',
    displayName: 'Nghệ An - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Nghệ An (phường xã).geojson',
    color: '#BE123C', // Rose-700
    isVisible: false
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình (phường xã).geojson',
    displayName: 'Ninh Bình - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Ninh Bình (phường xã).geojson',
    color: '#1D4ED8', // Blue-700
    isVisible: false
  },
  {
    id: 'phu-tho',
    name: 'Phú Thọ (phường xã).geojson',
    displayName: 'Phú Thọ - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Phú Thọ (phường xã).geojson',
    color: '#047857', // Green-700
    isVisible: false
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi (phường xã).geojson',
    displayName: 'Quảng Ngãi - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Quảng Ngãi (phường xã).geojson',
    color: '#B45309', // Amber-700
    isVisible: false
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh (phường xã).geojson',
    displayName: 'Quảng Ninh - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Quảng Ninh (phường xã).geojson',
    color: '#6D28D9', // Violet-700
    isVisible: false
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị (phường xã).geojson',
    displayName: 'Quảng Trị - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Quảng Trị (phường xã).geojson',
    color: '#0E7490', // Cyan-700
    isVisible: false
  },
  {
    id: 'son-la',
    name: 'Sơn La (phường xã).geojson',
    displayName: 'Sơn La - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Sơn La (phường xã).geojson',
    color: '#4D7C0F', // Lime-700
    isVisible: false
  },
  {
    id: 'tp-hcm',
    name: 'TP. Hồ Chí Minh (phường xã).geojson',
    displayName: 'TP. Hồ Chí Minh - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/TP. Hồ Chí Minh (phường xã).geojson',
    color: '#BE185D', // Pink-700
    isVisible: false
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa (phường xã).geojson',
    displayName: 'Thanh Hóa - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Thanh Hóa (phường xã).geojson',
    color: '#C2410C', // Orange-700
    isVisible: false
  },
  {
    id: 'thai-nguyen',
    name: 'Thái Nguyên (phường xã).geojson',
    displayName: 'Thái Nguyên - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Thái Nguyên (phường xã).geojson',
    color: '#3730A3', // Indigo-700
    isVisible: false
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyên Quang (phường xã).geojson',
    displayName: 'Tuyên Quang - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Tuyên Quang (phường xã).geojson',
    color: '#0F766E', // Teal-700
    isVisible: false
  },
  {
    id: 'tay-ninh',
    name: 'Tây Ninh (phường xã).geojson',
    displayName: 'Tây Ninh - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Tây Ninh (phường xã).geojson',
    color: '#991B1B', // Red-800
    isVisible: false
  },
  {
    id: 'vinh-long',
    name: 'Vĩnh Long (phường xã).geojson',
    displayName: 'Vĩnh Long - Phường Xã',
    type: 'district',
    url: '/geojsonmodel/VietNam/XaPhuong/Vĩnh Long (phường xã).geojson',
    color: '#1E40AF', // Blue-800
    isVisible: false
  }
];

const GeoJSONViewer: React.FC<GeoJSONViewerProps> = ({ onGeoJSONSelect, onGeoJSONToggle }) => {
  const [files, setFiles] = useState<GeoJSONFile[]>(GEOJSON_FILES);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GeoJSONFile | null>(null);

  // Load GeoJSON data
  const loadGeoJSON = useCallback(async (file: GeoJSONFile) => {
    setLoading(file.id);
    try {
      // Use the API endpoint to serve GeoJSON files
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const filename = file.url.split('/').pop(); // Get just the filename
      const apiUrl = `${BACKEND_URL}/api/geojsons/files/${encodeURIComponent(filename!)}`;
      
      console.log(`Loading GeoJSON from API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to load ${file.displayName}: ${response.status} ${response.statusText}`);
      }
      const geoJsonData = await response.json();
      
      // Notify parent component
      onGeoJSONSelect?.(geoJsonData, file);
      setSelectedFile(file);
      
      console.log(`Loaded ${file.displayName}:`, geoJsonData);
    } catch (error) {
      console.error(`Error loading ${file.displayName}:`, error);
      alert(`Failed to load ${file.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  }, [onGeoJSONSelect]);  // Toggle visibility
  const toggleVisibility = useCallback((file: GeoJSONFile) => {
    const newVisible = !file.isVisible;
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, isVisible: newVisible } : f
    ));
    onGeoJSONToggle?.(file, newVisible);
  }, [onGeoJSONToggle]);

  // Clear all selections
  const clearAll = useCallback(() => {
    setFiles(prev => prev.map(f => ({ ...f, isVisible: false })));
    setSelectedFile(null);
  }, []);

  // Group files by type
  const provinceFiles = files.filter(f => f.type === 'province');
  const districtFiles = files.filter(f => f.type === 'district');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Vietnam GeoJSON Files
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={clearAll}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Province Level */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 text-blue-600">Tỉnh Thành (1 file)</h4>
        {provinceFiles.map(file => (
          <div
            key={file.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              selectedFile?.id === file.id 
                ? 'bg-blue-50 border-blue-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ backgroundColor: file.color }}
              />
              <span className="font-medium">{file.displayName}</span>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadGeoJSON(file)}
                disabled={loading === file.id}
                className="flex items-center gap-2"
              >
                {loading === file.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    View
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant={file.isVisible ? "default" : "outline"}
                onClick={() => toggleVisibility(file)}
                title={file.isVisible ? "Hide" : "Show"}
              >
                {file.isVisible ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* District Level */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 text-green-600">Phường Xã (34 files)</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {districtFiles.map(file => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                selectedFile?.id === file.id 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded border-2"
                  style={{ backgroundColor: file.color }}
                />
                <span className="text-sm">{file.displayName}</span>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadGeoJSON(file)}
                  disabled={loading === file.id}
                  className="flex items-center gap-2 text-xs px-2 py-1"
                >
                  {loading === file.id ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      View
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={file.isVisible ? "default" : "outline"}
                  onClick={() => toggleVisibility(file)}
                  title={file.isVisible ? "Hide" : "Show"}
                  className="px-2 py-1"
                >
                  {file.isVisible ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <div className="flex justify-between">
          <span>Total Files: 35 (1 Province + 34 Districts)</span>
          <span>Visible: {files.filter(f => f.isVisible).length}</span>
        </div>
      </div>
    </div>
  );
};

export default GeoJSONViewer;
