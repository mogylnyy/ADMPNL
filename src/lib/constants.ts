import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, FolderTree, AlertTriangle } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: string[]; // For active link matching
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchSegments: [''] },
  { href: '/products', label: 'Products', icon: Package, matchSegments: ['products'] },
  { href: '/categories', label: 'Categories', icon: FolderTree, matchSegments: ['categories'] },
  { href: '/users', label: 'Users', icon: Users, matchSegments: ['users'] },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, matchSegments: ['orders'] },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard, matchSegments: ['subscriptions'] },
];

export const APP_NAME = "SubMan Admin";
export const APP_DESCRIPTION = "Admin Panel for Telegram WebApp Subscription Store";

export const MOCK_USER_ID_FOR_AI = "user_admin_01"; // Placeholder for AI audit logs or actions
