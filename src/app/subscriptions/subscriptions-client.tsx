"use client";

import * as React from "react";
import type { Subscription, SubscriptionWithDetails, SubscriptionStatus } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { AlertTriangle, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { smartStatusMonitor, type SmartStatusMonitorOutput, type Subscription as AiSubscriptionType } from "@/ai/flows/smart-status-monitor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MOCK_USER_ID_FOR_AI } from "@/lib/constants";

// Mock Data
const mockSubscriptions: SubscriptionWithDetails[] = [
  { id: "sub_1", user_id: "user_1", user_username: "john_doe", product_id: "prod_1", product_name: "Basic Subscription", start_date: new Date(Date.now() - 1000*60*60*24*25).toISOString(), end_date: new Date(Date.now() + 1000*60*60*24*5).toISOString(), status: "active", auto_renew: true },
  { id: "sub_2", user_id: "user_2", user_username: "jane_smith", product_id: "prod_2", product_name: "Premium Subscription", start_date: new Date(Date.now() - 1000*60*60*24*60).toISOString(), end_date: new Date(Date.now() + 1000*60*60*24*30).toISOString(), status: "active", auto_renew: false },
  { id: "sub_3", user_id: "user_1", user_username: "john_doe", product_id: "prod_2", product_name: "Premium Subscription", start_date: new Date(Date.now() - 1000*60*60*24*90).toISOString(), end_date: new Date(Date.now() - 1000*60*60*24*1).toISOString(), status: "expired", auto_renew: true }, // Expired but auto_renew true (potential issue)
  { id: "sub_4", user_id: "user_3", user_username: "Alice", product_id: "prod_1", product_name: "Basic Subscription", start_date: new Date(Date.now() - 1000*60*60*24*10).toISOString(), end_date: new Date(Date.now() + 1000*60*60*24*2).toISOString(), status: "cancelled", auto_renew: true }, // Cancelled but auto_renew true
];

const statusColors: Record<SubscriptionStatus, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  pending: "bg-yellow-500",
  cancelled: "bg-orange-500",
  expired: "bg-red-500",
};

export function SubscriptionsClient() {
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionWithDetails[]>(mockSubscriptions);
  const [flaggedSubscriptions, setFlaggedSubscriptions] = React.useState<SmartStatusMonitorOutput>([]);
  const [isLoadingAi, setIsLoadingAi] = React.useState(false);
  const { toast } = useToast();

  const mapToAiSubscription = (sub: SubscriptionWithDetails): AiSubscriptionType => ({
    id: sub.id,
    userId: sub.user_id,
    productId: sub.product_id,
    startDate: sub.start_date,
    endDate: sub.end_date,
    status: sub.status as AiSubscriptionType['status'], // Cast needed if enums differ
    autoRenew: sub.auto_renew,
  });

  const runSmartMonitor = async () => {
    setIsLoadingAi(true);
    setFlaggedSubscriptions([]);
    try {
      const aiInput = subscriptions.map(mapToAiSubscription);
      const result = await smartStatusMonitor(aiInput);
      setFlaggedSubscriptions(result);
      if (result.length > 0) {
        toast({
          title: "Smart Monitor Found Issues",
          description: `${result.length} subscription(s) need attention.`,
          variant: "default", // default is not red
        });
      } else {
        toast({
          title: "Smart Monitor Complete",
          description: "No unusual subscriptions found.",
        });
      }
    } catch (error) {
      console.error("Smart Status Monitor error:", error);
      toast({
        title: "Error Running Smart Monitor",
        description: "Could not analyze subscriptions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  React.useEffect(() => {
    // Optionally run on load, or provide a button
    runSmartMonitor();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount for demo purposes

  const columns = React.useMemo(() => [
    { accessorKey: "id", header: "Sub ID" },
    { accessorKey: "user_username", header: "User", cell: (row: SubscriptionWithDetails) => row.user_username || row.user_id },
    { accessorKey: "product_name", header: "Product", cell: (row: SubscriptionWithDetails) => row.product_name || row.product_id },
    { accessorKey: "status", header: "Status", cell: (row: SubscriptionWithDetails) => (
      <Badge className={`${statusColors[row.status] || 'bg-gray-400'} hover:${statusColors[row.status] || 'bg-gray-400'} text-white`}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
    )},
    { accessorKey: "start_date", header: "Start Date", cell: (row: Subscription) => new Date(row.start_date).toLocaleDateString() },
    { accessorKey: "end_date", header: "End Date", cell: (row: Subscription) => new Date(row.end_date).toLocaleDateString() },
    { accessorKey: "auto_renew", header: "Auto Renew", cell: (row: Subscription) => (
      row.auto_renew ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
    )},
  ], []);
  
  const handleToggleStatus = (subscription: SubscriptionWithDetails) => {
    const newStatus = subscription.status === 'active' ? 'inactive' : 'active';
    setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, status: newStatus } : s));
    toast({ title: "Subscription Status Updated", description: `Subscription "${subscription.id}" is now ${newStatus}.` });
  };
  
  const actionColumn = {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: SubscriptionWithDetails) => (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleToggleStatus(row)}
      >
        {row.status === 'active' ? 'Deactivate' : 'Activate'}
      </Button>
    ),
  };

  return (
    <>
      <PageHeader title="Subscriptions" description="Manage customer subscriptions.">
        <Button onClick={runSmartMonitor} disabled={isLoadingAi}>
          {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
          Run Smart Monitor
        </Button>
      </PageHeader>

      {flaggedSubscriptions.length > 0 && (
        <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-300 text-yellow-700 [&>svg]:text-yellow-700">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Attention Required!</AlertTitle>
          <AlertDescription>
            The Smart Status Monitor flagged the following subscriptions:
            <ul className="list-disc pl-5 mt-2">
              {flaggedSubscriptions.map(flag => (
                <li key={flag.subscriptionId}>
                  <strong>ID: {flag.subscriptionId}</strong> - {flag.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
       {isLoadingAi && !flaggedSubscriptions.length && (
         <Alert className="mb-4 border-blue-300 bg-blue-50 text-blue-700 [&>svg]:text-blue-700">
          <Info className="h-5 w-5" />
          <AlertTitle>Smart Monitor Running</AlertTitle>
          <AlertDescription>
            The AI is currently analyzing subscriptions. This may take a moment.
          </AlertDescription>
        </Alert>
      )}


      <DataTable
        columns={[...columns, actionColumn]}
        data={subscriptions}
        searchKey="user_username"
        entityName="Subscription"
      />
    </>
  );
}
