import "@fontsource-variable/outfit";
import "../globals.css";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import Logo from "@/components/logo";
import { Toaster } from "@/components/ui/sonner";
import { EditOpenAIConfig } from "@/components/dash/openai-settings";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalSettingsStateProvider } from "@/components/global-settings";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export const Route = createRootRoute({
  component: RootComponent,
});

const queryClient = new QueryClient();
function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsStateProvider>
        <TooltipProvider delayDuration={200}>
          <header className="flex h-16 content-center items-center gap-4 border-b bg-bw-100 px-4 md:px-6">
            <nav className="gap-6 text-lg font-medium flex flex-row items-center md:text-sm">
              <Logo />
            </nav>
            <div className="flex w-full justify-end items-center">
              <EditOpenAIConfig />
            </div>
          </header>
          <Outlet />
          <Toaster richColors />
        </TooltipProvider>
      </GlobalSettingsStateProvider>
    </QueryClientProvider>
  );
}
