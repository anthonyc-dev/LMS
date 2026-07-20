import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PageLoaderContextType = {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setPageTitle: (title: string) => void;
};

const PageLoaderContext = createContext<PageLoaderContextType | undefined>(
  undefined,
);

export function PageLoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Library App");

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    document.title = loading ? `Loading ${pageTitle}...` : pageTitle;

    if (favicon) {
      favicon.href = loading ? "/spinner.ico" : "/favicon.ico";
    }
  }, [loading, pageTitle]);

  const value = useMemo(
    () => ({
      loading,
      startLoading: () => setLoading(true),
      stopLoading: () => setLoading(false),
      setPageTitle,
    }),
    [loading],
  );

  return (
    <PageLoaderContext.Provider value={value}>
      {children}
    </PageLoaderContext.Provider>
  );
}

export function usePageLoader() {
  const context = useContext(PageLoaderContext);

  if (!context) {
    throw new Error("usePageLoader must be used inside PageLoaderProvider");
  }

  return context;
}
