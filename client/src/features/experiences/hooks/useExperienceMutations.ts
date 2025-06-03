import { trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import { Experience } from "@advanced-react/server/database/schema";
import { useParams, useSearch } from "@tanstack/react-router";

type ExperienceMutationOptions = {
  edit?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  delete?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
};

export function useExperienceMutations(
  options: ExperienceMutationOptions = {},
) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { userId: pathUserId } = useParams({ strict: false });
  const { q: pathQ } = useSearch({ strict: false });

  const editMutation = trpc.experiences.edit.useMutation({
    onSuccess: async ({ id }) => {
      await utils.experiences.byId.invalidate({ id });

      toast({
        title: "Experience updated successfully!",
        description: "Your experience has been updated successfully!",
      });

      options.edit?.onSuccess?.(id);
    },
    onError: (error) => {
      toast({
        title: "Failed to edit experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.experiences.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.experiences.feed.invalidate(),
        pathUserId
          ? utils.experiences.byUserId.invalidate({ id: pathUserId })
          : Promise.resolve(),
        pathQ
          ? utils.experiences.search.invalidate({ q: pathQ })
          : Promise.resolve(),
      ]);
      toast({
        title: "Experience deleted successfully!",
        description: "Your experience has been deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    editMutation,
    deleteMutation,
  };
}
