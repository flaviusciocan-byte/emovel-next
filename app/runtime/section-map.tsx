import type { RuntimeManifest, RuntimeSection, RuntimeStyleTokens } from "./types";

interface RuntimeSectionProps {
  manifest: RuntimeManifest;
  section: RuntimeSection;
  style: RuntimeStyleTokens;
}

function ComponentTag({
  component,
  style,
}: {
  component: RuntimeSection["components"][number];
  style: RuntimeStyleTokens;
}) {
  return (
    <span
      className="border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
      style={{ borderColor: style.border, color: style.muted }}
    >
      {component}
    </span>
  );
}

function ComponentPreview({ section, style }: { section: RuntimeSection; style: RuntimeStyleTokens }) {
  if (section.components.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {section.components.map((component) => (
        <ComponentTag key={component} component={component} style={style} />
      ))}
    </div>
  );
}

function SectionShell({
  manifest,
  section,
  style,
  children,
}: RuntimeSectionProps & { children?: React.ReactNode }) {
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
      <ComponentPreview section={section} style={style} />
      <p className="mt-5 max-w-2xl text-xs leading-6" style={{ color: style.muted }}>
        Audience: {manifest.targetAudience}
      </p>
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
        {manifest.templateName} / {manifest.pageType}
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
      <div className="mt-8 flex flex-wrap gap-3">
        <div
          className="inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ borderColor: style.accent, color: style.accent }}
        >
          {manifest.ctaSystem.primaryCtaLabel}
        </div>
        <div
          className="inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ borderColor: style.border, color: style.muted }}
        >
          {manifest.ctaSystem.secondaryCtaLabel}
        </div>
      </div>
      <ComponentPreview section={section} style={style} />
    </section>
  );
}

function ProblemSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 border p-4" style={{ borderColor: props.style.border }}>
        <p className="text-sm leading-7" style={{ color: props.style.muted }}>
          This section frames the commercial friction the page must resolve before the offer is introduced.
        </p>
      </div>
    </SectionShell>
  );
}

function MechanismSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <p className="mt-5 text-sm leading-7" style={{ color: props.style.muted }}>
        Method: connect positioning, audience, offer structure, and conversion logic into one controlled path.
      </p>
    </SectionShell>
  );
}

function OfferSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[props.manifest.offer.type, props.manifest.offer.deliverable, props.manifest.offer.format].map((item) => (
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

function BenefitsSection(props: RuntimeSectionProps) {
  return <FeatureGridSection {...props} />;
}

function FeatureGridSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[props.manifest.targetAudience, props.manifest.offer.deliverable, "Structured execution layer"].map((item) => (
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

function ProofSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 border p-4" style={{ borderColor: props.style.border }}>
        <p className="text-sm leading-7" style={{ color: props.style.muted }}>
          Proof should use real evidence, process credibility, examples, or verified testimonials only.
        </p>
      </div>
    </SectionShell>
  );
}

function PricingSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 border p-5" style={{ borderColor: props.style.border }}>
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: props.style.accent }}>
          {props.manifest.pricingLogic.pricingModel}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(props.manifest.pricingLogic.priceAnchors.length
            ? props.manifest.pricingLogic.priceAnchors
            : ["Pricing not configured"]).map((anchor) => (
            <div key={anchor} className="border p-3" style={{ borderColor: props.style.border }}>
              <p className="text-sm leading-6" style={{ color: props.style.muted }}>
                {anchor}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7" style={{ color: props.style.muted }}>
          {props.manifest.pricingLogic.justification}
        </p>
      </div>
    </SectionShell>
  );
}

function ComparisonSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {["Current path", "Controlled EMOVEL path"].map((label) => (
          <div key={label} className="border p-4" style={{ borderColor: props.style.border }}>
            <p className="text-sm font-semibold" style={{ color: props.style.text }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ProcessSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["01 / Define", "02 / Structure", "03 / Convert"].map((step) => (
          <div key={step} className="border p-4" style={{ borderColor: props.style.border }}>
            <p className="text-sm font-semibold" style={{ color: props.style.text }}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function FaqSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div className="mt-6 space-y-3">
        {["What is included?", "Who is this for?", "What happens next?"].map((question) => (
          <div key={question} className="border p-4" style={{ borderColor: props.style.border }}>
            <p className="text-sm font-semibold" style={{ color: props.style.text }}>
              {question}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function FinalCtaSection(props: RuntimeSectionProps) {
  return (
    <SectionShell {...props}>
      <div
        className="mt-7 inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ borderColor: props.style.accent, color: props.style.accent }}
      >
        {props.manifest.ctaSystem.primaryCtaLabel}
      </div>
    </SectionShell>
  );
}

function FooterSection(props: RuntimeSectionProps) {
  return (
    <section className="border-t px-6 py-8" style={{ borderColor: props.style.border }}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="text-sm font-semibold" style={{ color: props.style.text }}>
          {props.manifest.templateName}
        </p>
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: props.style.muted }}>
          {props.manifest.ctaSystem.secondaryCtaLabel}
        </p>
      </div>
      <ComponentPreview section={props.section} style={props.style} />
    </section>
  );
}

export function RuntimeSectionRenderer(props: RuntimeSectionProps) {
  const sectionMap = {
    hero: HeroSection,
    problem: ProblemSection,
    mechanism: MechanismSection,
    offer: OfferSection,
    benefits: BenefitsSection,
    features: FeatureGridSection,
    proof: ProofSection,
    pricing: PricingSection,
    comparison: ComparisonSection,
    process: ProcessSection,
    faq: FaqSection,
    finalCta: FinalCtaSection,
    footer: FooterSection,
  } satisfies Record<RuntimeSection["type"], (props: RuntimeSectionProps) => React.ReactNode>;
  const Component = sectionMap[props.section.type];

  return <Component {...props} />;
}
