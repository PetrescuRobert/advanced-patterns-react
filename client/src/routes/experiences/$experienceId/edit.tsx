import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { isTRPCClientError, router, trpc } from "@/router.tsx";
import { Experience } from "@advanced-react/server/database/schema";
import Card from "@/features/shared/components/ui/Card.tsx";
import ExperienceForm from "@/features/experiences/components/ExperienceForm.tsx";

export const Route = createFileRoute("/experiences/$experienceId/edit")({
  component: ExperienceEditPage,
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    try {
      const experience = await trpcQueryUtils.experiences.byId.ensureData({
        id: params.experienceId,
      });

      if (!currentUser || experience.userId !== currentUser.id) {
        throw redirect({
          to: "/experiences/$experienceId",
          params: { experienceId: params.experienceId },
        });
      }
    } catch (e) {
      if (isTRPCClientError(e) && e.data?.code === "NOT_FOUND") {
        throw notFound();
      }

      throw e;
    }
  },
});

function ExperienceEditPage() {
  const { experienceId } = Route.useParams();

  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });

  function navigateToExperience(id: Experience["id"]) {
    router.navigate({
      to: "/experiences/$experienceId",
      params: { experienceId: id },
    });
  }

  return (
    <main className={"space-y-4"}>
      <h1 className={"text-2xl font-bold"}>Edit Experience</h1>
      <Card>
        <ExperienceForm
          experience={experience}
          onSuccess={navigateToExperience}
          onCancel={navigateToExperience}
        />
      </Card>
    </main>
  );
}
