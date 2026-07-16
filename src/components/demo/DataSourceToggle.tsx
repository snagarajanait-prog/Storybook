import { useState } from "react"
import { createPortal } from "react-dom"
import { Database, Lock, Server, X } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { DATA_SOURCE_META, setDataSource } from "@/store/dataSourceSlice"

/**
 * The internal-only data-source switch. In production this would NOT be exposed
 * to end users — it's an internal team control to flip the AI between the live
 * C2M application and the synthetic Autonomous DB. Here it lives as a small,
 * clearly-labelled corner control so it's easy to demonstrate.
 *
 * `side` picks the free corner for the host page: the marketing page keeps the
 * left (its demo launcher owns the right), while the variant pages anchor it
 * right so it never covers their left-hand account panel.
 */
export function DataSourceToggle({ side = "left" }: { side?: "left" | "right" }) {
  const dispatch = useAppDispatch()
  const source = useAppSelector((s) => s.dataSource.source)
  // Start collapsed to a small corner pill: it stays visible and one click away,
  // but never covers page content (e.g. the account panel's usage chart).
  const [collapsed, setCollapsed] = useState(true)

  const isC2M = source === "C2M"
  const meta = DATA_SOURCE_META[source]
  // Both literals are present so Tailwind's JIT emits them.
  const anchor = side === "right" ? "right-4" : "left-4"

  // Portal to <body> with an explicit high z-index so the control always sits
  // above the demo dialog's overlay. Radix's modal layer sets pointer-events:none
  // on <body>, so we re-enable it here to stay clickable while the demo is open.
  const style = { zIndex: 2147483000, pointerEvents: "auto" as const }

  if (collapsed) {
    return createPortal(
      <button
        data-internal-toggle
        onClick={() => setCollapsed(false)}
        style={style}
        className={cn(
          "fixed bottom-4 flex items-center gap-2 rounded-full border border-slate-300 bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow-lg backdrop-blur transition-colors hover:bg-white",
          anchor
        )}
      >
        <Lock className="h-3.5 w-3.5" />
        Internal
        <Badge variant={isC2M ? "destructive" : "brand"} className="ml-0.5">
          {meta.short}
        </Badge>
      </button>,
      document.body
    )
  }

  return createPortal(
    <div
      data-internal-toggle
      style={style}
      className={cn(
        "fixed bottom-4 w-[290px] rounded-xl border border-slate-300 bg-white/95 p-3.5 shadow-xl backdrop-blur",
        anchor
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <Lock className="h-3 w-3" />
          Internal control
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Collapse"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-1 text-sm font-semibold text-brand-navy">AI data source</p>

      <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg transition-colors",
            isC2M ? "bg-brand-red/10 text-brand-red" : "bg-brand-cyan/10 text-brand-cyan"
          )}
        >
          {isC2M ? <Server className="h-5 w-5" /> : <Database className="h-5 w-5" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-brand-navy">
              {meta.label}
            </span>
            <Badge variant={isC2M ? "destructive" : "brand"}>{meta.short}</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{meta.system}</p>
        </div>

        <Switch
          checked={isC2M}
          onCheckedChange={(v) => dispatch(setDataSource(v ? "C2M" : "AUTONOMOUS"))}
          aria-label="Toggle data source"
        />
      </div>

      <p className="mt-2.5 text-[11px] leading-snug text-muted-foreground">{meta.description}</p>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Autonomous DB</span>
        <span>C2M (live)</span>
      </div>
    </div>,
    document.body
  )
}
