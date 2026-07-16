import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { customers, findCustomer } from "@/data/customers"
import { setChatContext } from "@/store/demoSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

type Tone = "light" | "dark"

/**
 * A compact, theme-aware customer/account picker used in the header of the
 * standalone variant pages. It swaps the chatbot context (customer + account)
 * without leaving the design. Self-contained (no Radix Select) so it themes
 * cleanly against both the dark Copilot page and the light Concierge page.
 */
export function CustomerSwitcher({ tone = "light" }: { tone?: Tone }) {
  const dispatch = useAppDispatch()
  const { selectedCustomerId, selectedAccountId } = useAppSelector((s) => s.demo)
  const customer = findCustomer(selectedCustomerId)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const dark = tone === "dark"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          dark
            ? "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300"
        )}
      >
        <span
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full",
            dark ? "bg-brand-cyan/20 text-brand-cyan" : "bg-brand-navy/5 text-brand-navy"
          )}
        >
          <User className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[9rem] truncate">{customer?.name ?? "Select customer"}</span>
        <ChevronsUpDown className={cn("h-3.5 w-3.5", dark ? "text-white/50" : "text-slate-400")} />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 z-50 mt-2 max-h-[60vh] w-72 overflow-y-auto scrollbar-slim rounded-xl border p-1.5 shadow-xl",
            dark
              ? "border-white/10 bg-brand-navydeep/95 backdrop-blur"
              : "border-slate-200 bg-white"
          )}
        >
          {customers.map((c) => (
            <div key={c.id} className="mb-1 last:mb-0">
              <p
                className={cn(
                  "px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide",
                  dark ? "text-white/40" : "text-slate-400"
                )}
              >
                {c.name}
              </p>
              {c.accounts.map((a) => {
                const active = a.id === selectedAccountId
                return (
                  <button
                    key={a.id}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      dispatch(setChatContext({ customerId: c.id, accountId: a.id }))
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      dark
                        ? "text-white/80 hover:bg-white/10"
                        : "text-slate-700 hover:bg-slate-100",
                      active && (dark ? "bg-white/10" : "bg-slate-100")
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        dark ? "bg-white/10 text-brand-cyan" : "bg-brand-cyan/10 text-brand-cyan"
                      )}
                    >
                      {a.type}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{a.id}</span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
