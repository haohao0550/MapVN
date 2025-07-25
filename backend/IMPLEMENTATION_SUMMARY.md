# DTHub 3D Model API - Implementation Summary

## Những thay đổi đã được thực hiện

### 1. Cấu trúc lưu trữ file
- **File B3DM**: Lưu trong `wwwroot/3dmodel/{modelId}/model.b3dm` 
- **Tileset.json**: KHÔNG lưu file, tạo động khi có request

### 2. Quy trình Upload và Xử lý

#### A. Upload GLB file
```
POST /api/models/upload
```
- Upload GLB file qua multer
- Chuyển đổi GLB → B3DM bằng `3d-tiles-tools`
- Lưu B3DM vào `wwwroot/3dmodel/{modelId}/model.b3dm`
- Lưu thông tin model vào database (bảng `models`)
- URL trong database: `/3dmodel/{modelId}/tileset.json`

#### B. API Endpoints

1. **Dynamic Tileset Endpoint**
   ```
   GET /3dmodel/{modelId}/tileset.json
   ```
   - Tạo tileset.json động dựa vào thông tin model trong database
   - Sử dụng transformation matrix từ longitude, latitude, height
   - Trả về JSON để Cesium load

2. **Get Active Models for Map**
   ```
   GET /api/models/active
   ```
   - Lấy danh sách tất cả models active và public
   - Bao gồm tilesetUrl để frontend load

3. **Get Model Tileset Info**
   ```
   GET /api/models/{modelId}/tileset
   ```
   - Lấy thông tin chi tiết model và tileset

### 3. Service Layer (`modelProcessingService.js`)

#### Methods đã update:
- `processGlbToB3dm()`: Chỉ tạo B3DM, không tạo tileset.json file
- `generateTilesetJson()`: Tạo tileset.json động từ model data
- `getTilesetInfo()`: Lấy thông tin tileset từ model data
- `createTransformMatrix()`: Tạo transformation matrix cho positioning

### 4. Controller Layer (`modelController.js`)

#### Methods đã update:
- `uploadModel()`: Xử lý upload và tạo B3DM
- `getActiveModelsForMap()`: Cung cấp data cho map display
- `getModelTileset()`: Tạo tileset.json động

### 5. Static File Serving

#### CORS Configuration:
- Headers cho phép cross-origin requests
- Content-type phù hợp cho các file 3D Tiles (.b3dm, .json)

#### Static Routes:
- `/3dmodel/`: Serve static B3DM files
- `/3dmodel/{modelId}/tileset.json`: Dynamic tileset endpoint

### 6. Database Schema

Table `models` lưu:
- `url`: API endpoint (VD: `/3dmodel/{modelId}/tileset.json`)
- `longitude`, `latitude`, `height`: Vị trí model
- `heading`, `pitch`, `roll`, `scale`: Orientation và scale

### 7. Frontend Integration

```javascript
// Load models từ API
const response = await fetch('/api/models/active');
const { data: models } = await response.json();

// Load từng model vào Cesium
models.forEach(model => {
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: `${API_BASE_URL}${model.tilesetUrl}`, // /3dmodel/{modelId}/tileset.json
    })
  );
});
```

### 8. Tileset.json Structure

```json
{
  "asset": {
    "version": "1.1",
    "tilesetVersion": "1.0.0",
    "generator": "DTHub 3D Tiles Converter"
  },
  "geometricError": 500,
  "root": {
    "boundingVolume": {
      "box": [0, 0, 0, 50, 0, 0, 0, 50, 0, 0, 0, 50]
    },
    "geometricError": 16,
    "refine": "REPLACE",
    "content": {
      "uri": "model.b3dm"
    },
    "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
  }
}
```

## Ưu điểm của approach này

1. **Tiết kiệm storage**: Không lưu tileset.json files
2. **Dynamic positioning**: Tileset.json tạo theo real-time model data
3. **Flexible**: Có thể update vị trí model mà không cần regenerate files
4. **Clean architecture**: Tách biệt data storage và API response

## Dependencies

- `3d-tiles-tools@^0.5.0`: GLB to B3DM conversion
- `@prisma/client`: Database operations  
- `multer`: File upload handling
- `fs-extra`: File system operations

## File Structure

```
wwwroot/
  3dmodel/
    {modelId}/
      model.b3dm    # Binary 3D Model file
```

## Testing

Server đang chạy tại `http://localhost:4000`

Endpoints sẵn sàng:
- ✅ `POST /api/models/upload` - Upload GLB
- ✅ `GET /api/models/active` - Get models for map
- ✅ `GET /3dmodel/{modelId}/tileset.json` - Dynamic tileset
- ✅ `GET /api/models/{modelId}/tileset` - Model tileset info
