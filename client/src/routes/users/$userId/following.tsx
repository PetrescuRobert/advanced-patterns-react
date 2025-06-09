import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { isTRPCClientError, trpc } from "@/router.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { UserList } from "@/features/users/components/UserList.tsx";

export const Route = createFileRoute("/users/$userId/following")({
  component: UserFollowingPage,
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    try {
      await trpcQueryUtils.users.following.prefetchInfinite({
        id: params.userId,
      });
    } catch (error) {
      if (isTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }

      throw error;
    }
  },
});

function UserFollowingPage() {
  const { userId } = Route.useParams();

  const [{ pages }, followingQuery] =
    trpc.users.following.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const totalFollowing = pages[0].followingCount;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Followers ({totalFollowing})</h1>

      <InfiniteScroll onLoadMore={followingQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followingQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
