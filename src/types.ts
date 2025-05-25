export type Subscription = {
  id: number;
  user_id: number;
  product_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionWithDetails = Subscription & {
  user?: User;
  product?: Product;
};

export type User = {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  balance?: number;
};

export type Product = {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image?: string;
  active?: boolean;
  created_at?: string;
}; 