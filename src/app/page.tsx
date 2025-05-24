import { DollarSign, Users, ShoppingCart, BarChart3, PlusCircle, Send, MessageSquare } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from "@/components/ui/chart";

const salesData = [
  { month: "Янв", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Фев", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Мар", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Апр", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Май", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Июн", sales: Math.floor(Math.random() * 5000) + 1000 },
];

const usersData = [
  { month: "Янв", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Фев", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Мар", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Апр", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Май", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Июн", users: Math.floor(Math.random() * 200) + 50 },
];

const salesChartConfig = {
  sales: {
    label: "Продажи",
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
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Общий доход" value="$12,345" icon={DollarSign} description="+20.1% с прошлого месяца" />
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
        />
        <PlaceholderChart
          title="Новые пользователи"
          description="Регистрация новых пользователей по месяцам."
          data={usersData}
          dataKey="users"
          xAxisKey="month"
          config={usersChartConfig}
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
