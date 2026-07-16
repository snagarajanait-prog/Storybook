import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type Tone = "light" | "dark"

/**
 * A theme-aware slide-over used for the account panel on smaller viewports.
 * When closed it is `invisible` (not just translated off-screen), so its
 * controls leave the tab order and accessibility tree — closed panels never
 * trap keyboard focus. `onClose` should be a stable callback (useCallback).
 */
export function SlideOver({
  open,
  onClose,
  side = "left",
  tone = "light",
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  side?: "left" | "right"
  tone?: Tone
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const dark = tone === "dark"
  const closedTranslate = side === "left" ? "-translate-x-full" : "translate-x-full"

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          dark ? "bg-black/40" : "bg-brand-navy/20",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-label={title}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 z-40 flex w-[340px] max-w-[88vw] flex-col shadow-2xl transition-transform duration-300",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          dark ? "border-white/10 bg-brand-navy/95 backdrop-blur-2xl" : "border-slate-200 bg-white",
          open ? "translate-x-0" : cn(closedTranslate, "invisible pointer-events-none")
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-3",
            dark ? "border-white/10" : "border-slate-200"
          )}
        >
          <p className={cn("text-sm font-semibold", dark ? "text-slate-100" : "text-brand-navy")}>
            {title}
          </p>
          <button
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()}`}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan",
              dark ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </aside>
    </>
  )
}
