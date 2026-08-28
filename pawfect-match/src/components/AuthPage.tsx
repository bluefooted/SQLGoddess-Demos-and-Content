import { useState } from 'react';

import { useAuth } from '@/hooks/AuthContext';

const msLogo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 21 21"
    className="mr-2"
  >
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

export function AuthPage() {
  const { signIn, fabricAuthEnabled } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = isLoading
    ? fabricAuthEnabled
      ? 'Opening Fabric...'
      : 'Signing in...'
    : 'Sign in with Microsoft';

  return (
    <div className="auth-shell min-h-screen grid lg:grid-cols-[1.15fr_.85fr] bg-[#f6f7ff]">
      <section className="auth-visual hidden lg:flex relative min-h-screen overflow-hidden bg-[#5146c8] text-white p-16 flex-col justify-between">
        <div className="absolute inset-0 opacity-45 bg-[url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#5146c8]/35 via-[#4038a4]/60 to-[#28266f]/95" />
        <div className="relative flex items-center gap-3 font-display text-xl"><span className="grid place-items-center size-10 rounded-lg bg-[#72e6b1] text-[#28266f]">P</span>Pawfect Match</div>
        <div className="relative max-w-xl"><p className="text-[#72e6b1] text-xs font-bold uppercase tracking-[.16em]">Better evidence. Happier homes.</p><h1 className="mt-4 font-display text-5xl leading-tight">Every pet deserves the right introduction.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-[#e3e7ff]">Lifestyle-aware discovery powered by shelter knowledge, trusted care notes, and Fabric SQL.</p></div>
      </section>
      <div className="flex items-center justify-center p-6">
        <div className="auth-card w-full max-w-sm rounded-lg bg-white border border-[#dfe1f5] p-8 shadow-[0_16px_45px_rgba(73,70,160,.12)]">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#0f9f77]">Shelter intelligence</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#28266f]">Welcome to Pawfect Match</h2>
              <p className="mt-2 text-sm leading-6 text-[#666987]">Sign in to discover adoptable pets and manage shelter profiles.</p>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-[#3578e5] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(53,120,229,.24)] transition-colors hover:bg-[#2867cf] disabled:opacity-50"
            >
              {msLogo}
              {buttonLabel}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-red-600">{error}</p>
            )}
        </div>
      </div>
    </div>
  );
}
