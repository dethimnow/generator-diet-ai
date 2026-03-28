import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Suspense fallback={<p className="text-center text-muted">Ładowanie…</p>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
