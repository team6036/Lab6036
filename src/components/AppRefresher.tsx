import { useEffect } from "react";
import useTryRefresh from "../hooks/useTryRefresh";

export interface AppRefresherProps {
  debounce: number;
}

export default function AppRefresher({ debounce }: AppRefresherProps) {
  const tryRefresh = useTryRefresh(debounce);

  useEffect(() => {
    tryRefresh();
    const interval = setInterval(tryRefresh, 5 * 1e3);
    return () => clearInterval(interval);
  }, [tryRefresh]);

  return null;
}
