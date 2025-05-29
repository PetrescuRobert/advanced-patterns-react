import { trpc } from "@/router.tsx";

export function useCurrentUser() {
  const currentUserQuery = trpc.auth.currentUser.useQuery();

  return {
    accessToken: currentUserQuery.data?.accessToken,
    currentUser: currentUserQuery.data?.currentUser,
  };
}
