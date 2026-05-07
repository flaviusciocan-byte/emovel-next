"use client";

import Link from "next/link";
import { useState } from "react";
import {
  signInWithEmail,
  signUpWithEmail,
} from "../../lib/auth/browser-auth";
import { useAuthSession } from "../../lib/auth/use-auth-session";

type AuthMode = "sign-in" | "sign-up";

function fieldClass() {
  return "w-full border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35";
}

export default function AuthClient() {
  const { authenticated, user, refresh, signOut } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sign in to save projects and continue later.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAuth() {
    if (!email.trim() || password.length < 6) {
      setStatus("Enter an email and a password with at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setStatus(mode === "sign-in" ? "Opening your workspace..." : "Creating your workspace...");

    try {
      const session =
        mode === "sign-in"
          ? await signInWithEmail(email.trim(), password)
          : await signUpWithEmail(email.trim(), password);

      if (!session.access_token) {
        setStatus("Check your email to confirm the account, then sign in.");
        return;
      }

      await refresh();
      window.location.href = "/onboarding/brand-profile";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    signOut();
    setStatus("Signed out. Builder can still run in local mode.");
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/40">
          EMOVEL Account
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Save your Builder workspace.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
          Email authentication connects the existing Builder to your personal workspace,
          projects, sections, drafts, and Brand Profile.
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        {authenticated ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Active Session
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{user?.email || "Account"}</h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/builder"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-white/85"
              >
                Open Builder
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:border-white/35"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 border border-white/10 bg-black/25 p-1">
              {(["sign-in", "sign-up"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`h-11 flex-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    mode === item ? "bg-white text-black" : "text-white/45 hover:text-white"
                  }`}
                >
                  {item === "sign-in" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className={fieldClass()}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  Password
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  className={fieldClass()}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={submitAuth}
              disabled={isSubmitting}
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
            >
              {isSubmitting ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
            </button>
          </>
        )}

        <p className="mt-5 text-sm leading-7 text-white/55">{status}</p>
      </div>
    </section>
  );
}
