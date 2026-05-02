"use client";

import { useMemo, useState } from "react";
import { createDefaultBlock, createInitialPageConfig } from "./block-factory";
import type {
  BlockType,
  BuilderBlock,
  DomainConfig,
  LocalExportRecord,
  MobileConfig,
  PageConfig,
} from "./types";

const blockTypes: { type: BlockType; label: string }[] = [
  { type: "hero", label: "Hero" },
  { type: "features", label: "Features" },
  { type: "proof", label: "Proof" },
  { type: "pricing", label: "Pricing" },
  { type: "faq", label: "FAQ" },
  { type: "text", label: "Text" },
  { type: "cta", label: "CTA" },
  { type: "footer", label: "Footer" },
];

type Panel = "blocks" | "theme" | "domain" | "mobile" | "export";

function getString(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "string" ? data[key] : "";
}

function getStringArray(data: Record<string, unknown>, key: string) {
  return Array.isArray(data[key])
    ? (data[key] as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "emovel-build"
  );
}

function renderBlock(block: BuilderBlock, accentColor: string) {
  if (block.type === "hero") {
    return (
      <section className="px-8 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-white">
          {getString(block.data, "headline")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300">
          {getString(block.data, "subheadline")}
        </p>
        <button
          type="button"
          className="mt-8 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black"
          style={{ backgroundColor: accentColor }}
        >
          {getString(block.data, "cta")}
        </button>
      </section>
    );
  }

  if (block.type === "features") {
    return (
      <section className="px-8 py-14">
        <h2 className="text-center text-3xl font-semibold text-white">
          {getString(block.data, "headline")}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {getStringArray(block.data, "items").map((item) => (
            <div key={item} className="border border-white/10 bg-white/[0.03] p-5">
              <div
                className="mb-4 h-2 w-2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <p className="text-sm leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "proof") {
    return (
      <section className="border-y border-white/10 px-8 py-12">
        <div className="grid gap-5 text-center md:grid-cols-3">
          {getStringArray(block.data, "stats").map((stat) => (
            <p key={stat} className="text-sm uppercase tracking-[0.18em] text-slate-300">
              {stat}
            </p>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "pricing") {
    return (
      <section className="px-8 py-14">
        <h2 className="text-center text-3xl font-semibold text-white">
          {getString(block.data, "headline")}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {getStringArray(block.data, "tiers").map((tier, index) => (
            <div
              key={tier}
              className={`border p-5 ${
                index === 1 ? "border-white/25 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-lg font-semibold text-white">{tier}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Structured offer layer for controlled product execution.
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "faq") {
    return (
      <section className="px-8 py-14">
        <h2 className="text-center text-3xl font-semibold text-white">
          {getString(block.data, "headline")}
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {getStringArray(block.data, "items").map((item) => (
            <div key={item} className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "cta") {
    return (
      <section className="px-8 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-white">
          {getString(block.data, "headline")}
        </h2>
        <button
          type="button"
          className="mt-8 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black"
          style={{ backgroundColor: accentColor }}
        >
          {getString(block.data, "buttonText")}
        </button>
      </section>
    );
  }

  if (block.type === "footer") {
    return (
      <section className="border-t border-white/10 px-8 py-10 text-center">
        <p className="text-lg font-semibold text-white">{getString(block.data, "brand")}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
          {getString(block.data, "tagline")}
        </p>
      </section>
    );
  }

  return (
    <section className="px-8 py-12">
      <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300">
        {getString(block.data, "content")}
      </p>
    </section>
  );
}

function updateBlockData(
  config: PageConfig,
  blockId: string,
  key: string,
  value: string,
): PageConfig {
  return {
    ...config,
    blocks: config.blocks.map((block) =>
      block.id === blockId
        ? { ...block, data: { ...block.data, [key]: value } }
        : block,
    ),
  };
}

export default function BuilderClient() {
  const [config, setConfig] = useState<PageConfig>(() => createInitialPageConfig());
  const [selectedBlockId, setSelectedBlockId] = useState(config.blocks[0]?.id ?? "");
  const [panel, setPanel] = useState<Panel>("blocks");
  const [domain, setDomain] = useState<DomainConfig>({
    type: "subdomain",
    value: "emovel-system",
  });
  const [mobile, setMobile] = useState<MobileConfig>({
    appName: "EMOVEL System",
    packageId: "com.emovel.system",
    platforms: ["android", "ios"],
    version: "1.0.0",
  });
  const [localExport, setLocalExport] = useState<LocalExportRecord | null>(null);

  const selectedBlock = useMemo(
    () => config.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [config.blocks, selectedBlockId],
  );

  function addBlock(type: BlockType) {
    const block = createDefaultBlock(type);
    setConfig((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedBlockId(block.id);
    setPanel("blocks");
  }

  function removeBlock(blockId: string) {
    setConfig((current) => {
      const nextBlocks = current.blocks.filter((block) => block.id !== blockId);
      setSelectedBlockId(nextBlocks[0]?.id ?? "");
      return { ...current, blocks: nextBlocks };
    });
  }

  function moveBlock(blockId: string, direction: "up" | "down") {
    setConfig((current) => {
      const index = current.blocks.findIndex((block) => block.id === blockId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.blocks.length) {
        return current;
      }

      const nextBlocks = [...current.blocks];
      const [block] = nextBlocks.splice(index, 1);
      nextBlocks.splice(targetIndex, 0, block);
      return { ...current, blocks: nextBlocks };
    });
  }

  function updateSelectedData(key: string, value: string) {
    if (!selectedBlock) {
      return;
    }

    setConfig((current) => updateBlockData(current, selectedBlock.id, key, value));
  }

  function saveLocalExport() {
    const slug = slugify(domain.value);
    const record = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      previewPath: `/builder/local-export/${slug}`,
      blockCount: config.blocks.length,
    };

    window.localStorage.setItem("emovel.builder.localExport", JSON.stringify(record));
    setLocalExport(record);
  }

  return (
    <section id="start" className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            Builder Workspace
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Compose a controlled digital product page from structured blocks.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="grid grid-cols-2 gap-2">
              {(["blocks", "theme", "domain", "mobile", "export"] as Panel[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPanel(item)}
                  className={`border px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] ${
                    panel === item
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/[0.08] bg-black/20 text-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {panel === "blocks" ? (
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Page Blocks
                  </p>
                  <div className="space-y-2">
                    {config.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`border p-3 ${
                          selectedBlockId === block.id
                            ? "border-white/30 bg-white/[0.06]"
                            : "border-white/[0.08] bg-black/20"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedBlockId(block.id)}
                          className="w-full text-left text-sm font-medium capitalize text-white"
                        >
                          {block.type}
                        </button>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => moveBlock(block.id, "up")} className="text-xs text-slate-500">Up</button>
                          <button type="button" onClick={() => moveBlock(block.id, "down")} className="text-xs text-slate-500">Down</button>
                          <button type="button" onClick={() => removeBlock(block.id)} className="text-xs text-red-300">Remove</button>
                          <span className="ml-auto text-xs text-slate-600">{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Add Block
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {blockTypes.map((block) => (
                      <button
                        key={block.type}
                        type="button"
                        onClick={() => addBlock(block.type)}
                        className="border border-white/[0.08] bg-black/20 px-3 py-2 text-left text-xs text-slate-300 hover:border-white/25"
                      >
                        {block.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {panel === "theme" ? (
              <div className="mt-6 space-y-4">
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  Page Title
                  <input
                    value={config.title}
                    onChange={(event) => setConfig({ ...config, title: event.target.value })}
                    className="mt-2 w-full border border-white/[0.08] bg-black/30 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                  />
                </label>
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  Accent
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(event) => setConfig({ ...config, accentColor: event.target.value })}
                    className="mt-2 h-10 w-full border border-white/[0.08] bg-black/30"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["dark", "light"] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setConfig({ ...config, theme })}
                      className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                        config.theme === theme ? "border-white/30 text-white" : "border-white/[0.08] text-slate-500"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {panel === "domain" ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["subdomain", "custom"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDomain({ ...domain, type })}
                      className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                        domain.type === type ? "border-white/30 text-white" : "border-white/[0.08] text-slate-500"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  value={domain.value}
                  onChange={(event) => setDomain({ ...domain, value: event.target.value })}
                  placeholder={domain.type === "subdomain" ? "emovel-system" : "your-domain.com"}
                  className="w-full border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            ) : null}

            {panel === "mobile" ? (
              <div className="mt-6 space-y-4">
                <input
                  value={mobile.appName}
                  onChange={(event) => setMobile({ ...mobile, appName: event.target.value })}
                  className="w-full border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none"
                />
                <input
                  value={mobile.packageId}
                  onChange={(event) => setMobile({ ...mobile, packageId: event.target.value })}
                  className="w-full border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none"
                />
                <p className="text-xs leading-6 text-slate-500">
                  Platforms: {mobile.platforms.join(", ")}. Version {mobile.version}.
                </p>
              </div>
            ) : null}

            {panel === "export" ? (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={saveLocalExport}
                  className="h-12 w-full rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-black"
                >
                  Save Local Export
                </button>
                {localExport ? (
                  <div className="border border-white/[0.08] bg-black/25 p-3 text-sm leading-6 text-slate-300">
                    <p>{localExport.previewPath}</p>
                    <p className="text-xs text-slate-500">
                      Local export saved. {localExport.blockCount} blocks prepared.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>

          <main className="overflow-hidden border border-white/[0.08] bg-black">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Live Canvas
                </p>
                <h3 className="text-lg font-semibold text-white">{config.title}</h3>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {config.blocks.length} blocks
              </p>
            </div>
            <div
              className={config.theme === "light" ? "bg-slate-100 text-black" : "bg-black text-white"}
              style={{ fontFamily: config.font }}
            >
              {config.blocks.map((block) => (
                <div
                  key={block.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBlockId(block.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedBlockId(block.id);
                    }
                  }}
                  className={`block w-full text-left ${
                    selectedBlockId === block.id ? "ring-1 ring-white/30" : "hover:ring-1 hover:ring-white/10"
                  }`}
                >
                  {renderBlock(block, config.accentColor)}
                </div>
              ))}
            </div>
          </main>

          <aside className="border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Inspector
            </p>
            {selectedBlock ? (
              <div className="mt-5 space-y-4">
                <p className="text-lg font-semibold capitalize text-white">
                  {selectedBlock.type}
                </p>
                {Object.entries(selectedBlock.data).map(([key, value]) => (
                  <label
                    key={key}
                    className="block text-xs uppercase tracking-[0.18em] text-slate-500"
                  >
                    {key}
                    {Array.isArray(value) ? (
                      <textarea
                        value={value.filter((item) => typeof item === "string").join("\n")}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            blocks: current.blocks.map((block) =>
                              block.id === selectedBlock.id
                                ? {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      [key]: event.target.value.split("\n").filter(Boolean),
                                    },
                                  }
                                : block,
                            ),
                          }))
                        }
                        rows={4}
                        className="mt-2 w-full resize-none border border-white/[0.08] bg-black/30 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                      />
                    ) : (
                      <textarea
                        value={typeof value === "string" ? value : String(value)}
                        onChange={(event) => updateSelectedData(key, event.target.value)}
                        rows={key === "subheadline" || key === "content" ? 4 : 2}
                        className="mt-2 w-full resize-none border border-white/[0.08] bg-black/30 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Select a block to edit.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
