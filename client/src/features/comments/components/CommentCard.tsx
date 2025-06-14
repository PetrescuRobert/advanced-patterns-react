import Card from "@/features/shared/components/ui/Card.tsx";
import {
  CommentForList,
  CommentOptimistic,
} from "@/features/comments/types.ts";
import { useState } from "react";
import CommentEditForm from "@/features/comments/components/CommentEditForm.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog.tsx";
import { trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import UserAvatar from "@/features/users/components/UserAvatar.tsx";
import Link from "@/features/shared/components/ui/Link.tsx";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";

type CommentCardProps = {
  comment: CommentForList;
};

export default function CommentCard({ comment }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (isEditing) {
    return <CommentEditForm comment={comment} setIsEditing={setIsEditing} />;
  }

  return (
    <Card className={"space-y-4"}>
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardButtons setIsEditing={setIsEditing} comment={comment} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className={"flex items-center gap-2"}>
      <Link to={"/users/$userId"} params={{ userId: comment.userId }}>
        <UserAvatar user={comment.user} />
      </Link>
      <time className={"text-sm text-neutral-500"}>
        - {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, "comment">;

function CommentCardContent({ comment }: CommentCardContentProps) {
  return <div>{comment.content}</div>;
}

type CommentCardButtonsProp = Pick<CommentCardProps, "comment"> & {
  setIsEditing: (isEditing: boolean) => void;
};

function CommentCardButtons({ setIsEditing, comment }: CommentCardButtonsProp) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const utils = trpc.useUtils();

  const { currentUser } = useCurrentUser();

  const { toast } = useToast();

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.comments.byExperienceId.invalidate({
          experienceId: comment.experienceId,
        }),
        utils.experiences.feed.invalidate({}),
      ]);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Comment deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isCommentOwner = comment.userId === currentUser?.id;
  const isExperienceOwner = comment.experience.userId === currentUser?.id;

  if (!isCommentOwner && !isExperienceOwner) {
    return null;
  }

  return (
    <div className={"flex gap-4"}>
      {isCommentOwner && (
        <Button
          variant={"link"}
          onClick={() => setIsEditing(true)}
          disabled={(comment as CommentOptimistic).__optimistic}
        >
          Edit
        </Button>
      )}
      {(isCommentOwner || isExperienceOwner) && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={"destructive-link"}
              disabled={(comment as CommentOptimistic).__optimistic}
            >
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
            </DialogHeader>
            <p className={"text-neutral-600 dark:text-neutral-400"}>
              Are you sure you want to delete this comment?
            </p>
            <DialogFooter>
              <Button
                variant={"link"}
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={"destructive"}
                onClick={() => {
                  deleteMutation.mutate({ id: comment.id });
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
