"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/builder", label: "Builder" },
  { href: "/assistants", label: "Assistants" },
  { href: "/prompt-engine", label: "Prompt Engine" },
  { href: "/marketing-engine", label: "Marketing Engine" },
  { href: "/docs", label: "Docs" },
] as const;

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        className="inline-flex items-center rounded border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 hover:border-white/50 hover:text-white"
        onClick={() => setIsOpen((open) => !open)}
      >
        Menu
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="absolute left-0 right-0 top-full border-b border-white/[0.08] bg-[#030405]/95 px-6 py-4 backdrop-blur"
        >
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm text-slate-300 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
