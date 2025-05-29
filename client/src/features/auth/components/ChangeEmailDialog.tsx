import { z } from "zod";
import { changeEmailSchema } from "@advanced-react/shared/schema/auth";
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

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export default function ChangeEmailDialog() {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const changeEmailMutation = trpc.auth.changeEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      form.reset();

      setIsOpen(false);

      toast({
        title: "Email changed successfully!",
        description: "Email changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to change email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    changeEmailMutation.mutate(data);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Update email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name={"email"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={"email"}
                      placeholder={"ex@example.com"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={"password"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
                disabled={changeEmailMutation.isPending}
              >
                {changeEmailMutation.isPending
                  ? "Changing email..."
                  : "Change email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
