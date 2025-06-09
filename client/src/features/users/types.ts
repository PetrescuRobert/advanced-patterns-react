import { User } from "@advanced-react/server/database/schema";

type UserWithHostedExperiences = User & {
  hostedExperiencesCount: number;
};

type UserWithFollowCounts = User & {
  followersCount: number;
  followingCount: number;
};

export type UserForList = User;

export type UserForDetails = UserWithHostedExperiences & UserWithFollowCounts;
