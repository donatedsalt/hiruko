"use client";

import * as React from "react";

type CommandBarContextValue = {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  open: () => void;
  close: () => void;
};

const CommandBarContext = React.createContext<CommandBarContextValue | null>(
  null,
);

export function CommandBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setOpen] = React.useState(false);
  const open = React.useCallback(() => setOpen(true), []);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo(
    () => ({ isOpen, setOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <CommandBarContext.Provider value={value}>
      {children}
    </CommandBarContext.Provider>
  );
}

export function useCommandBar(): CommandBarContextValue {
  const ctx = React.useContext(CommandBarContext);
  if (!ctx) {
    throw new Error("useCommandBar must be used inside <CommandBarProvider>");
  }
  return ctx;
}
