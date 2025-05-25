"use client";

import Link from 'next/link';
import { DollarSign, Users, ShoppingCart, PlusCircle, Send, MessageSquare, Brain, BarChart3, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeSales, type SalesAnalysisInput } from "@/ai/flows/sales-analysis-flow";


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

async function fetchDashboardMetrics() {
  const res = await fetch("/api/dashboard-metrics");
  if (!res.ok) return null;
  return res.json();
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  const [aiSalesQuery, setAiSalesQuery] = useState<string>("");
  const [aiSalesReport, setAiSalesReport] = useState<string | null>(null);
  const [isAnalyzingSales, setIsAnalyzingSales] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardMetrics().then(data => {
      setMetrics(data);
      setIsLoading(false);
    });
  }, []);

  const formatCurrency = (value: number) => `${value.toLocaleString()} ₽`;
  const formatNumber = (value: number) => value.toLocaleString();

  const handleAiSalesAnalysis = async () => {
    if (!aiSalesQuery.trim()) {
      toast({
        title: "Запрос пуст",
        description: "Пожалуйста, введите ваш запрос для AI-аналитика.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzingSales(true);
    setAiSalesReport(null);
    try {
      const input: SalesAnalysisInput = { userQuery: aiSalesQuery };
      const result = await analyzeSales(input);
      setAiSalesReport(result.report);
      toast({
        title: "Анализ готов",
        description: "AI-аналитик подготовил для вас отчет.",
      });
    } catch (error) {
      console.error("Ошибка AI-анализа продаж:", error);
      toast({
        title: "Ошибка AI-анализа",
        description: "Не удалось получить анализ от AI. Попробуйте еще раз.",
        variant: "destructive",
      });
      setAiSalesReport("Произошла ошибка при генерации отчета.");
    } finally {
      setIsAnalyzingSales(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Общий доход" value="Загрузка..." icon={DollarSign} />
          <MetricCard title="Активные подписки" value="Загрузка..." icon={ShoppingCart} />
          <MetricCard title="Новые пользователи" value="Загрузка..." icon={Users} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Общий доход" value={metrics?.totalRevenue || 0 + " ₽"} icon={DollarSign} description={metrics?.revenueChangeText || ""} />
        <MetricCard title="Активные подписки" value={metrics?.activeSubscriptions || 0} icon={ShoppingCart} description={metrics?.subscriptionsChangeText || ""} />
        <MetricCard title="Новые пользователи" value={metrics?.newUsers || 0} icon={Users} description={metrics?.usersChangeText || ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderChart
          title="Обзор продаж"
          description="Тренд ежемесячных продаж."
          data={metrics?.salesData || []}
          dataKey="sales"
          xAxisKey="month"
          config={salesChartConfig}
          valueFormatter={formatCurrency}
        />
        <PlaceholderChart
          title="Новые пользователи"
          description="Регистрация новых пользователей по месяцам."
          data={metrics?.usersData || []}
          dataKey="users"
          xAxisKey="month"
          config={usersChartConfig}
          valueFormatter={formatNumber}
        />
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            Анализ продаж с помощью AI
          </CardTitle>
          <CardDescription>
            Задайте вопрос нашему AI-аналитику о продажах, трендах или запросите рекомендации.
            Например: "Какие категории товаров принесли наибольший доход в прошлом квартале?" или "Посоветуй, на какие товары сделать акцию в следующем месяце."
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-sales-query">Ваш запрос к AI-аналитику:</Label>
            <Textarea
              id="ai-sales-query"
              placeholder="Введите ваш вопрос или задачу для анализа..."
              value={aiSalesQuery}
              onChange={(e) => setAiSalesQuery(e.target.value)}
              rows={3}
              className="mt-1 shadow-sm"
            />
          </div>
          <Button onClick={handleAiSalesAnalysis} disabled={isAnalyzingSales || !aiSalesQuery.trim()}>
            {isAnalyzingSales ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="mr-2 h-4 w-4" />
            )}
            Получить анализ от AI
          </Button>
          {isAnalyzingSales && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Анализирую данные... Это может занять некоторое время.</span>
            </div>
          )}
          {aiSalesReport && !isAnalyzingSales && (
            <Card className="mt-4 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Отчет AI-аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {aiSalesReport}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default" size="lg" asChild>
            <Link href="/products">
              <PlusCircle className="mr-2 h-5 w-5" /> Добавить новый товар
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/broadcasts">
              <Send className="mr-2 h-5 w-5" /> Создать рассылку
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" /> Просмотреть чаты
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
