import { useState, useEffect } from "react";

/**
 * Returns a greeting based on the current local time:
 * - 05:00 - 11:59: Good morning / శుభోదయం
 * - 12:00 - 16:59: Good afternoon / శుభ మధ్యాహ్నం
 * - 17:00 - 04:59: Good evening / శుభ సాయంత్రం
 */
export function getTimeBasedGreeting(lang = "en") {
  const hour = new Date().getHours();
  const isEn = lang === "en";

  if (hour >= 5 && hour < 12) {
    return isEn ? "Good morning" : "శుభోదయం";
  } else if (hour >= 12 && hour < 17) {
    return isEn ? "Good afternoon" : "శుభ మధ్యాహ్నం";
  } else {
    return isEn ? "Good evening" : "శుభ సాయంత్రం";
  }
}

/**
 * React hook that automatically updates the greeting as time progresses.
 * Re-evaluates every minute.
 */
export function useTimeGreeting(lang = "en") {
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting(lang));

  useEffect(() => {
    setGreeting(getTimeBasedGreeting(lang));

    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting(lang));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [lang]);

  return greeting;
}

/**
 * Helper to get live formatted local date & time strings
 */
export function useLiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { now, formattedDate, formattedTime };
}
