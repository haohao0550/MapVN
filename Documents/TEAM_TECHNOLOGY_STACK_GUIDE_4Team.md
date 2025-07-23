# 📋 DTHub Platform - Technology Stack Guide (Final Version)

## 🎯 **Tổng quan Dự án**

**DTHub** là nền tảng Digital Twin cho quản lý hạ tầng đô thị thông minh, được xây dựng với kiến trúc đơn giản và hiệu quả.

---

## 🏗️ **Technology Stack Hiện Tại**

### **📊 Core Technologies**

| **Layer** | **Technology** | **Version** | **Purpose** |
|-----------|----------------|-------------|-------------|
| **Database** | PostgreSQL + PostGIS | 16+ | Spatial database with geospatial capabilities |
| **Backend** | Node.js + Express.js + Prisma | 20+, 4.21+, 6.10+ | RESTful API with modern ORM |
| **Admin Interface** | ModelManagerAdvanced.js | Latest | Custom model and data management |
| **Frontend** | Next.js 14 + App Router | 14+ | Full-stack React framework |
| **UI Library** | Shadcn/ui + Tailwind CSS | Latest | Component library + utility-first CSS |
| **3D Engine** | Cesium | 1.120+ | Advanced 3D visualization |
| **Map Providers** | GoogleMap + OSM + Map4D + Mapbox | Latest | Multiple map provider support |
| **Data Formats** | GeoJSON + CZML + KML + GLB/GLTF | Standard | Comprehensive geospatial data |

---

## 🏛️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                   DTHubMap Frontend Application                │
│                     (Development Server)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌───────────────┐   ┌─────────────────┐ │
│  │ DTHubMap UI     │   │ Cesium 3D     │   │ Admin Interface │ │
│  │ - Map Interface │   │ - Globe       │   │ - Model Upload  │ │
│  │ - Data Layers   │   │ - Terrain     │   │ - Data Mgmt     │ │
│  │ - Tools         │   │ - 3D Models   │   │ - Categories    │ │
│  └─────────────────┘   └───────────────┘   └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    HTTP API Calls                              │
├─────────────────────────────────────────────────────────────────┤
│                  Express.js Backend Server                     │
│                        (Port 4000)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌───────────────┐   ┌─────────────────┐ │
│  │ API Routes      │   │ Middleware    │   │ File Management │ │
│  │ - /api/auth     │   │ - CORS        │   │ - /uploads      │ │
│  │ - /api/models   │   │ - JWT Auth    │   │ - Multer        │ │
│  │ - /api/geojsons │   │ - Body Parser │   │ - Static Files  │ │
│  │ - /api/admin    │   │ - Error       │   │ - Organized     │ │
│  └─────────────────┘   └───────────────┘   └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Prisma ORM                              │
├─────────────────────────────────────────────────────────────────┤
│                  PostgreSQL + PostGIS Database                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 **API Endpoints**

### **Authentication**
```javascript
POST   /api/auth/register     // User registration
POST   /api/auth/login        // User login
GET    /api/auth/profile      // Get user profile
```

### **Models Management**
```javascript
GET    /api/models            // List all models
GET    /api/models/:id        // Get model by ID
POST   /api/models            // Create new model
DELETE /api/models/:id        // Delete model
```

### **Admin Operations (JWT Required)**
```javascript
POST   /api/admin/upload-model       // Upload 3D models
DELETE /api/admin/delete-uploaded-file // Delete files
DELETE /api/admin/models/:id         // Delete model + files
```

### **GeoJSON Data**
```javascript
GET    /api/geojsons          // List GeoJSON data
POST   /api/geojsons          // Create GeoJSON
DELETE /api/geojsons/:id      // Delete GeoJSON
```

### **Categories**
```javascript
GET    /api/categories        // List categories
POST   /api/categories        // Create category
GET    /api/categories/tree   // Category hierarchy
```

---

## 💾 **Database Schema**

### **Core Tables**
```sql
-- Users (INTEGER ID với JWT auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,        -- bcryptjs hashed
    "firstName" TEXT,
    "lastName" TEXT,
    role "Role" DEFAULT 'USER' NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 3D Models với spatial positioning
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,             -- File path trong organized structure
    "fileSize" INTEGER,
    "mimeType" TEXT,
    
    -- Spatial positioning
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION DEFAULT 0,
    scale DOUBLE PRECISION DEFAULT 1.0,
    heading DOUBLE PRECISION DEFAULT 0,
    pitch DOUBLE PRECISION DEFAULT 0,
    roll DOUBLE PRECISION DEFAULT 0,
    
    -- Metadata
    category TEXT,
    tags TEXT[],
    "isPublic" BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    -- Relations
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "categoryId" INTEGER REFERENCES categories(id)
);

-- GeoJSON Data
CREATE TABLE geojsons (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL,           -- GeoJSON content
    category TEXT,
    tags TEXT[],
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "categoryId" INTEGER REFERENCES categories(id)
);

-- Categories với hierarchy
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "parentId" INTEGER REFERENCES categories(id),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

---

## 🗂️ **File Organization**

### **Upload Structure**
```
uploads/
└── models/
    └── 2025/
        └── 07/               # Year/Month organization
            ├── model1.glb
            ├── model2.gltf
            └── ...
```

### **Project Structure**
```
dthub/
├── backend-standalone/       # Express.js + Prisma backend
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   ├── prisma/              # Database schema & migrations
│   ├── uploads/             # Organized file uploads
│   └── wwwroot/             # Static files
│
├── TerriaMap/               # DTHubMap frontend
│   ├── lib/                 # DTHubMap libraries
│   ├── wwwroot/             # Built application
│   ├── package.json         # DTHubMap dependencies
│   └── gulpfile.js          # Build configuration
│
└── docs/                    # Documentation
```

---

## 🛠️ **Development Setup**

### **Backend (backend-standalone)**
```bash
cd backend-standalone

# Install dependencies
npm install

# Environment setup (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/dthubdb"
JWT_SECRET="your-secret-key"
PORT=4000

# Database setup
npx prisma migrate deploy
npx prisma generate
npm run seed

# Start server
npm start                    # Production
npm run dev                  # Development with ts-node
```

### **Frontend (TerriaMap)**
```bash
cd TerriaMap

# Install dependencies
npm install

# Start development
npm start                    # Development server
npm run build               # Production build
```

### **Database Setup**
```bash
# PostgreSQL + PostGIS
sudo apt-get install postgresql postgresql-contrib postgis

# Create database
sudo -u postgres createdb dthubdb
sudo -u postgres createuser dthubuser

# Setup PostGIS
sudo -u postgres psql dthubdb
CREATE EXTENSION postgis;
```

---

## 🔧 **Key Features**

### **✅ Implemented**
- **JWT Authentication**: Secure user management
- **3D Model Upload**: GLB/GLTF support với organized storage
- **GeoJSON Management**: Data upload và visualization
- **Spatial Positioning**: Longitude, latitude, height, rotation
- **Category System**: Hierarchical organization
- **Admin Interface**: ModelManagerAdvanced.js
- **Multi-format Support**: GeoJSON, KML, CZML
- **Responsive Design**: Mobile và desktop compatibility

### **🔐 Security**
- **JWT-based Auth**: Secure token authentication
- **Password Hashing**: bcryptjs implementation
- **Role-based Access**: Admin/User/Viewer roles
- **File Validation**: Upload type và size restrictions
- **CORS Protection**: Configured for cross-origin requests

---

## 📈 **Performance & Best Practices**

### **Database Optimization**
- **Spatial Indexes**: PostGIS GIST indexes cho location queries
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Indexed searches và pagination

### **File Management**
- **Organized Structure**: Year/month directory hierarchy
- **Upload Limits**: Configurable file size restrictions
- **Static Serving**: Express static middleware cho performance

### **Frontend Performance**
- **Cesium Optimization**: LOD và tile-based rendering
- **Data Streaming**: Efficient data loading cho large datasets
- **Caching**: Browser caching cho static assets

---

## 🚀 **Deployment Ready**

**DTHub Platform** đã sẵn sàng để triển khai với:

✅ **Stable Technology Stack**: Express.js + Prisma + DTHubMap  
✅ **Secure Authentication**: JWT với role-based access  
✅ **Scalable Architecture**: Simple và maintainable  
✅ **3D Visualization**: Advanced Cesium-based mapping  
✅ **Data Management**: Comprehensive geospatial support  
✅ **Admin Interface**: User-friendly management tools  

---

**📅 Tài liệu được tạo**: 20 tháng 7, 2025  
**👥 Đối tượng**: Đội ngũ phát triển DTHub Platform  
**📞 Liên hệ**: Technical Lead - DTHub Development Team  
**🔄 Phiên bản**: Final v1.0 - Ready for Development
