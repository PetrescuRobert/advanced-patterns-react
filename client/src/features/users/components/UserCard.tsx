import Card from "@/features/shared/components/ui/Card.tsx";
import Link from "@/features/shared/components/ui/Link.tsx";
import UserAvatar from "@/features/users/components/UserAvatar.tsx";
import { ReactNode } from "react";
import { UserWithUserContext } from "@/features/users/types.ts";

type UserCardProps = {
  user: UserWithUserContext;
  rightComponent?: (user: UserWithUserContext) => ReactNode;
};

export function UserCard({ user, rightComponent }: UserCardProps) {
  return (
    <Card className={"flex items-center justify-between"}>
      <Link to={"/users/$userId"} params={{ userId: user.id }}>
        <UserAvatar user={user} />
      </Link>
      {rightComponent && rightComponent(user)}
    </Card>
  );
}
