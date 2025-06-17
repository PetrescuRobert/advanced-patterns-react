import { createFileRoute, redirect } from "@tanstack/react-router";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { trpc } from "@/router.tsx";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList.tsx";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }

    await trpcQueryUtils.experiences.favorites.prefetchInfinite({});
  },
});

function FavoritesPage() {
  const [{ pages }, experiencesQuery] =
    trpc.experiences.favorites.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className={"space-y-4"}>
      <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
        <ExperiencesList
          experiences={pages.flatMap((page) => page.experiences)}
          isLoading={experiencesQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
