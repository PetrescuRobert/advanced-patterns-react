import Card from "@/features/shared/components/ui/Card.tsx";
import { CommentForList } from "@/features/comments/types.ts";
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
      <UserAvatar user={comment.user} />
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

  return (
    <div className={"flex gap-4"}>
      <Button variant={"link"} onClick={() => setIsEditing(true)}>
        Edit
      </Button>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant={"destructive-link"}>Delete</Button>
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
    </div>
  );
}
