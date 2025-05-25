
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// Mock data for AuditLog - replace with actual data fetching
const mockAuditLogs = [
  { id: "log_1", user_id: "admin_user", action: "login", entity: "system", entity_id: "system", timestamp: new Date(Date.now() - 3600000).toISOString(), details: { ip: "192.168.1.1" } },
  { id: "log_2", user_id: "moderator_jane", action: "update_product", entity: "product", entity_id: "prod_2", timestamp: new Date(Date.now() - 1800000).toISOString(), details: { changes: "price from 1999 to 1899" } },
  { id: "log_3", user_id: "admin_user", action: "create_category", entity: "category", entity_id: "cat_new", timestamp: new Date().toISOString(), details: { name: "Новая категория" } },
];

export default function AuditLogsPage() {
  // In a real app, you would fetch logs and use a DataTable component.
  // For this prototype, we'll just display a placeholder.

  return (
    <>
      <PageHeader
        title="Аудит логи"
        description="Просмотр действий, выполненных в административной панели."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Раздел в разработке
          </CardTitle>
          <CardDescription>
            На этой странице будет отображаться таблица с логами всех значимых действий пользователей в системе.
            Включая входы в систему, изменения данных, создание и удаление сущностей.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Пример логов (в будущем здесь будет таблица):
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
            {mockAuditLogs.map(log => (
              <li key={log.id}>
                <strong>{new Date(log.timestamp).toLocaleString('ru-RU')}</strong> - Пользователь: {log.user_id}, Действие: {log.action}, Сущность: {log.entity} (ID: {log.entity_id})
                {log.details && <span className="text-xs"> ({JSON.stringify(log.details)})</span>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
