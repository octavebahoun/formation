import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left: editorial cover */}
      <section className="relative bg-[var(--deep)] text-[var(--paper)] px-8 py-12 lg:px-16 lg:py-20 flex flex-col justify-between overflow-hidden grain">
        <div className="relative z-10">
          <div
            className="eyebrow"
            style={{ color: "var(--gold-soft)" }}
          >
            Carnet de formation · 2026
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-semibold leading-[1.05] mt-6 max-w-[14ch]">
            Développement web, IA &amp; automatisation.
          </h1>
          <p className="mt-8 text-[15px] leading-relaxed text-[color:#C8D0C9] max-w-[42ch]">
            Un parcours en trois mouvements, pensé pour la santé publique et
            la surveillance épidémiologique. Théorie brève, exemple juste
            après, exercice pour ancrer.
          </p>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <div className="grid grid-cols-3 gap-6 max-w-md">
            <ProgramTick n="I" label="Développement web" />
            <ProgramTick n="II" label="Intelligence artificielle" />
            <ProgramTick n="III" label="Automatisation" />
          </div>
          <div className="mt-10 flex items-baseline gap-3 text-xs text-[color:#8FA298]">
            <span>Formation animée par</span>
            <span className="font-display text-base text-[color:#EDEFEA]">
              Octave Bahoun
            </span>
          </div>
        </div>

        {/* decorative gold rule */}
        <div
          aria-hidden
          className="absolute top-1/2 -right-8 w-16 h-[2px]"
          style={{ background: "var(--gold)" }}
        />
      </section>

      {/* Right: form */}
      <section className="flex items-center justify-center px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="eyebrow">Accès personnel</div>
          <h2 className="font-display text-3xl font-semibold text-[var(--deep)] mt-3">
            Se connecter
          </h2>
          <p className="text-sm text-[var(--muted)] mt-2 mb-10">
            Deux comptes uniquement : le formateur et l&apos;apprenant.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

function ProgramTick({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div
        className="font-display text-xl"
        style={{ color: "var(--gold-soft)" }}
      >
        {n}
      </div>
      <div className="text-[12.5px] leading-tight text-[color:#C8D0C9] mt-1">
        {label}
      </div>
    </div>
  );
}
