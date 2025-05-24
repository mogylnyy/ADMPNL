// This is an AI-powered tool that flags subscriptions with unusual end dates, such as those about to expire.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubscriptionSchema = z.object({
  id: z.string().describe('The unique identifier of the subscription.'),
  userId: z.string().describe('The ID of the user who owns the subscription.'),
  productId: z.string().describe('The ID of the product the subscription is for.'),
  startDate: z.string().datetime().describe('The date and time the subscription started.'),
  endDate: z.string().datetime().describe('The date and time the subscription is set to end.'),
  status: z.enum(['active', 'inactive', 'pending', 'canceled']).describe('The current status of the subscription.'),
  autoRenew: z.boolean().describe('Whether the subscription is set to automatically renew.'),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

const SmartStatusMonitorInputSchema = z.array(SubscriptionSchema).describe('An array of subscriptions to analyze.');
export type SmartStatusMonitorInput = z.infer<typeof SmartStatusMonitorInputSchema>;

const FlaggedSubscriptionSchema = z.object({
  subscriptionId: z.string().describe('The ID of the subscription that was flagged.'),
  reason: z.string().describe('The reason why the subscription was flagged.'),
});

const SmartStatusMonitorOutputSchema = z.array(FlaggedSubscriptionSchema).describe('An array of subscriptions that have unusual end dates or statuses.');
export type SmartStatusMonitorOutput = z.infer<typeof SmartStatusMonitorOutputSchema>;

export async function smartStatusMonitor(input: SmartStatusMonitorInput): Promise<SmartStatusMonitorOutput> {
  return smartStatusMonitorFlow(input);
}

const smartStatusMonitorPrompt = ai.definePrompt({
  name: 'smartStatusMonitorPrompt',
  input: {schema: SmartStatusMonitorInputSchema},
  output: {schema: SmartStatusMonitorOutputSchema},
  prompt: `You are an AI assistant designed to analyze a list of subscriptions and identify any that have unusual end dates or statuses.  Unusual means close to expiring (within 7 days), or cancelled when autoRenew is true.

Analyze the following subscriptions and flag any that meet these criteria.  Return a JSON array of flagged subscription objects, with the subscriptionId and a brief reason.

Subscriptions:
{{#each this}}
- ID: {{id}}, User ID: {{userId}}, Product ID: {{productId}}, Start Date: {{startDate}}, End Date: {{endDate}}, Status: {{status}}, Auto Renew: {{autoRenew}}
{{/each}}`,
});

const smartStatusMonitorFlow = ai.defineFlow(
  {
    name: 'smartStatusMonitorFlow',
    inputSchema: SmartStatusMonitorInputSchema,
    outputSchema: SmartStatusMonitorOutputSchema,
  },
  async input => {
    const {output} = await smartStatusMonitorPrompt(input);
    return output!;
  }
);
