import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

type Tone = "light" | "dark"

/** The three chatbot design approaches, one per route. */
export const VARIANTS = [
  { to: "/", label: "v1", hint: "Messenger" },
  { to: "/v1", label: "v2", hint: "Immersive" },
  { to: "/v2", label: "v3", hint: "Voice" },
] as const

/**
 * Segmented control to hop between the three chatbot design approaches. Inline
 * by default (embed in a page header); `floating` wraps it in a fixed,
 * bottom-centre pill for the marketing page, which has empty space there.
 */
export function VariantSwitcher({
  tone = "light",
  floating = false,
}: {
  tone?: Tone
  floating?: boolean
}) {
  const { pathname } = useLocation()
  const dark = tone === "dark"

  const control = (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-1",
        dark
          ? "border-white/15 bg-white/5 backdrop-blur"
          : "border-slate-200 bg-white/90 shadow-sm backdrop-blur"
      )}
      role="tablist"
      aria-label="Chatbot design"
    >
      {VARIANTS.map((v) => {
        const active = pathname === v.to
        return (
          <Link
            key={v.to}
            to={v.to}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-brand-cyan text-white shadow-sm"
                : dark
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
            )}
            title={v.hint}
          >
            {v.label}
          </Link>
        )
      })}
    </div>
  )

  if (!floating) return control

  return (
    <div className="fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-lg backdrop-blur">
        <span className="pl-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Chatbot design
        </span>
        {control}
      </div>
    </div>
  )
}
