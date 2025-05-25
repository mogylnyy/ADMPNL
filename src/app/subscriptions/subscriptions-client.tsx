"use client";

import * as React from "react";
import type { SubscriptionWithDetails, SubscriptionStatus } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

async function fetchSubscriptions(): Promise<SubscriptionWithDetails[]> {
  const res = await fetch("/subscriptions/api");
  if (!res.ok) return [];
  return res.json();
}

export function SubscriptionsClient() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions().then(data => {
      setSubscriptions(data);
      setIsLoading(false);
    });
  }, []);

  const columns = React.useMemo(() => [
    { accessorKey: "id", header: "ID Подписки" },
    { accessorKey: "user", header: "Пользователь", cell: (row: SubscriptionWithDetails) => row.user?.username || row.user_id },
    { accessorKey: "product", header: "Товар", cell: (row: SubscriptionWithDetails) => row.product?.name || row.product_id },
    { accessorKey: "status", header: "Статус", cell: (row: SubscriptionWithDetails) => (
      <Badge className={row.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
        {row.status === 'active' ? 'Активна' : 'Неактивна'}
      </Badge>
    )},
    { accessorKey: "start_date", header: "Дата начала", cell: (row: SubscriptionWithDetails) => new Date(row.start_date).toLocaleDateString() },
    { accessorKey: "end_date", header: "Дата окончания", cell: (row: SubscriptionWithDetails) => new Date(row.end_date).toLocaleDateString() },
  ], []);

  return (
    <>
      <PageHeader title="Подписки" description="История приобретённых подписок пользователями." />
      {isLoading ? (
        <p>Загрузка данных...</p>
      ) : subscriptions.length > 0 ? (
        <DataTable
          columns={columns}
          data={subscriptions}
          searchKey="user"
          entityName="Подписка"
        />
      ) : (
        <p>Нет данных</p>
      )}
    </>
  );
}
