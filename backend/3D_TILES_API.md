# DTHub 3D Model Upload và 3D Tiles API

## Tổng quan

API này cho phép upload file GLB và tự động chuyển đổi thành 3D Tiles format để hiển thị trên bản đồ Cesium.

## Quy trình xử lý

1. **Upload GLB**: Client upload file GLB cùng với thông tin vị trí
2. **Chuyển đổi**: Server tự động chuyển đổi GLB thành B3DM và tạo tileset.json
3. **Lưu trữ**: File được lưu trong `wwwroot/models/{modelId}/`
4. **Database**: Thông tin model được lưu vào bảng `models` với URL pointing đến tileset.json
5. **Response**: Server trả về thông tin model và tileset để frontend load lên bản đồ

## API Endpoints

### 1. Upload Model
```
POST /api/models/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form data:
- glbFile: GLB file
- name: Model name
- description: Model description (optional)
- cameraLongitude: Camera longitude (degrees)
- cameraLatitude: Camera latitude (degrees) 
- cameraHeight: Camera height (meters)
- scale: Model scale (default: 1.0)
- heading: Model heading in degrees (default: 0)
- pitch: Model pitch in degrees (default: 0)
- roll: Model roll in degrees (default: 0)
- category: Model category (optional)
- tags: Model tags (optional)
- isPublic: Is public model (default: true)
```

**Response:**
```json
{
  "success": true,
  "message": "Model uploaded and processed successfully",
  "data": {
    "id": "uuid",
    "name": "Model name",
    "url": "/models/{modelId}/tileset.json",
    "longitude": 106.6297,
    "latitude": 10.8231,
    "height": 45,
    "tileset": { /* tileset.json content */ },
    "tilesetUrl": "/models/{modelId}/tileset.json"
  }
}
```

### 2. Get Active Models for Map
```
GET /api/models/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Model name",
      "tilesetUrl": "/models/{modelId}/tileset.json",
      "position": {
        "longitude": 106.6297,
        "latitude": 10.8231,
        "height": 45
      },
      "orientation": {
        "heading": 0,
        "pitch": 0,
        "roll": 0
      },
      "scale": 1.0
    }
  ],
  "count": 1
}
```

### 3. Get Model Tileset
```
GET /api/models/{modelId}/tileset
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": { /* model info */ },
    "tileset": { /* tileset.json content */ },
    "tilesetUrl": "/models/{modelId}/tileset.json"
  }
}
```

## File Structure

```
wwwroot/
  models/
    {modelId}/
      tileset.json    # 3D Tiles tileset configuration
      tileset.b3dm    # Binary 3D Model
```

## 3D Tiles Format

Tileset.json structure:
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
      "uri": "tileset.b3dm"
    },
    "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
  }
}
```

## Frontend Integration

### Load 3D Tiles trong Cesium

```javascript
// Lấy danh sách models
const response = await fetch('/api/models/active');
const { data: models } = await response.json();

// Load từng model vào Cesium viewer
models.forEach(model => {
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: `${API_BASE_URL}${model.tilesetUrl}`,
    })
  );
  
  // Set model properties
  tileset.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(
      model.position.longitude,
      model.position.latitude,
      model.position.height
    )
  );
});
```

## CORS Configuration

Server đã được cấu hình CORS cho phép frontend access các file 3D Tiles:
- Header: `Access-Control-Allow-Origin: *`
- Content-Type tự động được set cho các file .json, .b3dm, .i3dm, .pnts, .cmpt

## Error Handling

Common errors:
- `400`: Invalid GLB file or missing required fields
- `401`: Unauthorized (for upload)
- `404`: Model or tileset not found
- `500`: Processing error during GLB to B3DM conversion

## Dependencies

- `3d-tiles-tools@^0.5.0`: GLB to B3DM conversion
- `@prisma/client`: Database operations
- `multer`: File upload handling
- `fs-extra`: File system operations
