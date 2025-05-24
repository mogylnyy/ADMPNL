"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";


export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state

  const isActive = (item: NavItem) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return item.matchSegments ? item.matchSegments.some(segment => pathname.startsWith(`/${segment}`)) : pathname.startsWith(item.href);
  };
  
  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => (
        <SidebarMenuItem key={item.label}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    className="w-full justify-start"
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span className={cn(
                        "truncate",
                        sidebarState === "collapsed" && !isMobile ? "hidden" : "inline" 
                      )}>
                        {item.label}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              {sidebarState === "collapsed" && !isMobile && (
                <TooltipContent side="right" align="center">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
