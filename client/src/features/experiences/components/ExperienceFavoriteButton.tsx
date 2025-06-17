import { Experience } from "@advanced-react/server/database/schema";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn.ts";
import { useExperienceMutations } from "@/features/experiences/hooks/useExperienceMutations.ts";

type ExperienceFavoriteButtonProps = {
  experienceId: Experience["id"];
  isFavorited: boolean;
  favoritesCount: number;
};

export function ExperienceFavoriteButton({
  experienceId,
  isFavorited,
  favoritesCount,
}: ExperienceFavoriteButtonProps) {
  const { currentUser } = useCurrentUser();

  const { favoriteMutation, unfavoriteMutation } = useExperienceMutations();

  if (!currentUser) {
    return null;
  }

  return (
    <Button
      variant={"link"}
      onClick={() => {
        if (isFavorited) {
          unfavoriteMutation.mutate({ id: experienceId });
        } else {
          favoriteMutation.mutate({ id: experienceId });
        }
      }}
      disabled={favoriteMutation.isPending || unfavoriteMutation.isPending}
    >
      <Heart
        className={cn("h-6 w-6", isFavorited && "fill-red-500 text-red-500")}
      />
      <span>{favoritesCount}</span>
    </Button>
  );
}
