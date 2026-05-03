import { normalizeRuntimeManifest } from "./manifest-validator";
import { RuntimeSectionRenderer } from "./section-map";
import { resolveRuntimeStyle } from "./style-resolver";

export default function RuntimePreview({ manifest }: { manifest: unknown }) {
  const normalized = normalizeRuntimeManifest(manifest);

  if (!normalized.manifest) {
    return (
      <div className="border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
        Runtime could not render this manifest. {normalized.errors.join(" ")}
      </div>
    );
  }

  const runtimeManifest = normalized.manifest;
  const style = resolveRuntimeStyle(runtimeManifest);

  return (
    <div
      className="overflow-hidden border"
      style={{
        backgroundColor: style.background,
        color: style.text,
        borderColor: style.border,
        borderRadius: style.radius,
      }}
    >
      {runtimeManifest.sections.map((section, index) => (
        <RuntimeSectionRenderer
          key={`${section.id}-${index}`}
          manifest={runtimeManifest}
          section={section}
          style={style}
        />
      ))}
    </div>
  );
}
