"use client";

import { useEffect } from "react";

export function AppScanner() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    import("react-scan").then(({ scan }) => {
      scan({
        enabled: true,
      });
    });
  }, []);

  return null;
}
