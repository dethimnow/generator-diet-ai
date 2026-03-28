import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Suspense fallback={<p className="text-center text-muted">Ładowanie…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
