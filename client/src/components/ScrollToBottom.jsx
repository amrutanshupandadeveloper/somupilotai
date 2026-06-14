import { useEffect, useState, useRef } from "react";

function ScrollToBottom({ scrollContainerRef, onScrollToBottom }) {
  const [isVisible, setIsVisible] = useState(false);
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollContainerRef?.current) return;

      const container = scrollContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show arrow if user is more than 120px from bottom
      setIsVisible(distanceFromBottom > 120);
    };

    // Check scroll position on scroll
    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition(); // Initial check
    }

    // Also check periodically for smooth updates
    checkIntervalRef.current = setInterval(checkScrollPosition, 100);

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [scrollContainerRef]);

  const handleClick = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      onScrollToBottom?.();
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-32 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[var(--border)] p-2.5 transition-all hover:scale-105 hover:border-[var(--border-strong)]"
      style={{
        backgroundColor: "var(--surface-elevated)",
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
      }}
      aria-label="Scroll to bottom"
    >
      <svg
        className="h-[18px] w-[18px] text-[var(--text-muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  );
}

export default ScrollToBottom;
