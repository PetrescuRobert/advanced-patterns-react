import {
  ExperienceFilterParams,
  experienceFiltersSchema,
} from "@advanced-react/shared/schema/experience";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form.tsx";
import Card from "@/features/shared/components/ui/Card.tsx";
import Input from "@/features/shared/components/ui/Input.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { Search } from "lucide-react";

type ExperienceFiltersProps = {
  onFiltersChange: (filters: ExperienceFilterParams) => void;
  initialFilters?: ExperienceFilterParams;
};

export function ExperienceFilters({
  onFiltersChange,
  initialFilters,
}: ExperienceFiltersProps) {
  const form = useForm<ExperienceFilterParams>({
    resolver: zodResolver(experienceFiltersSchema),
    defaultValues: initialFilters,
  });
  const handleSubmit = form.handleSubmit((data) => {
    const filters: ExperienceFilterParams = {};

    if (data.q?.trim()) {
      filters.q = data.q.trim();
    }

    onFiltersChange(filters);
  });
  return (
    <Form {...form}>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name={"q"}
            render={({ field }) => (
              <FormItem className={"flex-1"}>
                <FormControl>
                  <Input
                    {...field}
                    type={"search"}
                    value={field.value ?? ""}
                    placeholder={"Search experiences..."}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={"submit"} disabled={form.formState.isSubmitting}>
            <Search className={"h-4 w-4"} />
            Search
          </Button>
        </form>
      </Card>
    </Form>
  );
}
