import type { RuntimeManifest, RuntimeSection, RuntimeStyleTokens } from "./types";

interface RuntimeSectionProps {
  manifest: RuntimeManifest;
  section: RuntimeSection;
  style: RuntimeStyleTokens;
}

function SectionShell({ section, style, children }: RuntimeSectionProps & { children?: React.ReactNode }) {
  return (
    <section className="border-t px-6 py-8" style={{ borderColor: style.border }}>
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.22em]"
        style={{ color: style.accent }}
      >
        {section.type}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: style.text }}>
        {section.title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: style.muted }}>
        {section.objective}
      </p>
      {children}
    </section>
  );
}

function HeroSection({ manifest, section, style }: RuntimeSectionProps) {
  return (
    <section className="px-6 py-12" style={{ backgroundColor: style.surface }}>
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
        style={{ color: style.accent }}
      >
        {manifest.templateName}
      </p>
      <h2
        className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight"
        style={{ color: style.text }}
      >
        {section.title}
      </h2>
      <p className="mt-5 max-w-2xl text-sm leading-7" style={{ color: style.muted }}>
        {manifest.positioning}
      </p>
      <div
        className="mt-8 inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ borderColor: style.accent, color: style.accent }}
      >
        Preview CTA
      </div>
    </section>
  );
}

function MechanismSection(props: RuntimeSectionProps) {
  return <SectionShell {...props} />;
}

function ProofSection(props: RuntimeSectionProps) {
  return <SectionShell {...props} />;
}

function FeaturesSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {(props.section.content?.length ? props.section.content : [
          props.manifest.targetAudience,
          props.manifest.offer,
          "Structured execution layer",
        ]).map((item) => (
          <div key={item} className="border p-4" style={{ borderColor: props.style.border }}>
            <p className="text-sm leading-6" style={{ color: props.style.muted }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function CtaSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div
        className="mt-7 inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ borderColor: props.style.accent, color: props.style.accent }}
      >
        Enter The System
      </div>
    </SectionShell>
  );
}

function FaqSection(props: RuntimeSectionProps) {
  return <SectionShell {...props} />;
}

function GenericSection(props: RuntimeSectionProps) {
  return <SectionShell {...props} />;
}

export function RuntimeSectionRenderer(props: RuntimeSectionProps) {
  const sectionMap = {
    hero: HeroSection,
    mechanism: MechanismSection,
    proof: ProofSection,
    features: FeaturesSection,
    cta: CtaSection,
    faq: FaqSection,
  } satisfies Record<RuntimeSection["type"], (props: RuntimeSectionProps) => React.ReactNode>;
  const Component = sectionMap[props.section.type] ?? GenericSection;

  return <Component {...props} />;
}
