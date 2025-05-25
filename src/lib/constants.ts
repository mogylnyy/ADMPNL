import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, FolderTree, Send } from 'lucide-react'; // Added Send icon

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: string[]; // For active link matching
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard, matchSegments: [''] },
  { href: '/products', label: 'Товары', icon: Package, matchSegments: ['products'] },
  { href: '/categories', label: 'Категории', icon: FolderTree, matchSegments: ['categories'] },
  { href: '/users', label: 'Пользователи', icon: Users, matchSegments: ['users'] },
  { href: '/orders', label: 'Заказы', icon: ShoppingCart, matchSegments: ['orders'] },
  { href: '/subscriptions', label: 'Подписки', icon: CreditCard, matchSegments: ['subscriptions'] },
  { href: '/broadcasts', label: 'Рассылки', icon: Send, matchSegments: ['broadcasts'] }, // New Nav Item
];

export const APP_NAME = "SubMan Admin";
export const APP_DESCRIPTION = "Панель администратора для магазина подписок Telegram WebApp";

export const MOCK_USER_ID_FOR_AI = "user_admin_01"; // Placeholder for AI audit logs or actions
