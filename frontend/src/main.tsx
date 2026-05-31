import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./app.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageLoaderProvider } from "./components/commons/PageLoaderProvider.tsx";

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
