import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { experienceFiltersSchema } from "@advanced-react/shared/schema/experience";
import { trpc } from "@/router.tsx";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll.tsx";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList.tsx";
import { ExperienceFilters } from "@/features/experiences/components/ExperinceFilters.tsx";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: experienceFiltersSchema,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const experiencesQuery = trpc.experiences.search.useInfiniteQuery(search, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!search.q,
  });
  return (
    <main className={"space-y-4 pb-20"}>
      <ExperienceFilters
        onFiltersChange={(filters) => navigate({ search: filters })}
        initialFilters={search}
      />
      <InfiniteScroll
        onLoadMore={search.q ? experiencesQuery.fetchNextPage : undefined}
      >
        <ExperiencesList
          experiences={
            experiencesQuery.data?.pages.flatMap((page) => page.experiences) ??
            []
          }
          isLoading={
            experiencesQuery.isLoading || experiencesQuery.isFetchingNextPage
          }
          noExperiencesMessage={
            search.q ? "No results found" : "Search to find experiences"
          }
        />
      </InfiniteScroll>
    </main>
  );
}
