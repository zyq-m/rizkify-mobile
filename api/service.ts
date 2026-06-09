export type Category = {
  _count?: { items: number };
  description: string | null;
  id: string;
  createdAt: string;
  name: string;
  updatedAt: string;
};

export type Condition = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  imageUrl?: string | null;
  location?: any;
  createdAt?: string;
};

export type ItemImage = {
  id: string;
  imageUrl: string;
  itemId: string;
  createdAt: string;
};

export type Item = {
  id: string;
  name: string;
  quantity: number;
  expiry: string;
  description: string | null;
  location: any;
  locationDescription: string | null;
  userId: string;
  categoryId: string;
  conditionId: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemResponse = Item & {
  user: User;
  images: ItemImage[];
  category: Partial<Category>;
  likedBy: { id: string; userId: string }[];
  requests: RequestItem[];
  isLiked: boolean;
  distance: number;
  distanceText: string;
};

export type MyItemRes = Item & {
  images: ItemImage[];
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

export type ItemRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type RequestItem = {
  id: string;
  status: ItemRequestStatus;
  quantity: number;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  providerId: string;
  itemId: string;
  requester: Partial<User>;
};

export type ReqItemResponse = RequestItem & {
  item: Item & { images: ItemImage[] };
  provider: User;
};

export type Message = {
  id: string;
  content: string;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
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
    sender: { id: string; name: string };
    isFromCurrentUser: boolean;
    isRead: boolean;
    createdAt: string;
  };
  unreadCount: number;
  totalMessages: number;
  updatedAt: string;
};

export type GetMessageRes = RequestItem & {
  provider: Partial<User>;
  requester: Partial<User>;
  chats: Message[];
  item: Partial<Item> & { images: ItemImage[] };
};
