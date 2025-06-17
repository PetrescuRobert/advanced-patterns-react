import { trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import { Experience, User } from "@advanced-react/server/database/schema";
import { useParams, useSearch } from "@tanstack/react-router";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";

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

  const { currentUser } = useCurrentUser();

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
        utils.experiences.favorites.invalidate(),
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

  const attendMutation = trpc.experiences.attend.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: User[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: true,
          attendeesCount: oldData.attendeesCount + 1,
          ...(oldData.attendees && {
            attendees: [currentUser, ...oldData.attendees],
          }),
        };
      }

      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        pathUserId
          ? utils.experiences.byUserId.cancel({ id: pathUserId })
          : Promise.resolve(),
        pathQ
          ? utils.experiences.search.cancel({ q: pathQ })
          : Promise.resolve(),
      ]);

      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search: pathQ
          ? utils.experiences.search.getInfiniteData({ q: pathQ })
          : undefined,
      };

      // Update the individual experience data to mark as attending
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      // Update the experience in the infinite feed list to mark as attending
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((experience) =>
              experience.id === id ? updateExperience(experience) : experience,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((experience) =>
                  experience.id === id
                    ? updateExperience(experience)
                    : experience,
                ),
              })),
            };
          },
        );
      }

      if (pathQ) {
        utils.experiences.search.setInfiniteData({ q: pathQ }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              experiences: page.experiences.map((experience) =>
                experience.id === id
                  ? updateExperience(experience)
                  : experience,
              ),
            })),
          };
        });
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Revert individual experience data to its previous state
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      // Revert feed data to its previous state
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      if (pathUserId) {
        // Revert user's experiences data to its previous state
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathQ) {
        // Revert search results data to its previous state
        utils.experiences.search.setInfiniteData(
          { q: pathQ },
          context?.previousData.search,
        );
      }

      toast({
        title: "Failed to attend experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unattendMutation = trpc.experiences.unattend.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: User[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: false,
          attendeesCount: Math.max(0, oldData.attendeesCount - 1),
          ...(oldData.attendees && {
            attendees: oldData.attendees.filter(
              (attendee) => attendee.id !== currentUser?.id,
            ),
          }),
        };
      }

      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        pathUserId
          ? utils.experiences.byUserId.cancel({ id: pathUserId })
          : Promise.resolve(),
        pathQ
          ? utils.experiences.search.cancel({ q: pathQ })
          : Promise.resolve(),
      ]);

      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search: pathQ
          ? utils.experiences.search.getInfiniteData({ q: pathQ })
          : undefined,
      };

      // Update the individual experience data to mark as attending
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      // Update the experience in the infinite feed list to mark as attending
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((experience) =>
              experience.id === id ? updateExperience(experience) : experience,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((experience) =>
                  experience.id === id
                    ? updateExperience(experience)
                    : experience,
                ),
              })),
            };
          },
        );
      }

      if (pathQ) {
        utils.experiences.search.setInfiniteData({ q: pathQ }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              experiences: page.experiences.map((experience) =>
                experience.id === id
                  ? updateExperience(experience)
                  : experience,
              ),
            })),
          };
        });
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Revert individual experience data to its previous state
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      // Revert feed data to its previous state
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      if (pathUserId) {
        // Revert user's experiences data to its previous state
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathQ) {
        // Revert search results data to its previous state
        utils.experiences.search.setInfiniteData(
          { q: pathQ },
          context?.previousData.search,
        );
      }

      toast({
        title: "Failed to unattended experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = trpc.experiences.favorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: true,
          favoritesCount: oldData.favoritesCount + 1,
        };
      }

      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.invalidate(),
        pathUserId
          ? utils.experiences.byUserId.invalidate({ id: pathUserId })
          : Promise.resolve(),
        pathQ
          ? utils.experiences.search.invalidate({ q: pathQ })
          : Promise.resolve(),
      ]);

      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search: pathQ
          ? utils.experiences.search.getInfiniteData({ q: pathQ })
          : undefined,
      };

      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((experience) =>
              experience.id === id ? updateExperience(experience) : experience,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((experience) =>
                  experience.id === id
                    ? updateExperience(experience)
                    : experience,
                ),
              })),
            };
          },
        );
      }

      if (pathQ) {
        utils.experiences.search.setInfiniteData({ q: pathQ }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              experiences: page.experiences.map((experience) =>
                experience.id === id
                  ? updateExperience(experience)
                  : experience,
              ),
            })),
          };
        });
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Revert individual experience data to its previous state
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      // Revert feed data to its previous state
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      if (pathUserId) {
        // Revert user's experiences data to its previous state
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathQ) {
        // Revert search results data to its previous state
        utils.experiences.search.setInfiniteData(
          { q: pathQ },
          context?.previousData.search,
        );
      }

      toast({
        title: "Failed to add to favorite this experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfavoriteMutation = trpc.experiences.unfavorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: true,
          favoritesCount: Math.max(0, oldData.favoritesCount - 1),
        };
      }

      await Promise.all([
        utils.experiences.favorites.cancel(),
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.invalidate(),
        pathUserId
          ? utils.experiences.byUserId.invalidate({ id: pathUserId })
          : Promise.resolve(),
        pathQ
          ? utils.experiences.search.invalidate({ q: pathQ })
          : Promise.resolve(),
      ]);

      const previousData = {
        favorites: utils.experiences.favorites.getInfiniteData(),
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search: pathQ
          ? utils.experiences.search.getInfiniteData({ q: pathQ })
          : undefined,
      };

      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((experience) =>
              experience.id === id ? updateExperience(experience) : experience,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((experience) =>
                  experience.id === id
                    ? updateExperience(experience)
                    : experience,
                ),
              })),
            };
          },
        );
      }

      if (pathQ) {
        utils.experiences.search.setInfiniteData({ q: pathQ }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              experiences: page.experiences.map((experience) =>
                experience.id === id
                  ? updateExperience(experience)
                  : experience,
              ),
            })),
          };
        });
      }

      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.filter(
              (experience) => experience.id !== id,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Revert individual experience data to its previous state
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      // Revert feed data to its previous state
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );

      if (pathUserId) {
        // Revert user's experiences data to its previous state
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathQ) {
        // Revert search results data to its previous state
        utils.experiences.search.setInfiniteData(
          { q: pathQ },
          context?.previousData.search,
        );
      }

      toast({
        title: "Failed  to unfavorite this experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    editMutation,
    deleteMutation,
    attendMutation,
    unattendMutation,
    favoriteMutation,
    unfavoriteMutation,
  };
}
