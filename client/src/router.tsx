import {
  createTRPCQueryUtils,
  createTRPCReact,
  getQueryKey,
  httpLink,
  httpBatchLink,
  TRPCClientError,
  TRPCLink,
  splitLink,
  isNonJsonSerializable,
} from "@trpc/react-query";
import type { AppRouter } from "@advanced-react/server";
import { env } from "@/lib/utils/env.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen.ts";
import Spinner from "@/features/shared/components/ui/Spinner.tsx";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent.tsx";
import { NotFoundComponent } from "@/features/shared/components/NotFoundComponent.tsx";
import { observable } from "@trpc/server/observable";

export const queryClient = new QueryClient();

function getHeaders() {
  const queryKey = getQueryKey(trpc.auth.currentUser);
  const token = queryClient.getQueryData<{ accessToken: string }>(
    queryKey,
  )?.accessToken;

  return {
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

export const trpc = createTRPCReact<AppRouter>();

const customLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(error) {
          if (error?.data?.code === "UNAUTHORIZED") {
            router.navigate({ to: "/login" });
          }
          observer.error(error);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

const trpcClient = trpc.createClient({
  links: [
    customLink,
    splitLink({
      condition(op) {
        return isNonJsonSerializable(op.input);
      },
      true: httpLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers: getHeaders(),
      }),
      false: httpBatchLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers: getHeaders(),
      }),
    }),
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

function createRouter() {
  const router = createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trpcQueryUtils,
    },
    defaultPendingComponent: () => (
      <div className={"flex items-center justify-center"}>
        <Spinner />
      </div>
    ),
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
    Wrap: function WrapComponent({ children }) {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
  });

  return router;
}

export const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
