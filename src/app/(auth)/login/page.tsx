"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage("Invalid email or password.");
      return;
    }

    router.push("/dashboard/catalog");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-300">Access your FitView dashboard.</p>
      </header>

      <form className="space-y-4 rounded-lg border border-slate-800 p-6" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="email">Email</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="password">Password</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        <button
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in with email"}
        </button>
      </form>

      <a className="rounded-md border border-slate-700 px-4 py-2 text-center text-sm" href="/api/auth/signin/google">
        Continue with Google
      </a>

      <p className="text-center text-sm text-slate-400">
        No account yet? <a className="underline" href="/signup">Create one</a>
      </p>
    </main>
  );
}
