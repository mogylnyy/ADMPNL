"use client";

import * as React from "react";
import type { Order, OrderWithDetails, OrderStatus } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  paid: "bg-blue-500",
  processing: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  refunded: "bg-gray-500",
};

const statusIcons: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  paid: CheckCircle,
  processing: Truck,
  completed: CheckCircle,
  cancelled: XCircle,
  refunded: CheckCircle, 
};

const statusTranslations: Record<OrderStatus, string> = {
  pending: "Ожидает",
  paid: "Оплачен",
  processing: "В обработке",
  completed: "Завершен",
  cancelled: "Отменен",
  refunded: "Возмещен",
};

async function fetchOrders(): Promise<OrderWithDetails[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) return [];
  return res.json();
}

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders().then(data => {
      setOrders(data);
      setIsLoading(false);
    });
  }, []);

  const columns = React.useMemo(() => [
    { accessorKey: "id", header: "ID Заказа" },
    { accessorKey: "user_username", header: "Пользователь", cell: (row: OrderWithDetails) => row.user_username || row.user_id },
    { accessorKey: "product_name", header: "Товар", cell: (row: OrderWithDetails) => row.product_name || row.product_id },
    { accessorKey: "amount", header: "Сумма", cell: (row: Order) => `${row.amount.toFixed(2)} ₽` },
    { accessorKey: "status", header: "Статус", cell: (row: Order) => {
      const Icon = statusIcons[row.status] || Clock;
      const statusText = statusTranslations[row.status] || row.status;
      return (
        <Badge className={`${statusColors[row.status] || 'bg-gray-400'} hover:${statusColors[row.status] || 'bg-gray-400'} text-white`}>
          <Icon className="mr-1 h-3 w-3" />
          {statusText}
        </Badge>
      );
    }},
    { accessorKey: "created_at", header: "Дата заказа", cell: (row: Order) => new Date(row.created_at).toLocaleString() },
    { accessorKey: "paid_at", header: "Оплачено", cell: (row: Order) => row.paid_at ? new Date(row.paid_at).toLocaleString() : 'Н/Д' },
  ], []);

  const handleConfirmPayment = (order: Order) => {
    if (order.status === 'pending') {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid', paid_at: new Date().toISOString() } as OrderWithDetails : o));
      toast({ title: "Оплата подтверждена", description: `Оплата по заказу "${order.id}" отмечена как оплаченная.` });
    } else {
      toast({ title: "Действие не разрешено", description: `Заказ "${order.id}" не ожидает оплаты.`, variant: "destructive" });
    }
  };
  
  const actionColumn = {
    accessorKey: "actions",
    header: "Действия",
    cell: (row: OrderWithDetails) => (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleConfirmPayment(row)}
        disabled={row.status !== 'pending'}
      >
        Подтвердить оплату
      </Button>
    ),
  };

  return (
    <>
      <PageHeader title="Заказы" description="Просмотр и управление заказами клиентов." />
      {isLoading ? (
        <p>Загрузка данных...</p>
      ) : orders.length > 0 ? (
        <DataTable
          columns={[...columns, actionColumn]}
          data={orders}
          searchKey="user_username" 
          entityName="Заказ"
        />
      ) : (
        <p>Нет данных</p>
      )}
    </>
  );
}
