import Spinner from "@/features/shared/components/ui/Spinner.tsx";
import { ExperienceCard } from "@/features/experiences/components/ExperienceCard.tsx";
import { ExperienceForList } from "@/features/experiences/types.ts";

type ExperiencesListProps = {
  experiences: ExperienceForList[];
  isLoading?: boolean;
  noExperiencesMessage?: string;
};

export function ExperiencesList({
  experiences,
  isLoading,
  noExperiencesMessage = "No experiences found!",
}: ExperiencesListProps) {
  return (
    <div className={"space-y-4"}>
      {experiences.map((experience) => (
        <ExperienceCard experience={experience} key={experience.id} />
      ))}
      {isLoading && (
        <div className={"flex justify-center"}>
          <Spinner />
        </div>
      )}
      {!isLoading && experiences.length === 0 && (
        <div className={"flex justify-center"}>{noExperiencesMessage}</div>
      )}
    </div>
  );
}
