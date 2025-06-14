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
import { CommentOptimistic } from "@/features/comments/types.ts";

type CommentCreateFormProps = {
  experience: Experience;
};

type CommentCreateFormData = z.infer<typeof commentValidationSchema>;

export default function CommentCreateForm({
  experience,
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
    onMutate: async ({ content, experienceId }) => {
      if (!currentUser) {
        return;
      }

      form.reset();

      await Promise.all([
        utils.comments.byExperienceId.cancel({ experienceId }),
        utils.experiences.byId.cancel({ id: experienceId }),
      ]);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({ experienceId }),
        experienceById: utils.experiences.byId.getData({ id: experienceId }),
      };

      const optimisticComment: CommentOptimistic = {
        id: Math.random(),
        __optimistic: true,
        content: content,
        experienceId,
        experience,
        userId: currentUser.id,
        user: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      utils.comments.byExperienceId.setData(
        { experienceId },
        // @ts-expect-error - TODO: Fix this when implementing liking comments
        (oldData) => {
          if (!oldData) {
            return;
          }
          return [optimisticComment, ...oldData];
        },
      );

      utils.experiences.byId.setData({ id: experienceId }, (oldData) => {
        if (!oldData) {
          return;
        }
        return {
          ...oldData,
          commentsCount: oldData.commentsCount + 1,
        };
      });
      const { dismiss } = toast({
        title: "Comment added",
        description: "Your comment has been added",
      });
      return { dismiss, previousData };
    },
    onSuccess: async ({ experienceId }) => {
      await utils.comments.byExperienceId.invalidate({ experienceId });
    },
    onError: (error, { experienceId }, context) => {
      context?.dismiss?.();

      utils.comments.byExperienceId.setData(
        { experienceId },
        context?.previousData.byExperienceId,
      );

      utils.experiences.byId.setData(
        { id: experienceId },
        context?.previousData.experienceById,
      );

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
      experienceId: experience.id,
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
