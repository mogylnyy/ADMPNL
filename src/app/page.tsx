import { DollarSign, Users, ShoppingCart, BarChart3, PlusCircle, Send, MessageSquare } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from "@/components/ui/chart";

const salesData = [
  { month: "Jan", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", sales: Math.floor(Math.random() * 5000) + 1000 },
];

const usersData = [
  { month: "Jan", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Feb", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Mar", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Apr", users: Math.floor(Math.random() * 200) + 50 },
  { month: "May", users: Math.floor(Math.random() * 200) + 50 },
  { month: "Jun", users: Math.floor(Math.random() * 200) + 50 },
];

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const usersChartConfig = {
  users: {
    label: "New Users",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Revenue" value="$12,345" icon={DollarSign} description="+20.1% from last month" />
        <MetricCard title="Active Subscriptions" value="1,234" icon={ShoppingCart} description="+180 since last week" />
        <MetricCard title="New Users" value="320" icon={Users} description="+32 this month" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderChart
          title="Sales Overview"
          description="Monthly sales trend."
          data={salesData}
          dataKey="sales"
          xAxisKey="month"
          config={salesChartConfig}
        />
        <PlaceholderChart
          title="New Users"
          description="Monthly new user registration."
          data={usersData}
          dataKey="users"
          xAxisKey="month"
          config={usersChartConfig}
        />
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
          </Button>
          <Button variant="outline" size="lg">
            <Send className="mr-2 h-5 w-5" /> Create Broadcast
          </Button>
          <Button variant="outline" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" /> View Chats
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
