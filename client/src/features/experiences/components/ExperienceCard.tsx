import { Experience } from "@advanced-react/server/database/schema";
import Card from "@/features/shared/components/ui/Card.tsx";

type ExperienceCardProps = {
  experience: Experience;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <Card className={"overflow-hidden p-0"}>
      <ExperienceCardMedia experience={experience} />
    </Card>
  );
}

type ExperienceCardMediaProps = Pick<ExperienceCardProps, "experience">;

function ExperienceCardMedia({ experience }: ExperienceCardMediaProps) {
  if (!experience.imageUrl) {
    return null;
  }

  return (
    <div className={"aspect-video w-full"}>
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className={"h-full w-full object-cover"}
      />
    </div>
  );
}
