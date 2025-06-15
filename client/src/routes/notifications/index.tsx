import { createFileRoute, redirect } from "@tanstack/react-router";
import { trpc } from "@/router.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { NotificationList } from "@/features/notifications/components/NotificationList";

export const Route = createFileRoute("/notifications/")({
  component: NotificationsPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      throw redirect({ to: "/login" });
    }

    await trpcQueryUtils.notifications.feed.prefetchInfinite({});
  },
});

function NotificationsPage() {
  const [{ pages }, notificationsQuery] =
    trpc.notifications.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4">
      <InfiniteScroll onLoadMore={notificationsQuery.fetchNextPage}>
        <NotificationList
          notifications={pages.flatMap((page) => page.notifications)}
          isLoading={notificationsQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
