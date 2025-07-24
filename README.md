# MapVN - 3D Model Management System

Hệ thống quản lý mô hình 3D với CesiumJS, cho phép upload file GLB và chuyển đổi sang 3D Tiles.

## 🚀 Tính năng chính

### ✅ Upload và quản lý mô hình GLB
- Upload file GLB từ giao diện web
- Tự động chuyển đổi GLB sang B3DM (3D Tiles)
- Tạo tileset.json tự động
- Lưu trữ có tổ chức trong thư mục `/wwwroot/3dmodel/`

### ✅ Định vị và căn chỉnh mô hình
- Lấy tọa độ camera hiện tại từ CesiumJS
- Tự động đặt mô hình dưới mặt đất (offset -5m)
- Điều chỉnh scale, heading, pitch, roll
- Lưu cài đặt khi nhấn nút "Lưu"

### ✅ Xác thực người dùng
- Đăng nhập/Đăng ký
- Phân quyền Admin/User
- Demo accounts có sẵn

### ✅ Giao diện hiện đại
- Next.js với App Router
- CesiumJS tích hợp
- UI components với Tailwind CSS
- Responsive design

## 🛠️ Cài đặt và chạy

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL
- npm hoặc yarn

### 1. Cài đặt Backend

```bash
cd backend
npm install

# Cài đặt 3d-tiles-tools để chuyển đổi GLB
npm install -g 3d-tiles-tools

# Copy và cấu hình environment variables
cp .env.example .env
# Chỉnh sửa DATABASE_URL và các cài đặt khác trong .env

# Tạo database từ schema và seed data
npx prisma db push
npm run db:seed

# Chạy backend server
npm run dev
```

### 2. Cài đặt Frontend

```bash
cd frontend
npm install

# Copy và cấu hình environment variables
cp .env.example .env.local
# Chỉnh sửa BACKEND_URL và CESIUM_ION_ACCESS_TOKEN nếu có

# Chạy frontend development server
npm run dev
```

### 3. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 🔐 Demo Accounts

### Admin Account
- Email: `admin@dthub.com`
- Password: `admin123456`

### User Account
- Email: `user@dthub.com`
- Password: `user123456`

## 📂 Cấu trúc thư mục

```
MapVN/
├── backend/
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Service layer
│   │   └── server.js      # Main server file
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Database seeding
│   └── uploads/           # Temporary file uploads
├── frontend/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   │   ├── CesiumMap.tsx  # 3D Map component
│   │   ├── GLBUpload.tsx  # File upload form
│   │   ├── MapViewer.tsx  # Main application
│   │   └── AuthPage.tsx   # Authentication
│   └── lib/               # Utilities
└── wwwroot/
    ├── 3dmodel/           # Processed 3D models
    └── geojsonmodel/      # GeoJSON data
```

## 🔄 Quy trình xử lý GLB

1. **Upload GLB**: Người dùng chọn file GLB và cấu hình thuộc tính
2. **Lấy vị trí camera**: Tự động lấy tọa độ camera hiện tại
3. **Chuyển đổi**: GLB → B3DM sử dụng 3d-tiles-tools
4. **Tạo tileset.json**: Cấu hình metadata cho 3D Tiles
5. **Lưu database**: Thông tin mô hình và vị trí
6. **Hiển thị**: Mô hình xuất hiện trên bản đồ 3D

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Models
- `GET /api/models` - Lấy danh sách mô hình
- `POST /api/models/upload` - Upload mô hình GLB
- `PUT /api/models/:id` - Cập nhật thuộc tính mô hình
- `DELETE /api/models/:id` - Xóa mô hình

## 🗂️ Database Schema

### Models Table
```sql
CREATE TABLE models (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,              -- File path trong organized structure
    file_size INTEGER,
    mime_type TEXT,
    
    -- Spatial positioning
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION DEFAULT 0,
    scale DOUBLE PRECISION DEFAULT 1.0,
    heading DOUBLE PRECISION DEFAULT 0,
    pitch DOUBLE PRECISION DEFAULT 0,
    roll DOUBLE PRECISION DEFAULT 0,
    
    -- Metadata
    model_category TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Relations
    user_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id)
);
```

## ⚙️ Cấu hình

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/MapVN_test"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key"
PORT=4000
```

#### Frontend (.env.local)
```env
BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN="your-cesium-ion-token"
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker (Optional)
```bash
# Build và chạy với Docker Compose
docker-compose up --build
```

## 🛟 Troubleshooting

### Common Issues

1. **GLB conversion fails**
   - Đảm bảo `3d-tiles-tools` được cài đặt global
   - Kiểm tra file GLB có hợp lệ không

2. **Models không hiển thị**
   - Kiểm tra đường dẫn `/3dmodel/` có serve static files không
   - Verify tileset.json được tạo đúng

3. **Authentication issues**
   - Kiểm tra JWT_SECRET trong .env
   - Verify database connection

### Debug Commands
```bash
# Check 3d-tiles-tools installation
npx 3d-tiles-tools --version

# Test API endpoints
curl http://localhost:4000/health

# Check database connection
npm run db:generate
```

## 📝 TODO / Roadmap

- [ ] Thêm preview thumbnail cho models
- [ ] Batch upload multiple GLB files
- [ ] Advanced positioning với terrain following
- [ ] Model animation support
- [ ] Export/Import project data
- [ ] Real-time collaboration
- [ ] Performance optimization for large models

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend**: Express.js + Prisma ORM + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **3D Engine**: CesiumJS + 3D Tiles
- **File Processing**: 3d-tiles-tools

---

**MapVN** - Xây dựng bởi DTHub Team với ❤️ cho cộng đồng phát triển 3D GIS tại Việt Nam.
