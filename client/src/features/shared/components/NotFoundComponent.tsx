import Card from "@/features/shared/components/ui/Card.tsx";
import { AlertCircle } from "lucide-react";

export function NotFoundComponent() {
  return (
    <Card className={"flex flex-col items-center justify-center gap-2"}>
      <AlertCircle className={"h-8 w-8"} />
      <p>Page not found!</p>
    </Card>
  );
}
