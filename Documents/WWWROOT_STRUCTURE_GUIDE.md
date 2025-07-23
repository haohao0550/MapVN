# DTHub Platform - Static File Structure

## Cấu Trúc Thư Mục `wwwroot`

```
wwwroot/
├── 3dmodel/                         # 3D Models (HIỆN CÓ - ĐANG SỬ DỤNG)
│   ├── {timestamp}_{filename}.glb   # User uploaded 3D models
│   ├── {timestamp}_{filename}.gltf  # Format pattern hiện tại
│   └── ...                          # Các file model khác
│
├── geojsonmodel/                    # GeoJSON Data (HIỆN CÓ - ĐANG SỬ DỤNG)
│   ├── {timestamp}_{filename}.geojson # User uploaded GeoJSON files
│   └── ...                          # Các file GeoJSON khác
│
├── assets/                          # Static assets của hệ thống
│   ├── css/                         # Stylesheets
│   ├── js/                          # JavaScript files
│   ├── fonts/                       # Web fonts
│   └── favicon.ico                  # Favicon
│
├── images/                          # Hình ảnh hệ thống
│   ├── system/                      # Logo, branding
│   │   ├── dthub-logo.png
│   │   ├── dthub-logo-dark.png
│   │   └── loading-spinner.gif
│   ├── ui/                          # UI icons, backgrounds
│   └── placeholders/                # Placeholder images
│       ├── model-placeholder.png
│       ├── geojson-placeholder.png
│       └── user-avatar-default.png
│
├── uploads/                         # User uploaded content (MỞ RỘNG)
│   ├── models/                      # 3D Models (TƯƠNG LAI - organized)
│   │   ├── {year}/                  # Organized by year
│   │   │   ├── {month}/             # Then by month
│   │   │   │   ├── {user_id}/       # Then by user
│   │   │   │   │   ├── {model_id}/  # Individual model folder
│   │   │   │   │   │   ├── model.glb
│   │   │   │   │   │   ├── thumbnail.jpg
│   │   │   │   │   │   ├── preview.png
│   │   │   │   │   │   └── metadata.json
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── geojson/                     # GeoJSON Data (TƯƠNG LAI - organized)
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── {user_id}/
│   │   │   │   │   ├── {geojson_id}/
│   │   │   │   │   │   ├── data.geojson
│   │   │   │   │   │   ├── thumbnail.png
│   │   │   │   │   │   ├── style.json
│   │   │   │   │   │   └── preview.png
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── images/                      # User uploaded images
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── {user_id}/
│   │   │   │   │   ├── thumbnails/  # Thumbnails for models/data
│   │   │   │   │   ├── textures/    # Texture files for 3D models
│   │   │   │   │   ├── icons/       # Custom icons
│   │   │   │   │   └── screenshots/ # Screenshots/previews
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── data/                        # Other data formats
│   │   ├── kml/                     # KML files
│   │   ├── kmz/                     # KMZ files
│   │   ├── shp/                     # Shapefile packages
│   │   ├── csv/                     # CSV data files
│   │   └── gpx/                     # GPX tracks
│   │
│   └── temp/                        # Temporary upload processing
│       ├── chunks/                  # File upload chunks
│       ├── processing/              # Files being processed
│       └── failed/                  # Failed uploads for debugging
│
├── templates/                       # Template models & assets
│   ├── models/                      # Template 3D models
│   │   ├── infrastructure/          # By category
│   │   │   ├── electric/            # By subcategory
│   │   │   │   ├── electric-pole-22kv/
│   │   │   │   │   ├── model.glb
│   │   │   │   │   ├── thumbnail.jpg
│   │   │   │   │   ├── icon.svg
│   │   │   │   │   ├── variants/    # Model variations
│   │   │   │   │   │   ├── low-poly.glb
│   │   │   │   │   │   ├── medium.glb
│   │   │   │   │   │   └── high-detail.glb
│   │   │   │   │   └── metadata.json
│   │   │   │   ├── transformer-station/
│   │   │   │   └── ...
│   │   │   ├── water/
│   │   │   ├── traffic/
│   │   │   └── communication/
│   │   │
│   │   ├── vegetation/
│   │   │   ├── trees/
│   │   │   │   ├── xa-cu/
│   │   │   │   │   ├── model.glb
│   │   │   │   │   ├── seasonal/    # Seasonal variations
│   │   │   │   │   │   ├── spring.glb
│   │   │   │   │   │   ├── summer.glb
│   │   │   │   │   │   ├── autumn.glb
│   │   │   │   │   │   └── winter.glb
│   │   │   │   │   ├── growth-stages/ # Different sizes
│   │   │   │   │   │   ├── young.glb
│   │   │   │   │   │   ├── mature.glb
│   │   │   │   │   │   └── old.glb
│   │   │   │   │   └── metadata.json
│   │   │   │   ├── phuong-vi/
│   │   │   │   └── ...
│   │   │   ├── bushes/
│   │   │   ├── grass/
│   │   │   └── flowers/
│   │   │
│   │   ├── transportation/
│   │   ├── buildings/
│   │   ├── furniture/
│   │   └── virtual/
│   │
│   ├── data/                        # Template data files
│   │   ├── boundaries/              # Administrative boundaries
│   │   │   ├── districts/
│   │   │   ├── wards/
│   │   │   └── provinces/
│   │   ├── networks/                # Infrastructure networks
│   │   │   ├── roads/
│   │   │   ├── metro/
│   │   │   ├── power-grid/
│   │   │   └── water-network/
│   │   └── poi/                     # Points of interest
│   │       ├── education/
│   │       ├── healthcare/
│   │       ├── commercial/
│   │       └── recreation/
│   │
│   ├── styles/                      # Style templates
│   │   ├── geojson/                 # GeoJSON styling
│   │   │   ├── administrative.json
│   │   │   ├── transportation.json
│   │   │   ├── infrastructure.json
│   │   │   └── vegetation.json
│   │   ├── cesium/                  # Cesium-specific styles
│   │   └── leaflet/                 # Leaflet-specific styles
│   │
│   └── icons/                       # Template icons
│       ├── categories/              # Category icons
│       ├── model-types/             # Model type icons
│       └── ui/                      # UI element icons
│
├── cache/                           # Cached/processed files
│   ├── thumbnails/                  # Generated thumbnails
│   │   ├── models/                  # Model thumbnails
│   │   ├── geojson/                 # GeoJSON preview images
│   │   └── data/                    # Data visualization previews
│   ├── optimized/                   # Optimized versions
│   │   ├── models/                  # LOD versions, compressed
│   │   └── images/                  # Resized images
│   └── tiles/                       # Map tiles if needed
│
├── exports/                         # Generated export files
│   ├── {user_id}/                   # Per-user exports
│   │   ├── models/                  # Model exports
│   │   ├── data/                    # Data exports
│   │   └── reports/                 # Report exports
│   └── public/                      # Public export files
│
└── documentation/                   # Static documentation
    ├── api/                         # API documentation
    ├── user-guide/                  # User guides
    └── examples/                    # Example files
```

## Current vs Future Structure

### Hiện Tại (Current Implementation)
DTHub hiện tại đang sử dụng structure đơn giản:
```
wwwroot/
├── 3dmodel/                         # HIỆN TẠI - 3D Models (flat structure)  
│   └── (empty - sẵn sàng cho uploads)
│
├── geojsonmodel/                    # HIỆN TẠI - GeoJSON Data (flat structure)
│   ├── 20250720094621489_20250702021851943_lo_dat_4.geojson
│   └── 20250720094621497_20250702021851943_lo_dat_4.geojson
│
└── (other static content)
```

### Tương Lai (Future Expansion)
Khi dự án mở rộng, sẽ implement cấu trúc phân cấp:
- `/uploads/models/` - organized by year/month/user
- `/uploads/geojson/` - organized by year/month/user  
- `/templates/` - template library với categories

### Migration Strategy
1. **Phase 1 (Hiện tại)**: Giữ nguyên `/3dmodel/` và `/geojsonmodel/` 
2. **Phase 2**: Tạo symbolic links từ `/uploads/models/` → `/3dmodel/`
3. **Phase 3**: Di chuyển dần sang cấu trúc mới với backward compatibility

## Migration Plan - Di Chuyển Thư Mục Hiện Có

### Bước 1: Di Chuyển File Hiện Có
```powershell
# Di chuyển 3D models từ 3dmodel/ vào uploads/models/
# Di chuyển GeoJSON từ geojsonmodel/ vào uploads/geojson/
```

### Bước 2: Cập Nhật Database
- Cập nhật đường dẫn trong bảng `models` 
- Cập nhật đường dẫn trong bảng `geojsons`
- Tạo metadata cho các file đã có

### Bước 3: Cập Nhật API Endpoints
- Cập nhật model upload/download endpoints
- Cập nhật GeoJSON upload/download endpoints
- Thêm admin endpoints cho CRUD operations

## Quy Tắc Đặt Tên File

### 1. User Uploads (models, geojson, images)
```
Format: {timestamp}_{user_id}_{original_name}
Example: 20250720_123_electric_pole_model.glb
```

### 2. Template Files
```
Format: {category}_{subcategory}_{item_name}
Example: infrastructure_electric_pole_22kv.glb
```

### 3. Thumbnails & Previews
```
Format: {original_filename}_thumb.{ext}
Example: electric_pole_model_thumb.jpg
```

## Configuration Updates cho wwwroot

Cập nhật configurations để phản ánh cấu trúc mới:

```javascript
// Storage Settings
{
  key: 'upload_base_path',
  value: '/uploads',
  category: 'storage',
  description: 'Base path cho user uploads'
},
{
  key: 'template_base_path', 
  value: '/templates',
  category: 'storage',
  description: 'Base path cho template files'
},
{
  key: 'cache_base_path',
  value: '/cache', 
  category: 'storage',
  description: 'Base path cho cached files'
},
{
  key: 'max_folder_depth',
  value: '5',
  category: 'storage', 
  description: 'Độ sâu thư mục tối đa'
},
{
  key: 'auto_create_folders',
  value: 'true',
  category: 'storage',
  description: 'Tự động tạo thư mục khi upload'
},
{
  key: 'thumbnail_sizes',
  value: '150x150,300x300,600x600',
  category: 'storage',
  description: 'Kích thước thumbnail được tạo tự động'
}
```

## File Processing Workflow

1. **Upload**: File vào `/uploads/temp/`
2. **Validation**: Kiểm tra format, virus scan
3. **Processing**: Tạo thumbnail, optimize
4. **Storage**: Di chuyển vào thư mục đích theo năm/tháng/user
5. **Database**: Lưu metadata và đường dẫn
6. **Cleanup**: Xóa temp files

## URL Structure

```
Static Files:
- Models: /uploads/models/2025/07/123/456/model.glb
- GeoJSON: /uploads/geojson/2025/07/123/789/data.geojson  
- Images: /uploads/images/2025/07/123/thumbnails/image.jpg

Templates:
- Models: /templates/models/infrastructure/electric/pole-22kv/model.glb
- Data: /templates/data/boundaries/districts/district1.geojson
- Styles: /templates/styles/geojson/infrastructure.json

Cache:
- Thumbnails: /cache/thumbnails/models/456_thumb.jpg
- Optimized: /cache/optimized/models/456_lod1.glb
```

## Security Considerations

1. **Access Control**: 
   - Private uploads chỉ user sở hữu truy cập được
   - Templates public cho tất cả users
   - Admin có quyền truy cập mọi file

2. **File Validation**:
   - Check MIME type
   - Virus scanning
   - Size limits per category

3. **Path Traversal Protection**:
   - Sanitize filenames
   - No relative paths
   - Restrict file extensions

4. **Rate Limiting**:
   - Upload rate per user
   - Total storage quota per user
   - Cleanup old temp files

## Backup Strategy

1. **Critical Files**: Templates, user models, important GeoJSON
2. **Backup Schedule**: Daily incremental, weekly full
3. **Retention**: 30 days local, 90 days cloud
4. **Recovery**: Point-in-time restore capability

Cấu trúc này cho phép:
- Tổ chức file logic theo thời gian và user
- Phân tách templates và user content
- Caching và optimization
- Dễ dàng backup và restore
- Scalable khi số lượng file tăng
