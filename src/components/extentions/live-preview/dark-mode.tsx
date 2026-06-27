import React, { createContext, useContext, useEffect, useState } from "react";

export const DEFAULT_DARK_MODE_COOKIE = "darkMode";

/**
 * Whether Live Preview iframes should render in dark mode. The value reaches
 * the (sandboxed) iframe via the parent, which is the only place that can read
 * a cookie — the iframe runs in an opaque origin and cannot.
 */
const DarkModeContext = createContext<boolean>(false);

export const useLivePreviewDarkMode = (): boolean => useContext(DarkModeContext);

const truthy = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "dark" || v === "yes" || v === "on";
};

const readCookieDarkMode = (cookieName: string): boolean => {
  if (typeof document === "undefined") return false;
  const escaped = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + escaped + "=([^;]*)")
  );
  return match ? truthy(decodeURIComponent(match[1])) : false;
};

interface ProviderProps {
  /** Explicit override. When defined it wins over the cookie. */
  darkMode?: boolean;
  /** Cookie consulted when `darkMode` is not provided. */
  darkModeCookieName?: string;
  children: React.ReactNode;
}

export const LivePreviewDarkModeProvider: React.FC<ProviderProps> = ({
  darkMode,
  darkModeCookieName = DEFAULT_DARK_MODE_COOKIE,
  children,
}) => {
  const [cookieValue, setCookieValue] = useState<boolean>(() =>
    readCookieDarkMode(darkModeCookieName)
  );

  // When no explicit prop is given, fall back to the cookie. Cookies emit no
  // change event, so poll (plus re-check on focus/visibility) to toggle live.
  useEffect(() => {
    if (darkMode !== undefined) return;
    const sync = () => setCookieValue(readCookieDarkMode(darkModeCookieName));
    sync();
    const id = window.setInterval(sync, 800);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [darkMode, darkModeCookieName]);

  const effective = darkMode !== undefined ? darkMode : cookieValue;

  return (
    <DarkModeContext.Provider value={effective}>
      {children}
    </DarkModeContext.Provider>
  );
};
