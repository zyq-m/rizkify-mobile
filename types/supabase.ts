export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      conditions: {
        Row: ConditionRow;
        Insert: ConditionInsert;
        Update: ConditionUpdate;
      };
      items: {
        Row: ItemRow;
        Insert: ItemInsert;
        Update: ItemUpdate;
      };
      item_images: {
        Row: ItemImageRow;
        Insert: ItemImageInsert;
        Update: ItemImageUpdate;
      };
      liked_items: {
        Row: LikedItemRow;
        Insert: LikedItemInsert;
        Update: LikedItemUpdate;
      };
      item_requests: {
        Row: ItemRequestRow;
        Insert: ItemRequestInsert;
        Update: ItemRequestUpdate;
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: ChatMessageInsert;
        Update: ChatMessageUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      UserRole: 'USER' | 'ADMIN';
      RequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    };
  };
}

export type UserRole = Database['public']['Enums']['UserRole'];
export type RequestStatus = Database['public']['Enums']['RequestStatus'];

export interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  is_suspended: boolean;
  location: Json | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type UserInsert = Pick<UserRow, 'email' | 'name' | 'phone'> & Partial<Omit<UserRow, 'email' | 'name' | 'phone'>>;
export type UserUpdate = Partial<Omit<UserRow, 'id'>>;

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Pick<CategoryRow, 'name'> & Partial<Omit<CategoryRow, 'name'>>;
export type CategoryUpdate = Partial<Omit<CategoryRow, 'id'>>;

export interface ConditionRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type ConditionInsert = Pick<ConditionRow, 'name'> & Partial<Omit<ConditionRow, 'name'>>;
export type ConditionUpdate = Partial<Omit<ConditionRow, 'id'>>;

export interface ItemRow {
  id: string;
  name: string;
  quantity: number;
  expiry: string;
  description: string | null;
  location: Json;
  location_description: string | null;
  user_id: string;
  category_id: string;
  condition_id: string;
  created_at: string;
  updated_at: string;
}

export type ItemInsert = Pick<ItemRow, 'name' | 'expiry' | 'location' | 'user_id' | 'category_id' | 'condition_id'> & Partial<Omit<ItemRow, 'name' | 'expiry' | 'location' | 'user_id' | 'category_id' | 'condition_id'>>;
export type ItemUpdate = Partial<Omit<ItemRow, 'id'>>;

export interface ItemImageRow {
  id: string;
  image_url: string;
  item_id: string;
  created_at: string;
}

export type ItemImageInsert = Pick<ItemImageRow, 'image_url' | 'item_id'> & Partial<Omit<ItemImageRow, 'image_url' | 'item_id'>>;
export type ItemImageUpdate = Partial<Omit<ItemImageRow, 'id'>>;

export interface LikedItemRow {
  id: string;
  user_id: string;
  item_id: string;
}

export type LikedItemInsert = Pick<LikedItemRow, 'user_id' | 'item_id'>;
export type LikedItemUpdate = Partial<Omit<LikedItemRow, 'id'>>;

export interface ItemRequestRow {
  id: string;
  status: RequestStatus;
  quantity: number;
  message: string | null;
  requester_id: string;
  provider_id: string;
  item_id: string;
  created_at: string;
  updated_at: string;
}

export type ItemRequestInsert = Pick<ItemRequestRow, 'requester_id' | 'provider_id' | 'item_id'> & Partial<Omit<ItemRequestRow, 'requester_id' | 'provider_id' | 'item_id'>>;
export type ItemRequestUpdate = Partial<Omit<ItemRequestRow, 'id'>>;

export interface ChatMessageRow {
  id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  sender_id: string;
  receiver_id: string;
  item_request_id: string;
  created_at: string;
}

export type ChatMessageInsert = Pick<ChatMessageRow, 'content' | 'sender_id' | 'receiver_id' | 'item_request_id'> & Partial<Omit<ChatMessageRow, 'content' | 'sender_id' | 'receiver_id' | 'item_request_id'>>;
export type ChatMessageUpdate = Partial<Omit<ChatMessageRow, 'id'>>;
