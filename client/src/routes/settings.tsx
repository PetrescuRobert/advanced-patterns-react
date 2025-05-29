import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { router, trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import Card from "@/features/shared/components/ui/Card.tsx";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";
import ChangeEmailDialog from "@/features/auth/components/ChangeEmailDialog.tsx";
import ChangePasswordDialog from "@/features/auth/components/ChangePasswordDialog.tsx";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }
  },
});

function SettingsPage() {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  const logOutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      router.navigate({ to: "/login" });

      toast({
        title: "Logged out successfully!",
        description: "See you soon!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const settings = [
    {
      label: currentUser?.email,
      component: <ChangeEmailDialog />,
    },
    {
      label: "Change password",
      component: <ChangePasswordDialog />,
    },
    {
      label: "Sign out of your account",
      component: (
        <Button
          variant={"destructive"}
          disabled={logOutMutation.isPending}
          onClick={() => logOutMutation.mutate()}
        >
          {logOutMutation.isPending ? "Logging out ..." : "Logout"}
        </Button>
      ),
    },
  ];

  return (
    <main className={"space-y-4"}>
      {settings.map((setting) => (
        <Card
          key={setting.label}
          className={"flex items-center justify-between rounded-lg"}
        >
          <span className={"text-neutral-600 dark:text-neutral-400"}>
            {setting.label}
          </span>
          {setting.component}
        </Card>
      ))}
    </main>
  );
}
