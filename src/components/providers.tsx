"use client";

import {
  Authenticated,
  Unauthenticated,
  ConvexReactClient,
  AuthLoading,
} from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { dark } from "@clerk/themes";
import UnAuthenticatedView from "./auth/unauthenticated";
import AuthLoadingView from "./auth/authloading";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  return (
    <ClerkProvider appearance={{ theme: dark }}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthRoute ? (
            children
          ) : (
            <>
              <Authenticated>{children}</Authenticated>
              <Unauthenticated>
                <UnAuthenticatedView />
              </Unauthenticated>
              <AuthLoading>
                <AuthLoadingView />
              </AuthLoading>
            </>
          )}
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
