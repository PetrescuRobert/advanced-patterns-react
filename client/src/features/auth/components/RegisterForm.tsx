import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";
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
import { useToast } from "@/features/shared/hooks/useToast.ts";
import { router, trpc } from "@/router.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "@/features/shared/components/ui/Link.tsx";

const registerCredentialSchema = userCredentialsSchema;

type RegisterFormData = z.infer<typeof registerCredentialSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerCredentialSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      router.navigate({ to: "/" });

      toast({
        title: "Registered in successfully!",
        description: "Registered in successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to register",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          name={"name"}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder={"John Doe"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Logging in..." : "Register"}
        </Button>
        <div className={"flex justify-center"}>
          <Link to={"/login"} variant={"ghost"}>
            Already have an account? Login here
          </Link>
        </div>
      </form>
    </Form>
  );
}
