import Link from "next/link";

const builderLinks = [
  {
    label: "Builder Home",
    href: "/builder",
  },
  {
    label: "App Factory",
    href: "/builder/app-factory",
  },
  {
    label: "Brand Profile",
    href: "/onboarding/brand-profile",
  },
] as const;

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030405] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-black/45 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8a24a]">
            EMOVEL Builder
          </p>
          <nav className="mt-6 grid gap-2">
            {builderLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-white/10 bg-white/[0.025] px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:border-[#c8a24a]/60 hover:text-[#c8a24a]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
