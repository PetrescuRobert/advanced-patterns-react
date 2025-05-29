import { z } from "zod";
import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { router, trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";

const loginCredentialSchema = userCredentialsSchema.omit({
  name: true,
});

type LoginFormData = z.infer<typeof loginCredentialSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginCredentialSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async ({ user }) => {
      await utils.auth.currentUser.invalidate();

      router.navigate({ to: "/" });

      toast({
        title: "Logged in successfully!",
        description: `Welcome back, ${user.name}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return (
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
                  placeholder={"dev@example.com"}
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
                <Input {...field} type={"password"} placeholder={"*******"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type={"submit"}
          className={"w-full"}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
