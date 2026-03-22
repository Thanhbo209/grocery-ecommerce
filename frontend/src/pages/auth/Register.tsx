import { RegisterForm } from "@/components/client/auth/register/RegisteForm";
import { RegisterHero } from "@/components/client/auth/register/RegisterHero";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen font-sans justify-center">
      {/* Left: hero panel — 55% on desktop */}
      <RegisterHero />

      {/* Right: form panel */}
      <div className="flex bg-card shadow-xl rounded-r-2xl lg:my-8 w-full items-center justify-center px-8 py-12 lg:w-[45%]">
        <RegisterForm />
      </div>
    </div>
  );
}
