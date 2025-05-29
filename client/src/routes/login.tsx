import { createFileRoute } from "@tanstack/react-router";
import Card from "@/features/shared/components/ui/Card.tsx";
import { LoginForm } from "@/features/auth/components/LoginForm.tsx";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main>
      <Card>
        <LoginForm />
      </Card>
    </main>
  );
}
