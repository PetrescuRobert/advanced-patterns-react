import Card from "@/features/shared/components/ui/Card.tsx";
import Link from "@/features/shared/components/ui/Link.tsx";
import UserAvatar from "@/features/users/components/UserAvatar.tsx";
import { User } from "@advanced-react/server/database/schema";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className={"flex items-center justify-between"}>
      <Link to={"/users/$userId"} params={{ userId: user.id }}>
        <UserAvatar user={user} />
      </Link>
    </Card>
  );
}
