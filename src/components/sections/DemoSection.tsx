import { Bot, ListChecks, MousePointerClick, ShieldCheck, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/store/hooks"
import { openDemo } from "@/store/demoSlice"

const steps = [
  {
    n: 1,
    icon: ListChecks,
    title: "Select an account",
    body: "Pick from a list of predefined demo customers — no login required.",
  },
  {
    n: 2,
    icon: ShieldCheck,
    title: "Verify",
    body: "The assistant confirms identity by SMS or email, just like production.",
  },
  {
    n: 3,
    icon: MousePointerClick,
    title: "Choose a request",
    body: "Tap a use case or type in your own words to start the conversation.",
  },
  {
    n: 4,
    icon: Wand2,
    title: "AI resolves it",
    body: "Watch the request run start to finish against demo data.",
  },
]

export function DemoSection() {
  const dispatch = useAppDispatch()

  return (
    <section id="ai-demo" className="border-b bg-slate-50/70">
      <div className="container py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-cyan">
            Try it yourself
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Experience ACSE AI firsthand
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Pick a demo account, tell the AI what you need, and watch it resolve
            the request end-to-end — exactly like your customers would.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-cyan/10">
                  <s.icon className="h-5 w-5 text-brand-cyan" />
                </span>
                <span className="text-2xl font-bold text-slate-200">{s.n}</span>
              </div>
              <h3 className="mt-4 font-semibold text-brand-navy">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <Button size="lg" onClick={() => dispatch(openDemo())} className="gap-2">
            <Bot className="h-5 w-5" />
            Launch the interactive demo
          </Button>
          <p className="text-xs text-muted-foreground">
            No sign-up · all data is synthetic · runs in your browser
          </p>
        </div>
      </div>
    </section>
  )
}
