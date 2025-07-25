# Components Structure

Cấu trúc thư mục components đã được tổ chức lại để dễ quản lý và tái sử dụng:

## 📁 Cấu trúc thư mục

```
components/
├── features/           # Components chức năng cụ thể
│   ├── AuthPage.tsx   # Trang đăng nhập/đăng ký
│   ├── GLBUpload.tsx  # Upload file GLB 3D models
│   └── index.ts       # Export file
├── layout/            # Components bố cục trang
│   ├── MapViewer.tsx  # Layout chính của ứng dụng
│   └── index.ts       # Export file  
├── map/               # Components liên quan đến bản đồ
│   ├── CesiumMap.tsx  # Component bản đồ Cesium
│   └── index.ts       # Export file
├── ui/                # Components UI tái sử dụng
│   ├── button.tsx     # Button component
│   ├── card.tsx       # Card component
│   ├── tabs.tsx       # Tabs component
│   └── index.ts       # Export file
└── index.ts           # Export tổng
```

## 🎯 Phân loại Components

### UI Components (`/ui`)
- **Mục đích**: Components cơ bản được tái sử dụng nhiều lần
- **Đặc điểm**: Không chứa logic business, chỉ hiển thị và tương tác cơ bản
- **Ví dụ**: Button, Card, Tabs, Input, Modal...

### Feature Components (`/features`)  
- **Mục đích**: Components thực hiện chức năng cụ thể
- **Đặc điểm**: Chứa logic business, tương tác với API
- **Ví dụ**: AuthPage (đăng nhập), GLBUpload (upload file)

### Map Components (`/map`)
- **Mục đích**: Components liên quan đến bản đồ và 3D
- **Đặc điểm**: Tích hợp thư viện bản đồ, xử lý dữ liệu địa lý
- **Ví dụ**: CesiumMap (bản đồ 3D)

### Layout Components (`/layout`)
- **Mục đích**: Components bố cục trang và kết nối các feature
- **Đặc điểm**: Quản lý state chung, điều phối giữa các components
- **Ví dụ**: MapViewer (layout chính)

## 📝 Cách sử dụng

### Import từ thư mục cụ thể:
```tsx
import { AuthPage } from '@/components/features';
import { CesiumMap } from '@/components/map';
import { Button, Card } from '@/components/ui';
import { MapViewer } from '@/components/layout';
```

### Import trực tiếp:
```tsx
import AuthPage from '@/components/features/AuthPage';
import CesiumMap from '@/components/map/CesiumMap';
import { Button } from '@/components/ui/button';
```

### Import từ file index chính:
```tsx
import { AuthPage, CesiumMap, Button, MapViewer } from '@/components';
```

## 🔧 Thay đổi đã thực hiện

1. **Loại bỏ file trùng lặp**: 
   - Xóa `CesiumMapFixed.tsx` (trùng với CesiumMap.tsx)
   - Xóa `CesiumMap.tsx.backup` (file backup)
   - Xóa `ModelList.tsx` (file trống)

2. **Phân loại và di chuyển**:
   - AuthPage, GLBUpload → `/features`
   - CesiumMap → `/map`  
   - MapViewer → `/layout`
   - Button, Card, Tabs → `/ui` (giữ nguyên)

3. **Cập nhật import paths**:
   - Tất cả import đã được cập nhật theo cấu trúc mới
   - Thêm export cho CameraPosition interface

4. **Tạo index files**:
   - Mỗi thư mục có file index.ts để export
   - File index.ts chính để import tập trung

## 🚀 Lợi ích

- **Tổ chức rõ ràng**: Dễ tìm kiếm và quản lý components
- **Tái sử dụng tốt hơn**: UI components tách biệt khỏi logic business  
- **Bảo trì dễ dàng**: Thay đổi một component không ảnh hưởng đến khác
- **Mở rộng linh hoạt**: Dễ thêm components mới vào đúng thư mục
- **Import đơn giản**: Nhiều cách import linh hoạt
