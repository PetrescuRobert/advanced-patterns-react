import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { trpc } from "@/router.tsx";
import { ExperienceDetails } from "@/features/experiences/components/ExperienceDetails.tsx";
import CommentsSection from "@/features/comments/components/CommentsSection.tsx";

export const Route = createFileRoute("/experiences/$experienceId/")({
  component: ExperiencePage,
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.experiences.byId.ensureData({
      id: params.experienceId,
    });
  },
});

function ExperiencePage() {
  const { experienceId } = Route.useParams();
  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });
  return (
    <main className={"space-y-4 pb-20"}>
      <ExperienceDetails experience={experience} />
      <CommentsSection
        experienceId={experienceId}
        commentsCount={experience.commentsCount}
      />
    </main>
  );
}
