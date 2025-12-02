export interface User {
  email: string;
  username: string;
  name: string | null;
  phone: string | null;
  timestamp: Date;
  avatar: string | null;
}

export type Item = {
  user: Partial<User>;
  id: number;
  email: string;
  name: string;
  category_id: number;
  quantity: number;
  condition: string | null;
  expiry: Date | null;
  location: JSON;
  description: string | null;
  timestamp: Date;
  available: boolean;
  images: JSON | null;
  category: ItemCategory;
};

export type ItemCategory = {
  id: number;
  name: string;
  image: string | null;
};

export type MessageResponse = {
  message: string;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Extend Axios types
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
