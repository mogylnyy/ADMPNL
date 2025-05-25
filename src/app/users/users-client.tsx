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

// Mock Data
const mockUsers: User[] = [
  { id: "user_1", telegram_id: 123456, username: "john_doe", first_name: "John", last_name: "Doe", created_at: new Date(Date.now() - 1000*60*60*24*10).toISOString(), balance: 5000.00 },
  { id: "user_2", telegram_id: 789012, username: "jane_smith", first_name: "Jane", last_name: "Smith", created_at: new Date(Date.now() - 1000*60*60*24*5).toISOString(), balance: 1575.50 },
  { id: "user_3", telegram_id: 345678, first_name: "Alice", created_at: new Date().toISOString(), balance: 0.00 },
];

const mockUsersWithDetails: UserWithDetails[] = mockUsers.map(user => ({
  ...user,
  ordersCount: Math.floor(Math.random() * 10),
  activeSubscriptionsCount: Math.floor(Math.random() * 3)
}));


export function UsersClient() {
  const [users, setUsers] = React.useState<UserWithDetails[]>(mockUsersWithDetails);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserWithDetails | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = React.useState<number>(0);
  const { toast } = useToast();

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
  
  const handleSaveBalance = () => {
    if (editingUser) {
      const updatedUser = { ...editingUser, balance: balanceAdjustment };
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      toast({ title: "Баланс обновлен", description: `Баланс для ${editingUser.username || editingUser.id} обновлен до ${balanceAdjustment.toFixed(2)} ₽.` });
      setIsModalOpen(false);
      setEditingUser(null);
    }
  };

  return (
    <>
      <PageHeader title="Пользователи" description="Управление пользователями магазина и их данными." />
      <DataTable
        columns={columns}
        data={users}
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
