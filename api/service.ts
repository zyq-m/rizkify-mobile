import { SearchLocation } from '@/components/custom/set-location-v2';
import api from './client';

export type MessageRes = {
  message: string;
};
export type LoginRes = MessageRes & {
  user: Partial<User>;
  token: Token;
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};

// Auth API calls
export const authAPI = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post<LoginRes>('/auth/register', data),

  login: (data: { email: string; password: string }) => api.post<LoginRes>('/auth/login', data),

  refreshToken: (data: { refreshToken: string }) => api.post('/auth/refresh', data),

  logout: (data: { refreshToken: string }) => api.post<MessageRes>('/auth/logout', data),

  logoutAll: (data: { refreshToken: string }) => api.post('/auth/logout-all', data),
};

export type Category = {
  _count: {
    items: number;
  };
  description: string;
  id: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
};

export type Expiry = {
  id: string;
  label: string;
  value: string;
};

export type Condition = { id: string; name: string };
// Lookup API calls
export const lookupAPI = {
  getCategories: () => api.get<Category[]>('/lookup/categories'),

  getCategory: (id: string) => api.get(`/lookup/categories/${id}`),

  getExpiry: () => api.get<Expiry[]>('/lookup/expiries'),

  getConditon: () => api.get<Condition[]>('/lookup/conditions'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get<User>('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string; location?: string }) =>
    api.put<{ message: string; user: User }>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/users/change-password', data),

  getMyItems: () => api.get<MyItemRes[]>('/users/my-items'),

  getLikedItems: () => api.get('/users/liked-items'),

  getMyRequests: () => api.get('/users/my-requests'),

  getReceivedRequests: () => api.get<ReqItemResponse[]>('/users/received-requests'),

  updateRequestStatus: (requestId: string, status: string) =>
    api.put(`/users/requests/${requestId}`, { status }),
};

export type Item = {
  description: string | null;
  id: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
  userId: string;
  quantity: number;
  availability: boolean;
  conditionId: string;
  location: SearchLocation;
  locationDescription: string | null;
  categoryId: string;
  expiry: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  location?: SearchLocation;
  createdAt?: Date;
};

export type Image = {
  id: string;
  createdAt: Date;
  imageUrl: string;
};

export type ItemResponse = Item & {
  user: User;
  images: Image[];
  category: Partial<Category>;
  likedBy: {
    id: string;
    userId: string;
  }[];
  requests: RequestItem[];
  isLiked: boolean;
  distance: number;
  distanceText: string;
};

export type MyItemRes = Item & {
  images: Image[];
  likeCount: number;
  pendingRequestCount: number;
  category: Partial<Category>;
};

export type TrendingItemRes = ItemResponse & {
  likeCount: number;
  isLiked: true;
  pendingRequest: number;
  trendingRank: number;
};

// Items API calls
export const itemsAPI = {
  getItems: (params?: {
    categoryId?: string;
    name?: string;
    sortBy?: 'latest' | 'nearest' | 'expiring';
    maxDistance?: string;
    lat?: string;
    lng?: string;
    search?: string;
  }) =>
    api.get<ItemResponse[]>('/items', {
      params: params,
    }),

  getTrendingItems: () => api.get<TrendingItemRes[]>('/items/trending'),

  getItem: (id: string) => api.get<ItemResponse>(`/items/${id}`),

  createItem: (formData: FormData) =>
    api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateItem: (id: string, formData: FormData) =>
    api.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  likeItem: (id: string) => api.post(`/items/${id}/like`),

  deleteItemImage: (itemId: string, imageId: string) =>
    api.delete(`/items/${itemId}/images/${imageId}`),
};

export type RequestItem = {
  id: string;
  status: ItemRequestStatus;
  quantity: number;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  requesterId: string;
  providerId: string;
  itemId: string;
  requester: Partial<User>;
};

export type ItemRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type ReqItemResponse = RequestItem & {
  item: Item & { images: Image[] };
  provider: User;
};

// Requests API calls
export const requestsAPI = {
  createRequest: (data: { itemId: string; message?: string }) => api.post('/requests', data),
  getRequest: () => api.get<ReqItemResponse[]>('/requests'),
  updateRequest: (data: { id: string; status: ItemRequestStatus }) =>
    api.put<ReqItemResponse>('/requests', data),
};

export type Message = {
  id: string;
  content: string;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  senderId: string;
  receiverId: string;
  itemRequestId: string;
};

export type MessageResponse = Message & {
  sender: Partial<User>;
  receiver: Partial<User>;
};

export type Conversation = {
  id: string;
  partner: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  item: {
    id: string;
    name: string;
    image: string | null;
  };
  request: {
    id: string;
    status: ItemRequestStatus;
    quantity: number;
    initialMessage: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
    isFromCurrentUser: boolean;
    isRead: boolean;
    createdAt: Date;
  };
  unreadCount: number;
  totalMessages: number;
  updatedAt: Date;
};

export type GetMessageRes = RequestItem & {
  provider: Partial<User>;
  requester: Partial<User>;
  chats: Message[];
  item: Partial<Item>;
};

// Chat API calls
export const chatAPI = {
  getConversations: () => api.get<Conversation[]>('/chat/conversations'),
  getMessages: (reqItemId: string) => api.get<GetMessageRes>(`/chat/messages/${reqItemId}`),
  sendMessage: (data: { receiverId: string; content: string; itemRequestId: string }) =>
    api.post<MessageResponse>('/chat/messages', data),
  sendImageMessage: (formData: FormData) =>
    api.post('/chat/messages/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markMessagesAsRead: (senderId: string) => api.put('/chat/messages/read', { senderId }),
  getUnreadCount: () => api.get('/chat/messages/unread/count'),
  searchUsers: (query: string) => api.get(`/chat/search-users?query=${query}`),
  deleteMessage: (messageId: string) => api.delete(`/chat/messages/${messageId}`),
};

// Admin API calls
export const adminAPI = {
  getUsers: () => api.get('/users'),
  suspendUser: (userId: string, suspend: boolean) =>
    api.put(`/users/${userId}/suspend`, { suspend }),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  getDashboardReports: () => api.get('/users/reports/dashboard'),
  createCategory: (data: { name: string; description?: string }) =>
    api.post('/lookup/categories', data),
  updateCategory: (id: string, data: { name: string; description?: string }) =>
    api.put(`/lookup/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/lookup/categories/${id}`),
};
