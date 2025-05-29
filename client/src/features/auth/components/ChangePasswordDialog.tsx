import { z } from "zod";
import { changePasswordSchema } from "@advanced-react/shared/schema/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form.tsx";
import Input from "@/features/shared/components/ui/Input.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { trpc } from "@/router.tsx";
import { useState } from "react";
import { useToast } from "@/features/shared/hooks/useToast.ts";

type ChangeEmailFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordDialog() {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      form.reset();

      setIsOpen(false);

      toast({
        title: "Password changed successfully!",
        description: "Password changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    changePasswordMutation.mutate(data);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Update password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change pasword</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name={"currentPassword"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={"password"}
                      placeholder={"********"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={"newPassword"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={"password"}
                      placeholder={"********"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type={"submit"}
                className={"w-full"}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? "Loading..."
                  : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
