import Card from "@/features/shared/components/ui/Card.tsx";
import { ExperienceForDetails } from "@/features/experiences/types.ts";
import { LinkIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import Link from "@/features/shared/components/ui/Link.tsx";
import { router } from "@/router.tsx";
import { ExperienceDeleteDialog } from "@/features/experiences/components/ExperienceDeleteDialog.tsx";
import { ExperienceAttendButton } from "./ExperienceAttendButton";
import { UserAvatarList } from "@/features/users/components/UserAvatarList.tsx";
import { ExperienceFavoriteButton } from "@/features/experiences/components/ExperienceFavoriteButton.tsx";
import TagList from "@/features/tags/components/TagList.tsx";

type ExperienceDetailsProps = {
  experience: ExperienceForDetails;
};

export function ExperienceDetails({ experience }: ExperienceDetailsProps) {
  return (
    <Card className={"p-0"}>
      <ExperienceDetailsMedia experience={experience} />
      <div className="space-y-4 p-4">
        <ExperienceDetailsContent experience={experience} />
        <ExperienceDetailsTags experience={experience} />
        <ExperienceDetailsMeta experience={experience} />
        <ExperienceCardActionButtons experience={experience} />
        <div
          className={
            "border-neutral-200 dark:border-t-2 dark:border-neutral-800"
          }
        >
          <ExperienceDetailsAttedees experience={experience} />
        </div>
      </div>
    </Card>
  );
}

type ExperienceDetailsMediaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMedia({ experience }: ExperienceDetailsMediaProps) {
  if (!experience.imageUrl) {
    return null;
  }

  return (
    <div className={"aspect-video w-full overflow-hidden rounded-lg"}>
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className={"h-full w-full object-cover"}
      />
    </div>
  );
}

type ExperienceDetailsContentProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsContent({
  experience,
}: ExperienceDetailsContentProps) {
  return (
    <p className="text-lg text-neutral-600 dark:text-neutral-400">
      {experience.content}
    </p>
  );
}

type ExperienceDetailsTagsProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsTags({ experience }: ExperienceDetailsTagsProps) {
  return <TagList tags={experience.tags} />;
}

type ExperienceDetailsMetaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMeta({ experience }: ExperienceDetailsMetaProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <time className="text-neutral-600 dark:text-neutral-400">
          {new Date(experience.scheduledAt).toLocaleString()}
        </time>
      </div>

      {experience.url && (
        <div className="flex items-center gap-2">
          <LinkIcon
            size={16}
            className="text-secondary-500 dark:text-primary-500"
          />
          <a
            href={experience.url}
            target="_blank"
            className="text-secondary-500 dark:text-primary-500 hover:underline"
          >
            Event Details
          </a>
        </div>
      )}
    </div>
  );
}

type ExperienceDetailsAttedeesProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceDetailsAttedees({
  experience,
}: ExperienceDetailsAttedeesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Host</h3>
        <UserAvatarList users={[experience.user]} totalCount={1} />
      </div>

      <div className="space-y-2">
        <Link
          to="/experiences/$experienceId/attendees"
          params={{ experienceId: experience.id }}
          variant="secondary"
        >
          <h3 className="font-medium">
            Attendees ({experience.attendeesCount})
          </h3>
        </Link>
        {experience.attendeesCount > 0 ? (
          <UserAvatarList
            users={experience.attendees}
            totalCount={experience.attendeesCount}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">
            Be the first to attend!
          </p>
        )}
      </div>
    </div>
  );
}

type ExperienceCardActionButtonsProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceCardActionButtons({
  experience,
}: ExperienceCardActionButtonsProps) {
  const { currentUser } = useCurrentUser();

  const isPostOwner = experience.userId === currentUser?.id;

  if (isPostOwner) {
    return <ExperienceCardOwnerButtons experience={experience} />;
  }

  if (currentUser) {
    return (
      <div className={"flex items-center gap-4"}>
        <ExperienceAttendButton
          experienceId={experience.id}
          isAttending={experience.isAttending}
        />
        <ExperienceFavoriteButton
          experienceId={experience.id}
          isFavorited={experience.isFavorited}
          favoritesCount={experience.favoritesCount}
        />
      </div>
    );
  }

  return null;
}

type ExperienceCardOwnerButtonsProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceCardOwnerButtons({
  experience,
}: ExperienceCardOwnerButtonsProps) {
  return (
    <div className={"flex gap-4"}>
      <Button asChild variant={"link"}>
        <Link
          to={"/experiences/$experienceId/edit"}
          params={{ experienceId: experience.id }}
        >
          Edit
        </Link>
      </Button>
      <ExperienceDeleteDialog
        experience={experience}
        onSuccess={() => {
          router.navigate({ to: "/" });
        }}
      />
    </div>
  );
}
