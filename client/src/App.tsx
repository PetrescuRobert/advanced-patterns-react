import Navbar from "./features/shared/components/Navbar";
import { Toaster } from "./features/shared/components/ui/Toaster";
import { ThemeProvider } from "@/features/shared/components/ThemeProvider.tsx";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/router.tsx";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider defaultTheme={"dark"}>
      <Toaster />
      <div className="flex justify-center gap-8 pb-8">
        <Navbar />
        <div className="min-h-screen w-full max-w-2xl">
          <header className="mb-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h1 className="text-center text-xl font-bold">
              Advanced Patterns React
            </h1>
            <p className="text-center text-sm text-neutral-500">
              <b>
                <span className="dark:text-primary-500">Cosden</span> Solutions
              </b>
            </p>
          </header>

          <Index />
        </div>
      </div>
    </ThemeProvider>
  );
}

function Index() {
  const experiencesQuery = trpc.experiences.feed.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
      <ExperiencesList
        experiences={
          experiencesQuery.data?.pages.flatMap((page) => page.experiences) ?? []
        }
        isLoading={
          experiencesQuery.isLoading || experiencesQuery.isFetchingNextPage
        }
      />
    </InfiniteScroll>
  );
}
