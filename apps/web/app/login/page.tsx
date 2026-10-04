import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
  
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-2xl font-bold font-mono mb-4 text-accent-cyan">Access Portal</h1>
        
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-border-gray mb-6 text-foreground"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-border-gray mb-6 text-foreground"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-accent-cyan text-black rounded-md px-4 py-2 text-foreground font-semibold hover:bg-cyan-400 transition-colors"
        >
          Sign In
        </button>
        
        <button
          formAction={signup}
          className="border border-border-gray rounded-md px-4 py-2 text-foreground mb-2 hover:border-accent-cyan transition-colors"
        >
          Sign Up
        </button>
        
        {error && (
          <p className="mt-4 p-4 bg-red-900/50 text-red-200 text-center rounded-md text-sm">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
