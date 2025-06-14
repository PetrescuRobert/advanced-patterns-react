import { Experience } from "@advanced-react/server/database/schema";
import { trpc } from "@/router.tsx";
import CommentList from "@/features/comments/components/CommentList.tsx";
import CommentCreateForm from "@/features/comments/components/CommentCreateForm.tsx";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent.tsx";
import Card from "@/features/shared/components/ui/Card.tsx";
import Spinner from "@/features/shared/components/ui/Spinner";

type CommentsSectionProps = {
  experienceId: Experience["id"];
  commentsCount: number;
};

export default function CommentsSection({
  experienceId,
  commentsCount,
}: CommentsSectionProps) {
  const commentsQuery = trpc.comments.byExperienceId.useQuery({ experienceId });

  const experienceQuery = trpc.experiences.byId.useQuery({ id: experienceId });

  if (commentsQuery.error || experienceQuery.error) {
    return <ErrorComponent />;
  }

  return (
    <div className={"space-y-4"}>
      <h3 className={"font-semibold"}>Comments ({commentsCount})</h3>
      {commentsQuery.isPending || experienceQuery.isPending ? (
        <div className={"flex justify-center py-4"}>
          <Spinner />
        </div>
      ) : (
        <>
          <Card>
            <CommentCreateForm experience={experienceQuery.data} />
          </Card>
          <CommentList comments={commentsQuery.data} />
        </>
      )}
    </div>
  );
}
