import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const THEME_STORAGE_KEY = "somupilot_ai_theme";
const THEME_TRANSITION_CLASS = "theme-transitioning";
const THEME_TO_DARK_CLASS = "theme-transition-to-dark";
const THEME_TO_LIGHT_CLASS = "theme-transition-to-light";
const THEME_FADE_CLASS = "theme-fading";
const THEME_DURATION_MS = 550;
const THEME_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";
const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
};

const getInitialThemeMode = () => {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
    return savedTheme;
  }

  return "system";
};

const resolveTransitionOrigin = (source) => {
  if (!source) {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  if (typeof source.clientX === "number" && typeof source.clientY === "number") {
    return {
      x: source.clientX,
      y: source.clientY,
    };
  }

  const element = source.currentTarget || source.target || source;

  if (element && typeof element.getBoundingClientRect === "function") {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
};

const applyThemeToDocument = (resolvedTheme, themeMode) => {
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themeMode = themeMode;
  root.style.colorScheme = resolvedTheme;
  localStorage.setItem(THEME_STORAGE_KEY, themeMode);
};

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(getInitialThemeMode);
  const [resolvedTheme, setResolvedThemeState] = useState(() => {
    const initialMode = getInitialThemeMode();
    return initialMode === "system" ? getSystemTheme() : initialMode;
  });
  const isTransitioningRef = useRef(false);
  const pendingTransitionRef = useRef(null);
  const themeModeRef = useRef(themeMode);
  const resolvedThemeRef = useRef(resolvedTheme);

  useEffect(() => {
    themeModeRef.current = themeMode;
    resolvedThemeRef.current = resolvedTheme;
    applyThemeToDocument(resolvedTheme, themeMode);
  }, [resolvedTheme, themeMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);

    const handleSystemThemeChange = (event) => {
      if (themeModeRef.current !== "system") {
        return;
      }

      setResolvedThemeState(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  const runThemeTransition = async (nextThemeMode, source) => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextResolvedTheme = nextThemeMode === "system" ? getSystemTheme() : nextThemeMode;
    const currentResolvedTheme = root.dataset.theme || resolvedThemeRef.current;

    if (nextResolvedTheme === currentResolvedTheme && nextThemeMode === themeModeRef.current) {
      return;
    }

    if (isTransitioningRef.current) {
      pendingTransitionRef.current = { nextThemeMode, source };
      return;
    }

    isTransitioningRef.current = true;

    const applyNextTheme = () => {
      flushSync(() => {
        setThemeModeState(nextThemeMode);
        setResolvedThemeState(nextResolvedTheme);
      });
    };

    try {
      if (prefersReducedMotion) {
        applyNextTheme();
        return;
      }

      const origin = resolveTransitionOrigin(source);
      const endRadius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y)
      );
      const isSwitchingToDark = nextResolvedTheme === "dark";

      root.style.setProperty("--theme-transition-x", `${origin.x}px`);
      root.style.setProperty("--theme-transition-y", `${origin.y}px`);
      root.style.setProperty("--theme-transition-radius", `${endRadius}px`);

      if (typeof document.startViewTransition !== "function") {
        root.classList.add(THEME_FADE_CLASS);
        applyNextTheme();
        window.setTimeout(() => {
          root.classList.remove(THEME_FADE_CLASS);
        }, 220);
        return;
      }

      root.classList.add(THEME_TRANSITION_CLASS);
      root.classList.toggle(THEME_TO_DARK_CLASS, isSwitchingToDark);
      root.classList.toggle(THEME_TO_LIGHT_CLASS, !isSwitchingToDark);

      const transition = document.startViewTransition(() => {
        applyNextTheme();
      });

      try {
        await transition.ready;

        document.documentElement.animate(
          {
            clipPath: isSwitchingToDark
              ? [
                  `circle(0px at ${origin.x}px ${origin.y}px)`,
                  `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
                ]
              : [
                  `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
                  `circle(0px at ${origin.x}px ${origin.y}px)`,
                ],
          },
          {
            duration: THEME_DURATION_MS,
            easing: THEME_EASING,
            pseudoElement: isSwitchingToDark
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          }
        );
      } catch (_error) {
        root.classList.remove(THEME_TRANSITION_CLASS, THEME_TO_DARK_CLASS, THEME_TO_LIGHT_CLASS);
      }

      await transition.finished.catch(() => {});
    } finally {
      root.classList.remove(THEME_TRANSITION_CLASS, THEME_TO_DARK_CLASS, THEME_TO_LIGHT_CLASS);
      isTransitioningRef.current = false;

      if (pendingTransitionRef.current) {
        const pendingTransition = pendingTransitionRef.current;
        pendingTransitionRef.current = null;

        runThemeTransition(pendingTransition.nextThemeMode, pendingTransition.source).catch(() => {
          const fallbackResolvedTheme =
            pendingTransition.nextThemeMode === "system"
              ? getSystemTheme()
              : pendingTransition.nextThemeMode;

          setThemeModeState(pendingTransition.nextThemeMode);
          setResolvedThemeState(fallbackResolvedTheme);
        });
      }
    }
  };

  const setTheme = (nextThemeMode, source) => {
    runThemeTransition(nextThemeMode, source).catch(() => {
      const fallbackResolvedTheme =
        nextThemeMode === "system" ? getSystemTheme() : nextThemeMode;

      setThemeModeState(nextThemeMode);
      setResolvedThemeState(fallbackResolvedTheme);
    });
  };

  const toggleTheme = (source) => {
    const currentResolvedTheme = document.documentElement.dataset.theme || resolvedThemeRef.current;
    const nextThemeMode = currentResolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextThemeMode, source);
  };

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      themeMode,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [resolvedTheme, themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
