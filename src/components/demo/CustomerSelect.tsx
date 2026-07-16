import { useMemo, useState } from "react"
import { ChevronRight, Search, User } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { customers } from "@/data/customers"
import { useAccessGate } from "@/components/demo/useAccessGate"
import { selectCustomer } from "@/store/demoSlice"

const typeColor: Record<string, string> = {
  Water: "text-sky-600 bg-sky-50",
  Electric: "text-amber-600 bg-amber-50",
  Gas: "text-orange-600 bg-orange-50",
}

export function CustomerSelect() {
  const { pick } = useAccessGate(selectCustomer)
  const [query, setQuery] = useState("")

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
    <div className="flex h-full flex-col">
      <div className="border-b bg-white px-5 py-4">
        <h3 className="text-lg font-semibold text-brand-navy">Select a customer</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pick an account to set the assistant's context. These are
          non-production customer records — several have multiple accounts.
        </p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, customer no. or account no."
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="scrollbar-slim flex-1 bg-slate-50/60">
        <div className="space-y-3 p-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-navy/5 text-brand-navy">
                  <User className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-navy">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.id} · Customer since {c.since}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {c.accounts.length} account{c.accounts.length > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="divide-y">
                {c.accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => pick(c.id, a.id)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-cyan/5"
                  >
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-medium",
                        typeColor[a.type] ?? "bg-slate-100 text-slate-600"
                      )}
                    >
                      {a.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{a.id}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.serviceAddress}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        a.status === "Active" && "bg-emerald-50 text-emerald-600",
                        a.status === "Pending" && "bg-amber-50 text-amber-600",
                        a.status === "Final" && "bg-slate-100 text-slate-500"
                      )}
                    >
                      {a.status}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-cyan" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No customers match "{query}".
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
