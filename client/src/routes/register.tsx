import { createFileRoute } from "@tanstack/react-router";
import Card from "@/features/shared/components/ui/Card.tsx";
import { RegisterForm } from "@/features/auth/components/RegisterForm.tsx";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <main>
      <Card>
        <RegisterForm />
      </Card>
    </main>
  );
}
