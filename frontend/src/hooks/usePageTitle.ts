import { useEffect } from "react";

export function usePageTitle(title?: string) {
  useEffect(() => {
    const defaultTitle = "LMS";

    if (!title) {
      document.title = defaultTitle;
      return;
    }

    document.title = `${title} | ${defaultTitle}`;

    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
}
