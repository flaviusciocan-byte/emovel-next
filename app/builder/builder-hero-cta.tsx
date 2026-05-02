"use client";

export default function BuilderHeroCta({ label }: { label: string }) {
  function handleClick() {
    document
      .getElementById("builder-workspace")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-white/40 hover:bg-white hover:text-black"
    >
      {label}
    </button>
  );
}
