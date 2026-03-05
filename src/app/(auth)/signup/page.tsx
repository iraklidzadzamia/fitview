"use client";

import { FormEvent, useState } from "react";

type SignupResponse =
  | {
      data: {
        id: string;
        email: string;
      };
    }
  | {
      error: string;
    };

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const body = (await response.json()) as SignupResponse;

      if (!response.ok || "error" in body) {
        setErrorMessage("error" in body ? body.error : "Unable to create account");
        return;
      }

      setSuccessMessage("Account created. You can now sign in.");
      setPassword("");
    } catch {
      setErrorMessage("Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-300">Use email/password or continue with Google.</p>
      </header>

      <form className="space-y-4 rounded-lg border border-slate-800 p-6" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="name">
            Name
          </label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            id="password"
            name="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}

        <button
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <a className="rounded-md border border-slate-700 px-4 py-2 text-center text-sm" href="/api/auth/signin/google">
        Continue with Google
      </a>

      <p className="text-center text-sm text-slate-400">
        Already have an account? <a className="underline" href="/login">Sign in</a>
      </p>
    </main>
  );
}
