import { Experience } from "@advanced-react/server/database/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form.tsx";
import { TextArea } from "@/features/shared/components/ui/TextArea.tsx";
import { trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser.ts";

type CommentCreateFormProps = {
  experienceId: Experience["id"];
};

type CommentCreateFormData = z.infer<typeof commentValidationSchema>;

export default function CommentCreateForm({
  experienceId,
}: CommentCreateFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { currentUser } = useCurrentUser();

  const form = useForm<CommentCreateFormData>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: "",
    },
  });

  const addCommentMutation = trpc.comments.add.useMutation({
    onSuccess: async ({ experienceId }) => {
      await Promise.all([
        utils.comments.byExperienceId.invalidate({ experienceId }),
        utils.experiences.feed.invalidate({}),
      ]);

      form.reset();

      toast({
        title: "Comment added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    addCommentMutation.mutate({
      content: data.content,
      experienceId,
    });
  });

  if (!currentUser) {
    return (
      <div className={"text-center text-neutral-500"}>
        Please log in to add a comment.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <TextArea {...field} placeholder={"Add a comment..."} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type={"submit"} disabled={addCommentMutation.isPending}>
          Add comment
        </Button>
      </form>
    </Form>
  );
}
