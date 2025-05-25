
// Using string for datetime fields as they often come from/go to APIs/DBs as ISO strings.
// Date objects can be parsed as needed.

export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string; // ISO datetime string
  balance: number; // Simplified for frontend, join from balances table
}

export type PostPaymentAction = 'auto_fulfillment' | 'chat_with_manager';

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  active: boolean;
  created_at: string; // ISO datetime string
  image?: string; // URL to image
  "data-ai-hint"?: string; // For Unsplash keyword search, max 2 words
  post_payment_action?: PostPaymentAction;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  image?: string; // URL to image
  "data-ai-hint"?: string; // For Unsplash keyword search, max 2 words
  active: boolean;
  created_at: string; // ISO datetime string
  parent_id?: string; // For hierarchy
  _depth?: number; // Internal for tree rendering
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  status: OrderStatus;
  amount: number;
  payment_gateway?: string;
  external_order_id?: string;
  created_at: string; // ISO datetime string
  paid_at?: string; // ISO datetime string
  delivery_payload?: Record<string, any>; // JSON or structured object
}

export interface ProxyOrder {
  id: string;
  order_id: string;
  proxy_id_api?: string;
  host: string;
  port: number;
  user_login?: string;
  user_pass?: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  country?: string;
  created_at: string; // ISO datetime string
  expires_at: string; // ISO datetime string
}

export interface Balance {
  id: string;
  user_id: string;
  amount: number;
  updated_at: string; // ISO datetime string
}

export interface Role {
  id: string;
  name: 'Admin' | 'Moderator' | 'Operator' | 'Read-only';
  description?: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  start_date: string; // ISO datetime string
  end_date: string; // ISO datetime string
  status: SubscriptionStatus;
  auto_renew: boolean;
}

export type ChatStatus = 'open' | 'closed' | 'pending_operator';

export interface Chat {
  id: string;
  user_id: string;
  operator_id?: string;
  created_at: string; // ISO datetime string
  status: ChatStatus;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string; // Can be user_id or operator_id
  text: string;
  created_at: string; // ISO datetime string
  is_read: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string; // Admin/Moderator/Operator performing the action
  action: string; // e.g., 'create_product', 'update_user_balance'
  entity: string; // e.g., 'product', 'user'
  entity_id: string;
  timestamp: string; // ISO datetime string
  details?: Record<string, any>; // JSON of changes or context
}

export type NotificationType = 'broadcast' | 'alert' | 'info';

export interface Notification {
  id: string;
  user_id?: string; // Target user, if null then it's a general/all-users notification
  type: NotificationType;
  content: string;
  created_at: string; // ISO datetime string
  read: boolean;
}

// For table display, often helpful to have combined types
export interface UserWithDetails extends User {
  ordersCount: number;
  activeSubscriptionsCount: number;
}

export interface OrderWithDetails extends Order {
  user_username?: string;
  product_name?: string;
}

export interface SubscriptionWithDetails extends Subscription {
  user_username?: string;
  product_name?: string;
}

    
