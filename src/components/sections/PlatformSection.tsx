import { Headphones, PlugZap, ReceiptText, Wrench } from "lucide-react"

const pillars = [
  {
    icon: Headphones,
    title: "Customer service AI",
    body: "Resolves start/stop/transfer, account updates, and outage inquiries end-to-end across any channel.",
  },
  {
    icon: ReceiptText,
    title: "Billing automation",
    body: "Monitors the billing queue continuously, flags anomalies, and initiates exception workflows in real time.",
  },
  {
    icon: Wrench,
    title: "Field operations",
    body: "Creates and tracks meter reads, investigations, and service orders — and keeps customers updated.",
  },
  {
    icon: PlugZap,
    title: "Integrations",
    body: "Plugs into your existing C2M application and systems of record. Runs on Oracle Cloud Infrastructure.",
  },
]

const promises = [
  "Handles start, stop, and transfer of service without agent involvement",
  "Proactively contacts customers with expiring autopay before a disruption",
  "Automatically creates field activities for meter investigations and reads",
  "Monitors billing anomalies and flags exceptions in real time",
]

export function PlatformSection() {
  return (
    <section id="platform" className="border-b bg-white">
      <div className="container py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-cyan">
              What we do
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              One AI platform for your entire utility operation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ACSE AI integrates with your existing systems to automate inbound
              customer requests, billing exceptions, and field service orders —
              reducing manual effort across every department.
            </p>
            <ul className="mt-6 space-y-3">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border bg-slate-50/60 p-6 transition-colors hover:border-brand-cyan/40 hover:bg-white"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy">
                  <p.icon className="h-5 w-5 text-brand-cyan" />
                </span>
                <h3 className="mt-4 font-semibold text-brand-navy">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
