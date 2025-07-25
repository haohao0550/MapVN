'use client';

import React, { useState, useEffect } from 'react';
import CesiumMap from '../../components/CesiumMap';

// Define the province record type
interface ProvinceInfo {
  name?: string;
  population?: string;
  type?: string;
  position?: {
    latitude?: number;
    longitude?: number;
    height?: number;
  };
  [key: string]: any; // For other dynamic properties
}

export default function ProvincesPage() {
  const [provinceData, setProvinceData] = useState<Record<string, any>>({});
  const [selectedProvince, setSelectedProvince] = useState<ProvinceInfo | null>(null);
  const [provinceStats, setProvinceStats] = useState({
    totalProvinces: 34,
    totalPopulation: '97,339,000',
    selectedCount: 0
  });
  
  // Sample province data with population (for demonstration)
  const provinceColors: Record<string, string> = {
    'Hà Nội': '#FF4136',       // Red
    'Hồ Chí Minh': '#0074D9',  // Blue
    'Đà Nẵng': '#2ECC40',      // Green
    'Hải Phòng': '#FFDC00',    // Yellow
    'Cần Thơ': '#FF851B',      // Orange
    'Quảng Ninh': '#B10DC9',   // Purple
    'Khánh Hòa': '#01FF70',    // Lime
    'Lâm Đồng': '#F012BE',     // Fuchsia
    'Thái Nguyên': '#85144b',  // Maroon
    'Nghệ An': '#3D9970'       // Olive
  };

  const provincePop: Record<string, string> = {
    'Hà Nội': '8,246,500',
    'Hồ Chí Minh': '8,993,000',
    'Đà Nẵng': '1,134,300',
    'Hải Phòng': '2,028,500',
    'Cần Thơ': '1,235,900',
    'Quảng Ninh': '1,320,300',
    'Khánh Hòa': '1,232,800',
    'Lâm Đồng': '1,298,900',
    'Thái Nguyên': '1,286,800',
    'Nghệ An': '3,327,800'
  };

  const handleModelClick = (data: any) => {
    console.log('Clicked on:', data);
    setSelectedProvince(data);
  };

  const handleMapClick = (position: any) => {
    console.log('Map clicked at:', position);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bản Đồ Các Tỉnh Thành Việt Nam</h1>
          <p className="text-gray-600">Hiển thị dữ liệu từ 34 tỉnh thành thông qua 3D Tileset</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
            onClick={() => window.location.reload()}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Làm mới
          </button>
          <button 
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm flex items-center"
            onClick={() => window.open('/api/geojsons', '_blank')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
            API
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-4 overflow-y-auto">
          <h2 className="font-bold mb-3 text-lg">Thông Tin Tỉnh Thành</h2>

          {selectedProvince ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{selectedProvince.name || 'Tỉnh/Thành phố'}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-medium">Dân số:</span> {selectedProvince.population || (selectedProvince.name && provincePop[selectedProvince.name]) || 'Không có dữ liệu'}</p>
                <p><span className="font-medium">Loại:</span> {selectedProvince.type || 'Tỉnh/Thành phố'}</p>
                <p><span className="font-medium">Vị trí:</span></p>
                {selectedProvince.position && (
                  <div className="pl-3 text-gray-600">
                    <p>Vĩ độ: {selectedProvince.position.latitude?.toFixed(6) || 'N/A'}</p>
                    <p>Kinh độ: {selectedProvince.position.longitude?.toFixed(6) || 'N/A'}</p>
                    <p>Cao độ: {selectedProvince.position.height?.toFixed(2) || 'N/A'} m</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Chọn một tỉnh thành trên bản đồ để xem thông tin chi tiết</p>
          )}

          <div className="mt-6">
            <h3 className="font-bold mb-2">Danh Sách Các Tỉnh Thành</h3>
            <div className="space-y-1">
              {Object.entries(provinceColors).map(([province, color]) => (
                <div 
                  key={province} 
                  className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  style={{
                    backgroundColor: selectedProvince?.name === province ? '#f0f9ff' : undefined,
                    borderLeft: selectedProvince?.name === province ? `4px solid ${color}` : undefined
                  }}
                  onClick={() => setSelectedProvince({ name: province, population: provincePop[province] || 'Không có dữ liệu' })}
                >
                  <span 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: color }}
                  ></span>
                  <span>{province}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tileset Information */}
          <div className="mt-8 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-sm mb-2">Thông Tin 3D Tileset</h3>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Nguồn dữ liệu:</span> GeoJSON → B3DM</p>
              <p><span className="font-medium">Vùng bao:</span> [105.8°, 15.9°]</p>
              <p><span className="font-medium">Cấu trúc:</span> 2 tile files (0.b3dm, 1.b3dm)</p>
              <p><span className="font-medium">Chuyển đổi:</span> py3dtiles (v10.0.0)</p>
              <p><span className="font-medium">Ngày tạo:</span> 24/07/2025</p>
              <a 
                href="/3dmodel/tileset.json" 
                target="_blank" 
                className="mt-2 inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                Xem file Tileset
              </a>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <CesiumMap
            className="w-full h-full"
            show3DTiles={true}
            enableProvinceHighlight={true}
            provinceColors={provinceColors}
            onModelClick={handleModelClick}
            onMapClick={handleMapClick}
          />

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-3 z-10">
            <h3 className="text-sm font-semibold mb-2">Điều Khiển Bản Đồ</h3>
            <div className="text-xs text-gray-600">
              <p>• Cuộn chuột để phóng to/thu nhỏ</p>
              <p>• Kéo để di chuyển bản đồ</p>
              <p>• Nhấp để chọn tỉnh thành</p>
            </div>
          </div>
          
          {/* Stats Panel */}
          <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg p-3 z-10 max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Thống Kê</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-medium">Tổng số tỉnh thành</p>
                <p className="text-blue-600 font-bold">{provinceStats.totalProvinces}</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="font-medium">Tổng dân số</p>
                <p className="text-green-600 font-bold">{provinceStats.totalPopulation}</p>
              </div>
            </div>
            
            {/* Data Source Info */}
            <div className="mt-2 text-xs text-gray-500">
              <p>Dữ liệu từ GeoJSON và 3D Tileset</p>
              <p className="mt-1 font-medium">Định dạng: <span className="text-xs font-mono">B3DM</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
