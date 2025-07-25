# 🏗️ DTHub Platform - Project Structure Overview

## 📋 Tổng quan Project

**DTHub Platform** là một hệ thống Digital Twin hoàn chỉnh với:

- **Backend**: Node.js + Express.js + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + App Router + TypeScript + Tailwind CSS

## 🗂️ Cấu trúc thư mục

```
MapVN/
├── Documents/                        # Documentation
│   ├── TEAM_TECHNOLOGY_STACK_GUIDE_4Team.md
│   ├── WWWROOT_STRUCTURE_GUIDE.md
│   └── VietNam/                      # GeoJSON data
│       ├── TinhThanh/
│       └── XaPhuong/
│
├── backend/                          # Backend API Server
│   ├── src/
│   │   ├── controllers/              # Business logic controllers
│   │   │   ├── authController.js
│   │   │   ├── modelController.js
│   │   │   ├── geojsonController.js
│   │   │   └── categoryController.js
│   │   ├── api/                   # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── models.js
│   │   │   ├── geojsons.js
│   │   │   ├── categories.js
│   │   │   ├── users.js
│   │   │   └── admin.js
│   │   ├── middleware/               # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   ├── services/                 # Business logic services
│   │   ├── utils/                    # Utility functions
│   │   │   ├── validation.js
│   │   │   └── helpers.js
│   │   ├── config/                   # Configuration files
│   │   │   └── database.js
│   │   └── server.js                 # Main application entry
│   ├── prisma/                       # Database schema & migrations
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── uploads/                      # File upload directory
│   ├── docs/                         # API documentation
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/                         # Frontend Application
    ├── app/                          # Next.js App Router
    │   ├── globals.css              # Global styles
    │   ├── layout.tsx               # Root layout
    │   └── page.tsx                 # Home page
    ├── components/                   # React components
    │   └── ui/                      # UI components (shadcn/ui)
    │       ├── button.tsx
    │       └── card.tsx
    ├── lib/                         # Utility libraries
    │   ├── api.ts                   # API service
    │   └── utils.ts                 # Utility functions
    ├── hooks/                       # Custom React hooks
    ├── types/                       # TypeScript type definitions
    │   └── index.ts
    ├── next.config.js              # Next.js configuration
    ├── tailwind.config.js          # Tailwind CSS configuration
    ├── package.json
    ├── .env.example
    └── README.md
```

## 🚀 Cài đặt và chạy Project

### 1. Setup Backend

```bash
cd backend
chmod +x setup.sh
./setup.sh

# Hoặc manual:
npm install
cp .env.example .env
# Edit .env với database credentials
npx prisma generate
npx prisma migrate deploy
npx prisma db push # optional
npm run db:seed
npm run dev
```

Backend sẽ chạy tại: **http://localhost:4000**

### 2. Setup Frontend

```bash
cd frontend
chmod +x setup.sh
./setup.sh

# Hoặc manual:
npm install
cp .env.example .env.local
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🔧 Tech Stack Details

### Backend Stack
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 20+ | Server runtime |
| **Framework** | Express.js | 4.21+ | Web framework |
| **Database** | PostgreSQL + PostGIS | 16+ | Spatial database |
| **ORM** | Prisma | 6.10+ | Database ORM |
| **Authentication** | JWT + bcryptjs | Latest | Auth & password hashing |
| **Validation** | Joi + express-validator | Latest | Input validation |
| **File Upload** | Multer | Latest | File handling |
| **Security** | Helmet + CORS + Rate Limiting | Latest | Security middleware |

### Frontend Stack
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 14+ | React framework |
| **Language** | TypeScript | 5+ | Type safety |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **UI Components** | Shadcn/ui | Latest | Component library |
| **HTTP Client** | Axios | Latest | API calls |
| **State Management** | React Hooks | 18+ | Local state |

## 📡 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Models Management
- `GET /api/models` - List all models
- `GET /api/models/:id` - Get model by ID
- `POST /api/models` - Create new model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Category hierarchy
- `POST /api/categories` - Create category (Admin)

### Admin Operations
- `POST /api/admin/upload-model` - Upload 3D models
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management

## 🧪 Testing the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test API Integration

Truy cập **http://localhost:3000** và sử dụng các nút test:

- **🏥 Health Check** - Kiểm tra backend connectivity
- **🏗️ Get Models** - Lấy danh sách 3D models
- **📋 Get Categories** - Lấy danh sách categories
- **🌳 Categories Tree** - Lấy cây phân cấp categories
- **🔑 Test Login** - Test đăng nhập với user demo
- **📝 Test Register** - Test đăng ký user mới

### 4. Test Credentials

```
Admin: admin@dthub.com / admin123456
User: user@dthub.com / user123456
```

## 📊 Database Schema

### Core Tables
- **users** - User management với JWT auth
- **models** - 3D models với spatial positioning
- **geojsons** - GeoJSON data management
- **categories** - Hierarchical categorization

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin/User/Viewer)
- Password hashing với bcryptjs
- Rate limiting
- CORS protection
- Input validation
- File upload restrictions

## 🎯 Next Steps

1. **✅ Backend API** - Hoàn thành và sẵn sàng
2. **✅ Frontend Basic** - Hello World với API testing
3. **🔄 In Progress**: Advanced UI components
4. **📋 Todo**: Dashboard và Map integration
5. **📋 Todo**: Admin panel
6. **📋 Todo**: 3D model viewer với Cesium

## 🚀 Production Deployment

### Backend
- PM2 process management
- Environment variables configuration
- PostgreSQL database setup
- File upload directory permissions

### Frontend
- Next.js production build
- Vercel deployment ready
- Environment variables setup
- Static asset optimization

---

**📅 Created**: July 23, 2025  
**👥 Team**: DTHub Development Team  
**🔄 Version**: 1.0.0 - Basic Setup Complete
