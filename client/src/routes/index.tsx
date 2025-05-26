import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList.tsx";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.experiences.feed.prefetchInfinite({});
  },
});

function Index() {
  const [{ pages }, experiencesQuery] =
    trpc.experiences.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
      <ExperiencesList
        experiences={pages.flatMap((page) => page.experiences) ?? []}
        isLoading={experiencesQuery.isFetchingNextPage}
      />
    </InfiniteScroll>
  );
}
