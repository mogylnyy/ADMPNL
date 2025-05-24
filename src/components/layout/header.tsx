import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-1 items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        </div>
        {/* Placeholder for User Menu / Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* <ThemeToggle /> */}
          <Button variant="ghost" size="icon">
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Профиль пользователя</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
