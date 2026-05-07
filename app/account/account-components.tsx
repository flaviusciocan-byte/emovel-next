"use client";

import Link from "next/link";
import { useAuthSession } from "../../lib/auth/use-auth-session";
import type { UserPlan } from "../../lib/emovel-ai/types";

export function PlanBadge({ plan }: { plan?: UserPlan | null }) {
  const session = useAuthSession();
  const visiblePlan = plan || session.plan;

  return (
    <span className="inline-flex h-8 items-center rounded-full border border-white/10 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
      {visiblePlan === "pro" ? "Pro" : "Free"}
    </span>
  );
}

export function LocalModeBanner({
  className = "",
  copy = "Local mode: sign in to save projects and continue later.",
}: {
  className?: string;
  copy?: string;
}) {
  const { authenticated } = useAuthSession();

  if (authenticated) {
    return null;
  }

  return (
    <div className={`border border-white/10 bg-black/25 p-5 text-sm leading-7 text-white/55 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>{copy}</p>
        <Link
          href="/auth"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-white/85"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export function UserMenu() {
  const { authenticated, loading, user, signOut } = useAuthSession();

  if (loading) {
    return (
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        Account
      </span>
    );
  }

  if (!authenticated) {
    return (
      <Link href="/auth" className="text-slate-400 hover:text-white">
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="max-w-[160px] truncate text-xs text-slate-400">
        {user?.email || "Account"}
      </span>
      <PlanBadge />
      <button
        type="button"
        onClick={signOut}
        className="text-slate-400 hover:text-white"
      >
        Logout
      </button>
    </div>
  );
}

export function AccountStatusBar({
  className = "",
}: {
  className?: string;
}) {
  const { authenticated, loading, workspace, onboardingStep } = useAuthSession();

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return <LocalModeBanner className={className} />;
  }

  return (
    <div className={`border border-white/10 bg-black/25 p-5 text-sm leading-7 text-white/55 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Connected to {workspace?.name || "Personal Workspace"}.
          {onboardingStep === "brand_profile"
            ? " Complete your Brand Profile to sharpen outputs."
            : ""}
        </p>
        <PlanBadge />
      </div>
    </div>
  );
}
