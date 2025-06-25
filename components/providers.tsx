"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "@/contexts/socket-context";
import { SessionFixer } from "@/components/session-fixer";
import { ConnectionStatus } from "@/components/ui/connection-status";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          <SessionFixer />
          {children}
          <ConnectionStatus />
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
