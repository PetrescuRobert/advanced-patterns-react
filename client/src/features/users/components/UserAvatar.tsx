import { User } from "@advanced-react/server/database/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/features/shared/components/ui/Avatar.tsx";
import { cn } from "@/lib/utils/cn.ts";

type UserAvatarProps = {
  user: User;
  showName?: boolean;
  nameClassName?: string;
  className?: string;
};

export default function UserAvatar({
  user,
  nameClassName,
  showName = true,
  className,
}: UserAvatarProps) {
  return (
    <div className={cn("flex items-center gap-2")}>
      <Avatar className={className}>
        <AvatarImage src={user.avatarUrl ?? undefined} />
        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      {showName && (
        <span
          className={cn(
            "text-neutral-600 dark:text-neutral-400",
            nameClassName,
          )}
        >
          {user.name}
        </span>
      )}
    </div>
  );
}
