"use client";

import { DollarSign, Users, ShoppingCart, PlusCircle, Send, MessageSquare } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from 'react';

// Helper function to generate data for charts to avoid hydration issues with Math.random
const generateChartData = (length: number, valueGenerator: () => number, keyName: string, labelPrefix: string = "") => {
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  return Array.from({ length }, (_, i) => ({
    month: months[i % 12],
    [keyName]: valueGenerator(),
  }));
};


const salesChartConfig = {
  sales: {
    label: "Продажи (₽)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const usersChartConfig = {
  users: {
    label: "Новые пользователи",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);

  useEffect(() => {
    setSalesData(generateChartData(6, () => Math.floor(Math.random() * 500000) + 100000, "sales"));
    setUsersData(generateChartData(6, () => Math.floor(Math.random() * 200) + 50, "users"));
  }, []);

  const formatCurrency = (value: number) => `${value.toLocaleString()} ₽`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (!salesData.length || !usersData.length) {
    // You can return a loading spinner or skeleton here
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Общий доход" value="Загрузка..." icon={DollarSign} />
          <MetricCard title="Активные подписки" value="Загрузка..." icon={ShoppingCart} />
          <MetricCard title="Новые пользователи" value="Загрузка..." icon={Users} />
        </div>
         {/* Add skeleton loaders for charts if desired */}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Общий доход" value="1 234 567 ₽" icon={DollarSign} description="+20.1% с прошлого месяца" />
        <MetricCard title="Активные подписки" value="1,234" icon={ShoppingCart} description="+180 с прошлой недели" />
        <MetricCard title="Новые пользователи" value="320" icon={Users} description="+32 в этом месяце" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderChart
          title="Обзор продаж"
          description="Тренд ежемесячных продаж."
          data={salesData}
          dataKey="sales"
          xAxisKey="month"
          config={salesChartConfig}
          valueFormatter={formatCurrency}
        />
        <PlaceholderChart
          title="Новые пользователи"
          description="Регистрация новых пользователей по месяцам."
          data={usersData}
          dataKey="users"
          xAxisKey="month"
          config={usersChartConfig}
          valueFormatter={formatNumber}
        />
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Добавить новый товар
          </Button>
          <Button variant="outline" size="lg">
            <Send className="mr-2 h-5 w-5" /> Создать рассылку
          </Button>
          <Button variant="outline" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" /> Просмотреть чаты
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
