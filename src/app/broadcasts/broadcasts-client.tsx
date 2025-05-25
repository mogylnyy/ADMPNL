
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateBroadcastMessage, type GenerateBroadcastMessageInput } from "@/ai/flows/generate-broadcast-flow";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react"; // Added Loader2

export function BroadcastsClient() {
  const [instructions, setInstructions] = React.useState("");
  const [generatedMessage, setGeneratedMessage] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false); // For simulating send
  const { toast } = useToast();

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
      const input: GenerateBroadcastMessageInput = { instructions };
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
    if (!generatedMessage.trim() && !instructions.trim()) {
         toast({
            title: "Сообщение пустое",
            description: "Сначала сгенерируйте или введите сообщение для отправки.",
            variant: "destructive",
        });
        return;
    }
    
    const messageToSend = generatedMessage.trim() || instructions.trim(); // Use generated or fallback to instructions if not generated

    setIsSending(true);
    // --- Имитация отправки ---
    // В реальном приложении здесь будет вызов API вашего Telegram-бота
    console.log("Отправка рассылки (имитация):");
    console.log("Получатели: Все пользователи (по умолчанию)"); // Уточнить логику выбора получателей
    console.log("Сообщение:", messageToSend);

    await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки сети

    setIsSending(false);
    toast({
      title: "Рассылка отправлена (имитация)",
      description: "Ваше сообщение было 'отправлено' пользователям.",
    });
    // Очистить поля после "отправки"
    // setInstructions("");
    // setGeneratedMessage(""); 
    // Решение не очищать поля, чтобы пользователь мог, например, скопировать текст или отправить повторно с изменениями
  };

  return (
    <>
      <PageHeader
        title="Создание рассылки"
        description="Подготовьте и отправьте сообщения вашим пользователям через Telegram-бота."
      />
      <div className="grid gap-6">
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
              value={generatedMessage || instructions} // Show generated or fallback to instructions if user wants to write manually / edit
              onChange={(e) => {
                // If user types here and it was AI generated, we clear the "generated" state
                // and allow them to edit the instructions/message directly.
                // Or, better, allow editing the generatedMessage directly.
                setGeneratedMessage(e.target.value);
                if(instructions && generatedMessage !== e.target.value && generatedMessage === instructions) {
                    // if instructions were used as fallback and user edits, clear instructions for next AI generation
                    // this logic might be too complex. simpler: just let user edit freely.
                }
              }}
              rows={8}
              className="shadow-sm"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendMessage} disabled={isSending || (!generatedMessage.trim() && !instructions.trim())} className="ml-auto">
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить рассылку
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
