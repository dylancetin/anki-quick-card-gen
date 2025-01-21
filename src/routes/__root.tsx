import "@fontsource-variable/outfit";
import "../globals.css";
import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/components/logo";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { EditOpenAIConfig } from "@/components/dash/openai-settings";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <TooltipProvider delayDuration={200}>
      <header className="flex h-16 items-center gap-4 border-b bg-bw-100 px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Logo />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                to="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Logo />
                <span className="sr-only">Baykus Logo</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full justify-end items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <EditOpenAIConfig />
        </div>
      </header>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
      <Toaster richColors />
    </TooltipProvider>
  );
}
