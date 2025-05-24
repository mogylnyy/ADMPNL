import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { APP_NAME } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <Sidebar variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="p-4 flex items-center gap-2">
           <svg viewBox="0 0 100 100" width="32" height="32" className="text-primary fill-current">
            <rect width="100" height="100" rx="20" fill="hsl(var(--primary))" />
            <text x="50" y="60" fontSize="50" fill="hsl(var(--primary-foreground))" textAnchor="middle" dominantBaseline="middle">S</text>
          </svg>
          <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarNav />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <div className="hidden md:group-data-[collapsible=icon]:flex md:group-data-[collapsible=icon]:justify-center">
             <SidebarTrigger/>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
