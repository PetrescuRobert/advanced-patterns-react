import Card from "@/features/shared/components/ui/Card.tsx";
import { CommentForList } from "@/features/comments/types.ts";
import { useState } from "react";
import CommentEditForm from "@/features/comments/components/CommentEditForm.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";

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
      <CommentCardButtons setIsEditing={setIsEditing} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className={"flex items-center gap-2"}>
      <div>{comment.user.name}</div>
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

type CommentCardButtonsProp = {
  setIsEditing: (isEditing: boolean) => void;
};

function CommentCardButtons({ setIsEditing }: CommentCardButtonsProp) {
  return (
    <div className={"flex gap-4"}>
      <Button variant={"link"} onClick={() => setIsEditing(true)}>
        Edit
      </Button>
    </div>
  );
}
