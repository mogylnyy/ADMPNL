"use client";

import * as React from "react";
import type { User, UserWithDetails } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";

async function fetchUsers(): Promise<UserWithDetails[]> {
  const res = await fetch("/api/users");
  if (!res.ok) return [];
  return res.json();
}

export function UsersClient() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserWithDetails | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = React.useState<number>(0);
  const { toast } = useToast();

  const [filterSubscriptionActivity, setFilterSubscriptionActivity] = React.useState<string>("all");
  const [filterPurchasedProducts, setFilterPurchasedProducts] = React.useState<string>("");

  const columns = React.useMemo(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "telegram_id", header: "Telegram ID" },
    { accessorKey: "username", header: "Имя пользователя", cell: (row: User) => row.username || 'Н/Д' },
    { accessorKey: "first_name", header: "Имя", cell: (row: User) => row.first_name || 'Н/Д' },
    { accessorKey: "balance", header: "Баланс", cell: (row: User) => `${row.balance.toFixed(2)} ₽` },
    { accessorKey: "ordersCount", header: "Заказы" },
    { accessorKey: "activeSubscriptionsCount", header: "Активные подписки" },
    { accessorKey: "created_at", header: "Дата регистрации", cell: (row: User) => new Date(row.created_at).toLocaleDateString() },
  ], []);
  
  const handleEdit = (user: UserWithDetails) => {
    setEditingUser(user);
    setBalanceAdjustment(user.balance); 
    setIsModalOpen(true);
  };
  
  const handleSaveBalance = async () => {
    if (editingUser) {
      const updatedUser = { ...editingUser, balance: balanceAdjustment };
      await fetch("/users/api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedUser, id: editingUser.id }),
      });
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      toast({ title: "Баланс обновлен", description: `Баланс для ${editingUser.username || editingUser.id} обновлен до ${balanceAdjustment.toFixed(2)} ₽.` });
      setIsModalOpen(false);
      setEditingUser(null);
    }
  };

  // TODO: Implement actual filtering logic based on filterSubscriptionActivity and filterPurchasedProducts
  const filteredUsers = React.useMemo(() => {
    return users; // Placeholder - no filtering applied yet
  }, [users, filterSubscriptionActivity, filterPurchasedProducts]);

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <PageHeader title="Пользователи" description="Управление пользователями магазина и их данными." />

      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Фильтры пользователей
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="filter-subscription-activity" className="text-sm font-medium">Активность подписок</Label>
            <Select value={filterSubscriptionActivity} onValueChange={setFilterSubscriptionActivity}>
              <SelectTrigger id="filter-subscription-activity" className="mt-1">
                <SelectValue placeholder="Выберите активность..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                <SelectItem value="purchased_any">Покупали подписки</SelectItem>
                <SelectItem value="not_purchased_any">Не покупали подписки</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Фильтр по наличию у пользователя активных или прошлых подписок.</p>
          </div>
          <div>
            <Label htmlFor="filter-purchased-products" className="text-sm font-medium">Купленные товары</Label>
            <Input
              id="filter-purchased-products"
              placeholder="ID или названия товаров, через запятую..."
              value={filterPurchasedProducts}
              onChange={(e) => setFilterPurchasedProducts(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Укажите конкретные товары, которые должны были быть куплены.</p>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredUsers} // Используем filteredUsers, хотя фильтрация еще не реализована
        searchKey="username"
        onEdit={handleEdit} 
        entityName="Пользователь"
      />
      {editingUser && (
        <Dialog open={isModalOpen} onOpenChange={() => { setIsModalOpen(false); setEditingUser(null); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Управление балансом для {editingUser.username || editingUser.id}</DialogTitle>
              <DialogDescription>
                Текущий баланс: {editingUser.balance.toFixed(2)} ₽. Измените баланс ниже.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balance" className="text-right">Новый баланс</Label>
                <Input 
                  id="balance" 
                  name="balance" 
                  type="number" 
                  step="0.01" 
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(parseFloat(e.target.value))}
                  className="col-span-3" 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>Отмена</Button>
              <Button type="button" onClick={handleSaveBalance}>Сохранить баланс</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
