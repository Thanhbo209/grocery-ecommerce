import { LoginHero } from "@/components/client/auth/LoginHero";
import { LoginForm } from "@/components/client/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen font-sans justify-center">
      {/* Left: hero panel — 55% on desktop */}
      <LoginHero />

      {/* Right: form panel */}
      <div className="flex bg-card shadow-xl rounded-r-2xl lg:my-8 w-full items-center justify-center px-8 py-12 lg:w-[45%]">
        <LoginForm />
      </div>
    </div>
  );
}
