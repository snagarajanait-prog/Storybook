import {
  ArrowLeftRight,
  BellRing,
  CloudOff,
  Droplets,
  FileText,
  Gauge,
  Power,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/store/hooks"
import { openDemo, playScenario } from "@/store/demoSlice"

interface UseCaseCard {
  icon: LucideIcon
  title: string
  body: string
  /** Optional scenario to jump straight into when clicked. */
  scenario?: string
}

const cards: UseCaseCard[] = [
  {
    icon: Power,
    title: "Start / Stop / Transfer service",
    body: "Customers initiate, end, or transfer service through any channel — fully automated.",
    scenario: "start-service",
  },
  {
    icon: ArrowLeftRight,
    title: "Payment extension & arrangement",
    body: "AI negotiates and logs payment plans based on account history and policy rules.",
    scenario: "payment-arrangement",
  },
  {
    icon: UserCog,
    title: "Account information updates",
    body: "Update phone numbers, add account holders, and correct mailing addresses instantly.",
    scenario: "update-contact",
  },
  {
    icon: CloudOff,
    title: "Outage inquiries",
    body: "Real-time outage status delivered to customers without agent escalation.",
    scenario: "report-outage",
  },
  {
    icon: Droplets,
    title: "Emergency leak & main break",
    body: "Captures and routes emergency reports for low/no water, leaks, and main breaks.",
    scenario: "report-leak",
  },
  {
    icon: TrendingUp,
    title: "High bill investigation",
    body: "AI reviews consumption history and creates field activities for meter anomalies.",
    scenario: "high-bill",
  },
  {
    icon: Gauge,
    title: "Meter read creation",
    body: "Automatically creates meter reads when accounts reach their billing window end.",
  },
  {
    icon: BellRing,
    title: "Autopay expiration outreach",
    body: "Proactively contacts customers when autopay is expiring to prevent interruption.",
  },
  {
    icon: FileText,
    title: "New service application",
    body: "Guides customers through new service applications and tracks submission status.",
  },
]

export function UseCasesSection() {
  const dispatch = useAppDispatch()

  const launch = (scenario?: string) => {
    dispatch(openDemo())
    if (scenario) dispatch(playScenario(scenario))
  }

  return (
    <section id="use-cases" className="border-b bg-slate-50/70">
      <div className="container py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-cyan">
            Customer service
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Everything your customers need — handled automatically
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From routine account updates to emergency reports, ACSE AI resolves
            requests end-to-end without putting customers on hold.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <button
              key={c.title}
              onClick={() => launch(c.scenario)}
              className="group flex flex-col rounded-xl border bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-cyan/40 hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-cyan/10 transition-colors group-hover:bg-brand-cyan/20">
                <c.icon className="h-5 w-5 text-brand-cyan" />
              </span>
              <h3 className="mt-4 font-semibold text-brand-navy">{c.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
              {c.scenario && (
                <span className="mt-3 text-sm font-medium text-brand-cyan opacity-0 transition-opacity group-hover:opacity-100">
                  Run this scenario →
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" onClick={() => launch()} className="gap-2">
            Try any of these with the assistant
          </Button>
        </div>
      </div>
    </section>
  )
}
