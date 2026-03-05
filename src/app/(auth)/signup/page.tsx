export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-300">
          For MVP, account creation is handled manually until signup API is added in the next step.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-slate-800 p-6">
        <p className="text-sm text-slate-300">
          You can already authenticate with Google or existing credentials.
        </p>
        <a className="block rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-black" href="/api/auth/signin/google">
          Continue with Google
        </a>
        <a className="block rounded-md border border-slate-700 px-4 py-2 text-center text-sm" href="/login">
          Back to sign in
        </a>
      </div>
    </main>
  );
}
