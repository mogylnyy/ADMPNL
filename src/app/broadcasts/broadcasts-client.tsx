
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { generateBroadcastMessage, type GenerateBroadcastMessageInput } from "@/ai/flows/generate-broadcast-flow";
import { Bot, Send, Sparkles, Loader2, CalendarIcon, Filter, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import type { Category } from "@/types";

// Mock Data for Categories (should ideally be fetched)
const mockCategories: Category[] = [
  { id: "cat_1", code: "SUBS", name: "Подписки", description: "Основные подписки на товары.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "subscriptions services" },
  { id: "cat_2", code: "ADDONS", name: "Дополнения", description: "Дополнительные услуги и функции.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "addons features" },
  { id: "cat_3", code: "SERVICES", name: "Услуги", description: "Разовые услуги.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "services support" },
  { id: "cat_4", code: "LEGACY", name: "Архивные товары", description: "Старые, неподдерживаемые товары.", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "archive old" },
];


export function BroadcastsClient() {
  const [instructions, setInstructions] = React.useState("");
  const [generatedMessage, setGeneratedMessage] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = React.useState<string>("10:00");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);

  const activeCategories = React.useMemo(() => mockCategories.filter(c => c.active), []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleGenerateMessage = async () => {
    if (!instructions.trim()) {
      toast({
        title: "Инструкция пуста",
        description: "Пожалуйста, введите инструкции для генерации сообщения.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      let targetAudienceDescription: string | undefined = undefined;
      if (selectedCategories.length > 0) {
        const categoryNames = selectedCategories.map(catId => mockCategories.find(c => c.id === catId)?.name).filter(Boolean);
        if (categoryNames.length > 0) {
          targetAudienceDescription = `Сообщение для пользователей, которые ранее покупали товары из категорий: ${categoryNames.join(', ')}.`;
        }
      }

      const input: GenerateBroadcastMessageInput = { instructions, targetAudienceDescription };
      const result = await generateBroadcastMessage(input);
      setGeneratedMessage(result.generatedMessage);
      toast({
        title: "Сообщение сгенерировано",
        description: "ИИ подготовил текст для вашей рассылки.",
      });
    } catch (error) {
      console.error("Ошибка генерации сообщения:", error);
      toast({
        title: "Ошибка генерации",
        description: "Не удалось сгенерировать сообщение. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    const messageToSend = generatedMessage.trim() || instructions.trim();
    if (!messageToSend) {
         toast({
            title: "Сообщение пустое",
            description: "Сначала сгенерируйте или введите сообщение для отправки.",
            variant: "destructive",
        });
        return;
    }
    
    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      toast({
        title: "Дата или время не указаны",
        description: "Пожалуйста, укажите дату и время для запланированной рассылки.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    const logData: any = {
        message: messageToSend,
        targetCategories: selectedCategories.length > 0 ? selectedCategories.map(id => mockCategories.find(c=>c.id === id)?.name || id) : "Все пользователи",
        scheduled: isScheduled,
    };

    if (isScheduled && scheduleDate) {
        const dateTime = new Date(scheduleDate);
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        dateTime.setHours(hours, minutes);
        logData.scheduledAt = dateTime.toLocaleString('ru-RU');
    }

    console.log("Данные рассылки (имитация):", logData);

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setIsSending(false);
    toast({
      title: isScheduled ? "Рассылка запланирована (имитация)" : "Рассылка отправлена (имитация)",
      description: `Ваше сообщение было '${isScheduled ? 'запланировано' : 'отправлено'}'`,
    });
  };

  return (
    <>
      <PageHeader
        title="Создание рассылки"
        description="Подготовьте и отправьте сообщения вашим пользователям через Telegram-бота."
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Умная рассылка с AI
                </CardTitle>
                <CardDescription>
                Опишите, о чем должна быть рассылка, и AI поможет составить текст.
                Затем вы сможете его отредактировать и отправить.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="ai-instructions">Инструкции для AI:</Label>
                <Textarea
                    id="ai-instructions"
                    placeholder="Пример: Сообщить о новой акции - скидка 20% на все премиум подписки до конца недели. Поблагодарить за использование сервиса."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    className="shadow-sm"
                />
                </div>
                <Button onClick={handleGenerateMessage} disabled={isGenerating || !instructions.trim()}>
                {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Bot className="mr-2 h-4 w-4" />
                )}
                Сгенерировать сообщение
                </Button>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Текст сообщения</CardTitle>
                <CardDescription>
                Здесь появится сгенерированное сообщение. Вы можете отредактировать его перед отправкой.
                Если вы не используете AI, введите текст сообщения напрямую.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                id="broadcast-message"
                placeholder="Текст вашей рассылки..."
                value={generatedMessage || instructions}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={8}
                className="shadow-sm"
                />
            </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" />
                        Настройки отправки
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="schedule-send" checked={isScheduled} onCheckedChange={(checked) => setIsScheduled(!!checked)} />
                        <Label htmlFor="schedule-send">Запланировать отправку</Label>
                    </div>
                    {isScheduled && (
                        <div className="space-y-4 pl-6 border-l-2 border-muted ml-2 pt-2">
                            <div>
                                <Label htmlFor="schedule-date">Дата отправки</Label>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal mt-1"
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduleDate ? format(scheduleDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={scheduleDate}
                                    onSelect={setScheduleDate}
                                    initialFocus
                                    locale={ru}
                                    />
                                </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="schedule-time">Время отправки</Label>
                                <Input 
                                    id="schedule-time" 
                                    type="time" 
                                    value={scheduleTime} 
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="mr-2 h-5 w-5 text-primary" />
                        Фильтр аудитории
                    </CardTitle>
                    <CardDescription>Выберите категории товаров, которые покупали пользователи, чтобы сузить аудиторию рассылки. Если ничего не выбрано, рассылка будет для всех.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                    {activeCategories.length > 0 ? activeCategories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`cat-${category.id}`} 
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={() => handleCategoryToggle(category.id)}
                            />
                            <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.name}</Label>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">Нет активных категорий для выбора.</p>
                    )}
                </CardContent>
            </Card>
            
            <Button 
                onClick={handleSendMessage} 
                disabled={isSending || (!generatedMessage.trim() && !instructions.trim()) || (isScheduled && (!scheduleDate || !scheduleTime))} 
                className="w-full"
                size="lg"
            >
                {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                {isScheduled ? "Запланировать рассылку" : "Отправить рассылку"}
            </Button>
        </div>
      </div>
    </>
  );
}
