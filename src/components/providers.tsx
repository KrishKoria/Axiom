"use client";

import {
  Authenticated,
  Unauthenticated,
  ConvexReactClient,
  AuthLoading,
} from "convex/react";
import { ClerkProvider, useAuth, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import UnAuthenticatedView from "./views/auth/unauthenticated";
import AuthLoadingView from "./views/auth/authloading";
import { dark } from "@clerk/themes";

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
              <Authenticated>
                <UserButton />
                {children}
              </Authenticated>
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
