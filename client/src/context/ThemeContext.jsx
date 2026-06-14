import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const THEME_STORAGE_KEY = "somupilot_ai_theme";
const THEME_TRANSITION_CLASS = "theme-transitioning";
const THEME_TO_DARK_CLASS = "theme-transition-to-dark";
const THEME_TO_LIGHT_CLASS = "theme-transition-to-light";
const THEME_FADE_CLASS = "theme-fading";
const THEME_DURATION_MS = 550;
const THEME_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const ThemeContext = createContext(null);

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "dark";
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

const applyThemeToDocument = (nextTheme) => {
  const root = document.documentElement;

  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const isTransitioningRef = useRef(false);
  const pendingTransitionRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    applyThemeToDocument(theme);
  }, [theme]);

  const runThemeTransition = async (nextTheme, source) => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const currentTheme = root.dataset.theme || themeRef.current;

    if (nextTheme === currentTheme) {
      return;
    }

    if (isTransitioningRef.current) {
      pendingTransitionRef.current = { nextTheme, source };
      return;
    }

    isTransitioningRef.current = true;

    const applyNextTheme = () => {
      flushSync(() => {
        setThemeState(nextTheme);
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
      const isSwitchingToDark = nextTheme === "dark";

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

        if (pendingTransition.nextTheme !== (document.documentElement.dataset.theme || themeRef.current)) {
          runThemeTransition(pendingTransition.nextTheme, pendingTransition.source).catch(() => {
            setThemeState(pendingTransition.nextTheme);
          });
        }
      }
    }
  };

  const setTheme = (nextTheme, source) => {
    runThemeTransition(nextTheme, source).catch(() => {
      setThemeState(nextTheme);
    });
  };

  const toggleTheme = (source) => {
    const currentTheme = document.documentElement.dataset.theme || themeRef.current;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme, source);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme]
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
