"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute={"class"}
      themes={["light", "dark", "hiruko-light", "hiruko-dark"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
