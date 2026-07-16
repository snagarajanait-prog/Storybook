import { ArrowRight, Bot, CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/store/hooks"
import { openDemo } from "@/store/demoSlice"

const bullets = [
  "Start, stop & transfer service",
  "Billing exception handling",
  "Field activity automation",
]

export function Hero() {
  const dispatch = useAppDispatch()

  return (
    <section id="top" className="brand-gradient-hero relative overflow-hidden">
      <div className="brand-dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* Left: copy */}
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-medium text-brand-cyan">
            <Sparkles className="h-3.5 w-3.5" />
            AI for water & utility operations
          </span>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Automate your{" "}
            <span className="text-brand-cyan">utility customer service</span> —
            end to end.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            ACSE AI resolves inbound requests, catches billing exceptions, and
            creates field activities across your entire operation — without
            putting customers on hold or agents in the loop.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => dispatch(openDemo())} className="gap-2">
              <Bot className="h-5 w-5" />
              Try the assistant
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="gap-2 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#platform">
                See the platform
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: chat preview mock */}
        <div className="animate-fade-in [animation-delay:120ms]">
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="rounded-xl bg-white p-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-cyan/15">
                  <Bot className="h-4 w-4 text-brand-cyan" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-navy">ACSE Assistant</p>
                  <p className="text-[11px] text-emerald-600">● Online</p>
                </div>
              </div>
              <div className="space-y-3 py-4">
                <Bubble side="ai">
                  Good afternoon, Robert. How can I help with account WTR-47829301?
                </Bubble>
                <Bubble side="user">Why is my bill so high this month?</Bubble>
                <Bubble side="ai">
                  Your last two cycles are up ~62% from baseline — likely a leak.
                  I can open a meter investigation. Schedule it?
                </Bubble>
              </div>
              <div className="flex gap-1.5">
                {["Start service", "Payment plan", "Report leak"].map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bubble({ side, children }: { side: "ai" | "user"; children: React.ReactNode }) {
  const isAI = side === "ai"
  return (
    <div className={isAI ? "flex" : "flex justify-end"}>
      <div
        className={
          isAI
            ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-[13px] text-slate-700"
            : "max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-navy px-3 py-2 text-[13px] text-white"
        }
      >
        {children}
      </div>
    </div>
  )
}
