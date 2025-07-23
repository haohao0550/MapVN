// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    models: number;
    geojsons: number;
  };
}

// Model types
export interface Model {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  scale?: number;
  isPublic: boolean;
  isActive: boolean;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  categoryId?: string;
  category?: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  createdAt: string;
  updatedAt: string;
}

// GeoJSON types
export type GeoJsonType = 
  | 'POINT' 
  | 'LINESTRING' 
  | 'POLYGON' 
  | 'MULTIPOINT' 
  | 'MULTILINESTRING' 
  | 'MULTIPOLYGON' 
  | 'FEATURE' 
  | 'FEATURECOLLECTION';

export interface GeoJson {
  id: string;
  name: string;
  description?: string;
  type: GeoJsonType;
  data: any; // GeoJSON data
  isPublic: boolean;
  isActive: boolean;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  categoryId?: string;
  category?: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Cesium types
export interface CesiumPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface CesiumOrientation {
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface ModelEntity extends CesiumPosition, CesiumOrientation {
  id: string;
  name: string;
  url: string;
  scale?: number;
  show?: boolean;
}

// Admin stats
export interface AdminStats {
  users: number;
  models: number;
  geojsons: number;
  categories: number;
}
