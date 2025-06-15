import { NotificationForList } from "@/features/notifications/types.ts";
import { LinkProps } from "@tanstack/react-router";
import Link from "@/features/shared/components/ui/Link.tsx";
import Card from "@/features/shared/components/ui/Card.tsx";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast.ts";

type NotificationCardProps = {
  notification: NotificationForList;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  let linkProps: Pick<LinkProps, "to" | "params"> | undefined;
  const utils = trpc.useUtils();
  const { toast } = useToast();

  if (
    [
      "user_commented_experience",
      "user_attending_experience",
      "user_unattending_experience",
    ].includes(notification.type) &&
    notification.experienceId
  ) {
    linkProps = {
      to: "/experiences/$experienceId",
      params: { experienceId: notification.experienceId },
    };
  } else if (notification.type === "user_followed_user") {
    linkProps = {
      to: "/users/$userId",
      params: { userId: notification.fromUserId },
    };
  }

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onMutate: async ({ id }) => {
      await utils.notifications.feed.cancel();
      await utils.notifications.unreadCount.cancel();

      const previousData = {
        feed: utils.notifications.feed.getInfiniteData(),
        unreadCount: utils.notifications.unreadCount.getData(),
      };

      utils.notifications.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifcations: page.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          })),
        };
      });

      utils.notifications.unreadCount.setData(undefined, (oldData) =>
        oldData ? Math.max(0, oldData - 1) : 0,
      );

      return { previousData };
    },
    onError: (error, _, context) => {
      utils.notifications.feed.setInfiniteData({}, context?.previousData.feed);
      utils.notifications.unreadCount.setData(
        undefined,
        context?.previousData.unreadCount,
      );

      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Link
      {...linkProps}
      variant="ghost"
      onClick={() =>
        !notification.read && markAsRead.mutate({ id: notification.id })
      }
    >
      <Card className="flex w-full items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <div>
          <p className="text-gray-800 dark:text-gray-200">
            {notification.content}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-red-500" />
        )}
      </Card>
    </Link>
  );
}
