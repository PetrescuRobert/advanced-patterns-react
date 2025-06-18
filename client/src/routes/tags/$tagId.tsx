import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { isTRPCClientError, trpc } from "@/router.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList.tsx";

export const Route = createFileRoute("/tags/$tagId")({
  component: TagPage,
  params: {
    parse: (params) => ({
      tagId: z.coerce.number().parse(params.tagId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.tags.byId.ensureData({ id: params.tagId }),
        trpcQueryUtils.experiences.byTagId.prefetchInfinite({
          id: params.tagId,
        }),
      ]);
    } catch (error) {
      if (isTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }

      throw error;
    }
  },
});

function TagPage() {
  const { tagId } = Route.useParams();

  const [tag] = trpc.tags.byId.useSuspenseQuery({ id: tagId });

  const [{ pages }, experiencesQuery] =
    trpc.experiences.byTagId.useSuspenseInfiniteQuery(
      {
        id: tagId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">Experiences with "{tag.name}"</h2>
      <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
        <ExperiencesList
          experiences={pages.flatMap((page) => page.experiences)}
          isLoading={experiencesQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
