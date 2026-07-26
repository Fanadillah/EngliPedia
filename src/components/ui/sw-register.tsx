"use client";

import { useEffect } from "react";

/**
 * Registers the Serwist service worker on mount.
 * Embedded inline — no external deps needed at runtime.
 */
export function SWRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available — could show update prompt
                console.log("[SW] New version available");
              }
            });
          }
        });
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    };

    // Register after page load
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
    }

    return () => {
      // Cleanup not needed
    };
  }, []);

  return null;
}
