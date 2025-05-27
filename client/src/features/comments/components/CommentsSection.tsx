import { Experience } from "@advanced-react/server/database/schema";
import { trpc } from "@/router.tsx";
import CommentList from "@/features/comments/components/CommentList.tsx";
import CommentCreateForm from "@/features/comments/components/CommentCreateForm.tsx";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent.tsx";

type CommentsSectionProps = {
  experienceId: Experience["id"];
  commentsCount: number;
};

export default function CommentsSection({
  experienceId,
  commentsCount,
}: CommentsSectionProps) {
  const commentsQuery = trpc.comments.byExperienceId.useQuery(
    { experienceId },
    {
      enabled: commentsCount > 0,
    },
  );

  if (commentsQuery.error) {
    return <ErrorComponent />;
  }

  return (
    <div className={"space-y-4"}>
      <h3 className={"font-semibold"}>Comments ({commentsCount})</h3>
      <CommentCreateForm experienceId={experienceId} />
      <CommentList
        comments={commentsQuery.data ?? []}
        isLoading={commentsQuery.isLoading}
      />
    </div>
  );
}
