import { Experience, User } from "@advanced-react/server/database/schema";

type ExperienceWithUser = Experience & { user: User };

type ExperienceWithUserContext = Experience & {
  isAttending: boolean;
  isFavorited: boolean;
};

type ExperienceWithAttendees = Experience & { attendees: User[] };

type ExperienceWithAttendeesCount = Experience & { attendeesCount: number };

type ExperienceWithFavoritesCount = Experience & { favoritesCount: number };

type ExperienceWithCommentsCount = Experience & { commentsCount: number };

export type ExperienceForList = ExperienceWithUser &
  ExperienceWithUserContext &
  ExperienceWithCommentsCount &
  ExperienceWithAttendeesCount &
  ExperienceWithFavoritesCount;

export type ExperienceForDetails = ExperienceWithUser &
  ExperienceWithUserContext &
  ExperienceWithCommentsCount &
  ExperienceWithAttendees &
  ExperienceWithAttendeesCount &
  ExperienceWithFavoritesCount;
