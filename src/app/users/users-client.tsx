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
  { id: "user_1", telegram_id: 123456, username: "john_doe", first_name: "John", last_name: "Doe", created_at: new Date(Date.now() - 1000*60*60*24*10).toISOString(), balance: 50.00 },
  { id: "user_2", telegram_id: 789012, username: "jane_smith", first_name: "Jane", last_name: "Smith", created_at: new Date(Date.now() - 1000*60*60*24*5).toISOString(), balance: 15.75 },
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
    { accessorKey: "username", header: "Username", cell: (row: User) => row.username || 'N/A' },
    { accessorKey: "first_name", header: "First Name", cell: (row: User) => row.first_name || 'N/A' },
    { accessorKey: "balance", header: "Balance", cell: (row: User) => `$${row.balance.toFixed(2)}` },
    { accessorKey: "ordersCount", header: "Orders" },
    { accessorKey: "activeSubscriptionsCount", header: "Active Subs" },
    { accessorKey: "created_at", header: "Joined At", cell: (row: User) => new Date(row.created_at).toLocaleDateString() },
  ], []);
  
  const handleEdit = (user: UserWithDetails) => {
    setEditingUser(user);
    setBalanceAdjustment(user.balance); // Initialize with current balance for editing
    setIsModalOpen(true);
  };
  
  const handleSaveBalance = () => {
    if (editingUser) {
      const updatedUser = { ...editingUser, balance: balanceAdjustment };
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      toast({ title: "Balance Updated", description: `Balance for ${editingUser.username || editingUser.id} updated to $${balanceAdjustment.toFixed(2)}.` });
      setIsModalOpen(false);
      setEditingUser(null);
    }
  };

  return (
    <>
      <PageHeader title="Users" description="Manage store users and their details." />
      <DataTable
        columns={columns}
        data={users}
        searchKey="username"
        onEdit={handleEdit} // We'll use this for "Manage Balance"
        entityName="User"
      />
      {editingUser && (
        <Dialog open={isModalOpen} onOpenChange={() => { setIsModalOpen(false); setEditingUser(null); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manage Balance for {editingUser.username || editingUser.id}</DialogTitle>
              <DialogDescription>
                Current Balance: ${editingUser.balance.toFixed(2)}. Adjust the balance below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balance" className="text-right">New Balance</Label>
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
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>Cancel</Button>
              <Button type="button" onClick={handleSaveBalance}>Save Balance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
