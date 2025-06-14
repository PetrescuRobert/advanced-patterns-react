import { UserForList, UserWithUserContext } from "@/features/users/types.ts";
import Spinner from "@/features/shared/components/ui/Spinner.tsx";
import { UserCard } from "@/features/users/components/UserCard.tsx";
import { ReactNode } from "react";

type UserListProps = {
  users: UserForList[];
  isLoading?: boolean;
  rightComponent?: (user: UserWithUserContext) => ReactNode;
};

export function UserList({ users, isLoading, rightComponent }: UserListProps) {
  return (
    <div className={"flex flex-col gap-4"}>
      {users.map((user) => (
        <UserCard key={user.id} user={user} rightComponent={rightComponent} />
      ))}
      {isLoading && (
        <div className={"flex justify-center py-4"}>
          <Spinner />
        </div>
      )}
      {!isLoading && users.length === 0 && (
        <div className={"flex justify-center py-4"}>
          <p>No users found!</p>
        </div>
      )}
    </div>
  );
}
