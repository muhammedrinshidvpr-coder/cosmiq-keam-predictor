"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Predictor", href: "#predictor" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ paddingInline: "clamp(1rem, 4vw, 2rem)" }}>
      <div className="mx-auto max-w-7xl">
        <div
          className="w-full h-16 flex items-center justify-between px-6 rounded-full mt-4 border"
          style={{
            background: "rgba(2,8,23,0.7)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Link href="/" className="flex items-center gap-3 text-white no-underline" onClick={() => setMobileOpen(false)}>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black text-sm text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #e11d48)", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}
            >
              IQ
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold tracking-tight">CosmIQ</span>
              <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">KEAM Predictor</span>
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 no-underline transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="#predictor"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-950 no-underline shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-orange-500" />
              Try Now
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl sm:hidden">
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 no-underline transition hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="#predictor"
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-white no-underline shadow-lg"
                style={{ background: "linear-gradient(135deg, #f97316, #e11d48)", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
                onClick={() => setMobileOpen(false)}
              >
                <Sparkles className="h-4 w-4" />
                Start Predicting
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
