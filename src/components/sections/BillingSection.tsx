import { AlertTriangle, CalendarRange, ClipboardList, Gauge, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/store/hooks"
import { openDemo } from "@/store/demoSlice"

const rows = [
  {
    icon: AlertTriangle,
    tag: "Exception detection",
    title: "High / low usage alerts",
    body: "Automatically flags accounts with usage outside expected thresholds and initiates investigation workflows.",
  },
  {
    icon: ShieldAlert,
    tag: "Threshold monitoring",
    title: "Max bill threshold",
    body: "Prevents billing errors by catching accounts that exceed maximum bill limits before statements go out.",
  },
  {
    icon: Gauge,
    tag: "Consumption watch",
    title: "3 consecutive zero reads",
    body: "Detects three straight zero-consumption reads and creates a service order for field verification.",
  },
  {
    icon: CalendarRange,
    tag: "Scheduling",
    title: "Read & bill schedule",
    body: "Creates and manages meter read and billing schedules, ensuring accounts are billed on time every cycle.",
  },
  {
    icon: ClipboardList,
    tag: "Field operations",
    title: "Service & work order status",
    body: "Tracks open orders and updates customers and dispatchers automatically as status changes.",
  },
]

export function BillingSection() {
  const dispatch = useAppDispatch()

  return (
    <section id="billing" className="border-b bg-white">
      <div className="container py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-cyan">
            Billing automation
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Catch billing exceptions before they become problems
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ACSE AI monitors your billing queue continuously, flags anomalies,
            and takes action — so nothing slips through.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl divide-y rounded-2xl border bg-white shadow-sm">
          {rows.map((r) => (
            <div
              key={r.title}
              className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-navy">
                <r.icon className="h-5 w-5 text-brand-cyan" />
              </span>
              <div className="sm:w-48 sm:shrink-0">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-cyan">
                  {r.tag}
                </p>
                <p className="mt-0.5 font-semibold text-brand-navy">{r.title}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        {/* CTA band */}
        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl brand-gradient-hero px-8 py-12 text-center">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to modernize your utility operations?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Join water utilities already using ACSE AI to reduce call volume,
            eliminate billing errors, and deliver faster service.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => dispatch(openDemo())}>
              Request a demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#contact">Talk to us</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
