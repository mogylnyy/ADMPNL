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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { generateBroadcastMessage, type GenerateBroadcastMessageInput } from "@/ai/flows/generate-broadcast-flow";
import { Bot, Send, Sparkles, Loader2, CalendarIcon, Filter, Clock, Repeat, Image as ImageIcon, Package as PackageIcon, ListChecks, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';

// Определение типа Category для моковых данных
interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  image?: string;
  "data-ai-hint"?: string;
  active: boolean;
  created_at: string;
}

// Mock Data for Categories (should ideally be fetched)
const mockCategories: Category[] = [
  { id: "cat_1", code: "SUBS", name: "Подписки", description: "Основные подписки на товары.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "subscriptions services" },
  { id: "cat_2", code: "ADDONS", name: "Дополнения", description: "Дополнительные услуги и функции.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "addons features" },
  { id: "cat_3", code: "SERVICES", name: "Услуги", description: "Разовые услуги.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "services support" },
  { id: "cat_4", code: "LEGACY", name: "Архивные товары", description: "Старые, неподдерживаемые товары.", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "archive old" },
];

const daysOfWeekMap: Record<number, string> = {
  0: 'Воскресенье', 1: 'Понедельник', 2: 'Вторник', 3: 'Среду', 4: 'Четверг', 5: 'Пятницу', 6: 'Субботу'
};

interface UIScheduledBroadcast {
  id: string;
  message: string;
  imageUrl: string;
  targetAudience: string;
  scheduled: boolean;
  scheduleType: 'immediate' | 'once' | 'weekly' | 'monthly' | 'now';
  scheduleDescription: string;
  scheduledAt: string; 
  createdAt: Date;
}

export function BroadcastsClient() {
  const [instructions, setInstructions] = React.useState("");
  const [generatedMessage, setGeneratedMessage] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = React.useState<string>("10:00");
  const [scheduleType, setScheduleType] = React.useState<'once' | 'weekly' | 'monthly' | 'now'>('once');
  
  const [selectedDayOfWeek, setSelectedDayOfWeek] = React.useState<number | null>(null);
  const [selectedDayOfMonth, setSelectedDayOfMonth] = React.useState<number | null>(null);
  const [audienceFilter, setAudienceFilter] = React.useState<string>('all');
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [specificProducts, setSpecificProducts] = React.useState<string>("");
  const [imageURL, setImageURL] = React.useState<string>("");

  const [savedSchedules, setSavedSchedules] = React.useState<UIScheduledBroadcast[]>([]);

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
      let audienceParts: string[] = [];
      if (selectedCategories.length > 0) {
        const categoryNames = selectedCategories.map(catId => mockCategories.find(c => c.id === catId)?.name).filter(Boolean);
        if (categoryNames.length > 0) {
          audienceParts.push(`пользователи, которые ранее покупали товары из категорий: ${categoryNames.join(', ')}`);
        }
      }
      if (specificProducts.trim()) {
        audienceParts.push(`пользователи, которые ранее покупали или интересовались следующими товарами: ${specificProducts.trim()}`);
      }

      const targetAudienceDescription = audienceParts.length > 0 ? `Сообщение для: ${audienceParts.join('; ')}.` : undefined;

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

  const getFullScheduledDateTime = (): Date | null => {
    if (!scheduleDate || !scheduleTime) return null;
    const dateTime = new Date(scheduleDate);
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    dateTime.setHours(hours, minutes);
    dateTime.setSeconds(0, 0); 
    return dateTime;
  };
  
  const getScheduleDescription = () => {
    const fullDate = getFullScheduledDateTime();
    if (!isScheduled || !fullDate) return "Немедленная отправка";

    switch (scheduleType) {
      case 'weekly':
        const dayOfWeek = daysOfWeekMap[fullDate.getDay()];
        return `Каждую ${dayOfWeek.toLowerCase()} в ${scheduleTime}`;
      case 'monthly':
        return `${fullDate.getDate()} числа каждого месяца в ${scheduleTime}`;
      case 'once':
      default:
        return `Однократно: ${format(fullDate, "PPP", { locale: ru })} в ${scheduleTime}`;
    }
  };

  const handleSendMessage = async () => {
    if (!generatedMessage) {
      toast({
        title: "Ошибка",
        description: 'Необходимо сгенерировать сообщение',
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Определяем время отправки в зависимости от выбранного типа расписания
      let scheduleAt = null;
      if (scheduleType !== 'now' && isScheduled) {
        if (!scheduleTime) {
          toast({
            title: "Ошибка",
            description: 'Необходимо выбрать время отправки',
            variant: "destructive",
          });
          setIsSending(false);
          return;
        }
        
        const scheduleDate = new Date(scheduleTime);
        
        // Для еженедельных рассылок - устанавливаем день недели
        if (scheduleType === 'weekly' && selectedDayOfWeek !== null) {
          scheduleDate.setDate(scheduleDate.getDate() + (selectedDayOfWeek - scheduleDate.getDay() + 7) % 7);
        }
        
        // Для ежемесячных рассылок - устанавливаем день месяца
        if (scheduleType === 'monthly' && selectedDayOfMonth !== null) {
          scheduleDate.setDate(selectedDayOfMonth);
        }
        
        scheduleAt = scheduleDate.toISOString();
      }

      // Формируем данные для отправки на сервер
      const requestData = {
        message: generatedMessage,
        parse_mode: 'HTML', // По умолчанию используем HTML
        photo_url: imageURL || undefined,
        schedule_at: scheduleAt,
        filterSubscriptionActivity: audienceFilter,
        filterPurchasedProducts: selectedProducts.join(','),
        selectedCategories: selectedCategories
      };

      // Отправляем запрос к API
      const response = await fetch('/broadcasts/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при отправке рассылки');
      }

      // Обрабатываем результат
      if (result.scheduled) {
        toast({
          title: "Успех",
          description: `Рассылка запланирована на ${new Date(result.schedule_at).toLocaleString()}. Получателей: ${result.user_count}`,
        });
        // Добавляем в локальное состояние для отображения в интерфейсе
        setSavedSchedules(prev => [
          ...prev,
          {
            id: result.schedule_id,
            message: generatedMessage,
            imageUrl: imageURL || "Нет изображения",
            targetAudience: "Все пользователи",
            scheduled: true,
            scheduleType: scheduleType,
            scheduleDescription: getScheduleDescription(),
            scheduledAt: result.schedule_at,
            createdAt: new Date()
          }
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        toast({
          title: "Успех",
          description: `Рассылка отправлена. Доставлено: ${result.sent}, не доставлено: ${result.failed}, всего: ${result.total}`,
        });
      }

      // Сбрасываем форму
      setGeneratedMessage('');
      setImageURL('');
      setScheduleType('once');
      setScheduleTime('');
      setSelectedDayOfWeek(null);
      setSelectedDayOfMonth(null);
      setAudienceFilter('all');
      setSelectedProducts([]);
      setSelectedCategories([]);
      
    } catch (error) {
      console.error('Ошибка при отправке рассылки:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const buttonText = () => {
    if (!isScheduled) return "Отправить рассылку";
    switch (scheduleType) {
      case 'weekly':
      case 'monthly':
        return "Запланировать регулярную рассылку";
      case 'once':
      default:
        return "Запланировать рассылку";
    }
  };

  const handleDeleteScheduledBroadcast = (scheduleId: string) => {
    setSavedSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast({
      title: "Запланированная рассылка удалена",
      description: "Выбранная рассылка была удалена из списка (в этой сессии).",
    });
  };

  return (
    <>
      <PageHeader
        title="Создание рассылки"
        description="Подготовьте и отправьте сообщения вашим пользователям через Telegram-бота. Вы можете настроить немедленную, однократную или регулярную отправку, а также прикрепить изображение."
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
                Укажите URL изображения, если оно должно сопровождать сообщение.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ai-instructions">Инструкции для AI:</Label>
                    <Textarea
                        id="ai-instructions"
                        placeholder="Пример: Сообщить о новой акции - скидка 20% на все премиум подписки до конца недели."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        className="shadow-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="image-url" className="flex items-center">
                        <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        URL изображения (опционально):
                    </Label>
                    <Input 
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.png"
                        value={imageURL}
                        onChange={(e) => setImageURL(e.target.value)}
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
                onChange={(e) => {
                  setGeneratedMessage(e.target.value);
                  // If user types directly into message, clear AI instructions
                  // to avoid confusion, or let them decide which one to use.
                  // For now, let's assume if they edit generated message, that's the new source.
                  if (instructions && e.target.value !== instructions) {
                    // setInstructions(""); // Optional: clear instructions if message is manually edited
                  }
                }}
                rows={6}
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
                        <Checkbox id="schedule-send" checked={isScheduled} onCheckedChange={(checked) => {
                            setIsScheduled(!!checked);
                            if (!checked) setScheduleType('once'); 
                        }} />
                        <Label htmlFor="schedule-send">Запланировать отправку</Label>
                    </div>
                    {isScheduled && (
                        <div className="space-y-4 pl-6 border-l-2 border-muted ml-2 pt-2">
                            <div>
                                <Label htmlFor="schedule-date">Дата и время первоначальной отправки</Label>
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
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                    />
                                </PopoverContent>
                                </Popover>
                                <Input 
                                    id="schedule-time" 
                                    type="time" 
                                    value={scheduleTime} 
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            
                            <div>
                                <Label className="flex items-center mb-2">
                                    <Repeat className="mr-2 h-4 w-4 text-primary" />
                                    Тип повторения
                                </Label>
                                <RadioGroup value={scheduleType} onValueChange={(value) => setScheduleType(value as typeof scheduleType)} className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="once" id="r-once" />
                                        <Label htmlFor="r-once" className="font-normal">Однократно</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="weekly" id="r-weekly" />
                                        <Label htmlFor="r-weekly" className="font-normal">Еженедельно</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="monthly" id="r-monthly" />
                                        <Label htmlFor="r-monthly" className="font-normal">Ежемесячно</Label>
                                    </div>
                                </RadioGroup>
                                {(scheduleDate || scheduleType !== 'once') && ( // Show description if date is picked OR if it's a recurring type
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {getScheduleDescription()}
                                    </p>
                                )}
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
                    <CardDescription>Сузьте аудиторию рассылки. Если ничего не выбрано, рассылка будет для всех.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">По категориям купленных товаров:</Label>
                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border p-2 rounded-md">
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
                        </div>
                    </div>
                    <div>
                         <Label htmlFor="specific-products" className="text-sm font-medium flex items-center">
                            <PackageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            По конкретным товарам/интересам:
                        </Label>
                        <Textarea
                            id="specific-products"
                            placeholder="Названия или ID товаров, через запятую..."
                            value={specificProducts}
                            onChange={(e) => setSpecificProducts(e.target.value)}
                            rows={2}
                            className="mt-1 shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Укажите, если AI должен учесть интерес к конкретным товарам.</p>
                    </div>
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
                {buttonText()}
            </Button>
        </div>
      </div>
      {savedSchedules.length > 0 && (
        <Card className="mt-6 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Запланированные рассылки (в этой сессии)
            </CardTitle>
            <CardDescription>
              Этот список очистится при обновлении страницы. Для реального сохранения и отправки нужна интеграция с бэкендом.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {savedSchedules.map((schedule) => (
                <li key={schedule.id} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">Сообщение:</p>
                      <p className="text-sm mb-2 whitespace-pre-wrap bg-muted p-2 rounded-md">{schedule.message}</p>
                      {schedule.imageUrl !== "Нет изображения" && (
                        <p className="text-sm mb-2">
                          <span className="font-semibold">Изображение:</span> <a href={schedule.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{schedule.imageUrl}</a>
                        </p>
                      )}
                      <p className="text-sm"><span className="font-semibold">Аудитория:</span> {schedule.targetAudience}</p>
                      <p className="text-sm"><span className="font-semibold">Расписание:</span> {schedule.scheduleDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">Запланировано: {schedule.scheduledAt}</p>
                      <p className="text-xs text-muted-foreground">Создано: {format(schedule.createdAt, "PPPp", { locale: ru })}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteScheduledBroadcast(schedule.id)} aria-label="Удалить рассылку">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
       <p className="text-xs text-muted-foreground text-center mt-4 lg:col-span-3">
          Управление списком запланированных и регулярных рассылок (редактирование, удаление, просмотр статуса) будет добавлено в следующих версиях.
      </p>
    </>
  );
}
