import { useMemo, useState } from "react"
import { ChevronRight, Search, User } from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { customers } from "@/data/customers"
import { useAccessGate } from "@/components/demo/useAccessGate"
import { setChatContext } from "@/store/demoSlice"

type Tone = "light" | "dark"

/**
 * The "list of values" — the core concept of the demo: before any chat, the
 * visitor picks a synthetic customer/account, which sets the chatbot context.
 * Theme-aware so it fronts both the dark Copilot page and the light Concierge
 * page.
 */
export function CustomerList({ tone = "light" }: { tone?: Tone }) {
  const { pick } = useAccessGate(setChatContext)
  const [query, setQuery] = useState("")
  const dark = tone === "dark"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.accounts.some((a) => a.id.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 md:px-6">
      <div className="shrink-0 pb-4 pt-8">
        <h2 className={cn("text-xl font-semibold", dark ? "text-slate-100" : "text-brand-navy")}>
          Select a customer
        </h2>
        <p className={cn("mt-1 text-sm", dark ? "text-slate-400" : "text-slate-600")}>
          Pick an account to set the assistant's context. These are non-production customer
          records — several have multiple accounts.
        </p>
        <div className="relative mt-4">
          <Search
            className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
              dark ? "text-slate-500" : "text-slate-400"
            )}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search customers"
            placeholder="Search by name, customer no. or account no."
            className={cn(
              "h-11 w-full rounded-xl pl-9 pr-3 text-sm outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-brand-cyan",
              dark
                ? "bg-white/[0.04] text-slate-100 ring-white/10 placeholder:text-slate-500"
                : "bg-white text-brand-navy ring-slate-200 placeholder:text-slate-500"
            )}
          />
        </div>
      </div>

      <div className="scrollbar-slim min-h-0 flex-1 space-y-3 overflow-y-auto pb-8">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={cn(
              "overflow-hidden rounded-2xl ring-1",
              dark ? "bg-white/[0.03] ring-white/10" : "bg-white shadow-sm ring-slate-100"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3",
                dark ? "border-white/[0.06]" : "border-slate-100"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full",
                  dark ? "bg-brand-cyan/15 text-brand-cyan" : "bg-brand-navy/5 text-brand-navy"
                )}
              >
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate font-semibold", dark ? "text-slate-100" : "text-brand-navy")}>
                  {c.name}
                </p>
                <p className={cn("text-xs", dark ? "text-slate-400" : "text-slate-500")}>
                  {c.id} · since {c.since}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
                )}
              >
                {c.accounts.length} account{c.accounts.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className={cn("divide-y", dark ? "divide-white/[0.06]" : "divide-slate-100")}>
              {c.accounts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => pick(c.id, a.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-cyan",
                    dark ? "hover:bg-white/[0.05]" : "hover:bg-brand-cyan/5"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                      dark ? "bg-brand-cyan/10 text-brand-cyan" : "bg-brand-cyan/10 text-brand-cyan"
                    )}
                  >
                    {a.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", dark ? "text-slate-100" : "text-slate-800")}>
                      {a.id}
                    </p>
                    <p className={cn("truncate text-xs", dark ? "text-slate-400" : "text-slate-500")}>
                      {a.serviceAddress}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        a.balance > 0
                          ? dark
                            ? "text-slate-100"
                            : "text-brand-navy"
                          : dark
                            ? "text-emerald-400"
                            : "text-emerald-700"
                      )}
                    >
                      {a.balance > 0 ? formatCurrency(a.balance) : "$0.00"}
                    </p>
                    <p className={cn("text-[10px]", dark ? "text-slate-400" : "text-slate-500")}>
                      {a.balance > 0 ? "due" : "settled"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      a.status === "Active" &&
                        (dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"),
                      a.status === "Pending" &&
                        (dark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"),
                      a.status === "Final" && (dark ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-600")
                    )}
                  >
                    {a.status}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                      dark ? "text-slate-600 group-hover:text-brand-cyan" : "text-slate-300 group-hover:text-brand-cyan"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className={cn("py-10 text-center text-sm", dark ? "text-slate-400" : "text-slate-500")}>
            No customers match "{query}".
          </p>
        )}
      </div>
    </div>
  )
}
