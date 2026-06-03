import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./app/index.tsx";
import { TooltipProvider } from "./shared/components/ui/tooltip.tsx";
import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageLoaderProvider } from "./shared/components/PageLoaderProvider.tsx";

const queryClient = new QueryClient();

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <PageLoaderProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </TooltipProvider>
    </QueryClientProvider>
  </PageLoaderProvider>,
);
