import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getIcon } from "@/components/icon-map"
import { findAccount, findCustomer } from "@/data/customers"
import { useCases } from "@/data/useCases"
import { getScenario, type ChatStep } from "@/data/scenarios"
import { DATA_SOURCE_META } from "@/store/dataSourceSlice"
import { clearScenario } from "@/store/demoSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

interface Msg {
  id: number
  step: ChatStep
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Prioritised keyword match from free-typed text to a scenario id. */
function matchScenario(text: string): string | null {
  const t = text.toLowerCase()
  const rules: [string, string[]][] = [
    ["report-leak", ["leak", "burst", "emergency", "flood", "main break"]],
    ["report-outage", ["outage", "no water", "water out", "pressure", "down"]],
    ["transfer-service", ["transfer", "moving to", "new home", "new house"]],
    ["stop-service", ["stop", "cancel", "close", "move out", "disconnect", "end service"]],
    ["start-service", ["start", "new service", "turn on", "begin service"]],
    ["payment-arrangement", ["payment", "arrangement", "installment", "plan", "can't pay", "extension"]],
    ["high-bill", ["high", "expensive", "too much", "why is my bill", "bill so", "overcharged"]],
    ["update-contact", ["update", "change my", "phone", "email", "contact", "number"]],
  ]
  for (const [id, keys] of rules) {
    if (keys.some((k) => t.includes(k))) return id
  }
  return null
}

function greeting(name: string) {
  const h = new Date().getHours()
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
  return `${part}, ${name.split(" ")[0]}. How can I help you today?`
}

// Default "working" phrases shown (shimmering, one at a time) before a response.
// Tokens like {account}/{source} are resolved at play time.
const THINK_INTENT = ["Analysing your request", "Understanding intent", "Checking account {account}"]
const THINK_STATUS = ["Requesting data from {source}", "Processing records"]
const THINK_SUMMARY = ["Compiling the details", "Summarising"]
const THINK_FALLBACK = ["Analysing your request", "Matching to a workflow"]

/**
 * Which "thinking" phrases to shimmer before a step appears. Authored `think`
 * on the step wins; otherwise a default is chosen by kind. Returns null for
 * plain follow-up lines, which fall back to the simple typing dots.
 */
function thinkPhrasesFor(step: ChatStep, prevWasUser: boolean): string[] | null {
  const authored = "think" in step ? step.think : undefined
  if (authored && authored.length) return authored
  switch (step.kind) {
    case "status":
      return THINK_STATUS
    case "summary":
      return THINK_SUMMARY
    case "ai":
      return prevWasUser ? THINK_INTENT : null
    default:
      return null
  }
}

export function ChatWindow() {
  const dispatch = useAppDispatch()
  const { selectedCustomerId, selectedAccountId, activeScenarioId } = useAppSelector(
    (s) => s.demo
  )
  const source = useAppSelector((s) => s.dataSource.source)

  const customer = findCustomer(selectedCustomerId)
  const account = findAccount(customer, selectedAccountId)

  // Keep the latest source in a ref so mid-storyboard toggles resolve live.
  const sourceRef = useRef(source)
  sourceRef.current = source

  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [thinking, setThinking] = useState<string[] | null>(null)
  const [playing, setPlaying] = useState(false)
  const [draft, setDraft] = useState("")
  const idRef = useRef(0)
  const runRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const resolve = useCallback(
    (text: string) => {
      if (!customer || !account) return text
      const meta = DATA_SOURCE_META[sourceRef.current]
      return text
        .split("{name}").join(customer.name)
        .split("{account}").join(account.id)
        .split("{address}").join(account.serviceAddress)
        .split("{source}").join(meta.label)
        .split("{sourceSystem}").join(meta.system)
    },
    [customer, account]
  )

  const resolveStep = useCallback(
    (step: ChatStep): ChatStep => {
      switch (step.kind) {
        case "summary":
          return {
            ...step,
            title: resolve(step.title),
            rows: step.rows.map(([k, v]) => [resolve(k), resolve(v)] as [string, string]),
          }
        case "otp":
          return { ...step, text: resolve(step.text) }
        default:
          return "text" in step ? { ...step, text: resolve(step.text) } : step
      }
    },
    [resolve]
  )

  const push = useCallback((step: ChatStep) => {
    setMessages((m) => [...m, { id: idRef.current++, step }])
  }, [])

  const delayFor = (step: ChatStep) => {
    if (step.kind === "otp" || step.kind === "summary") return 900
    if (step.kind === "status") return 750
    const len = "text" in step ? step.text.length : 40
    return Math.min(1500, 550 + len * 12)
  }

  const play = useCallback(
    async (steps: ChatStep[], firstUserText?: string) => {
      const myRun = ++runRef.current
      setPlaying(true)
      setTyping(false)
      setThinking(null)
      for (let i = 0; i < steps.length; i++) {
        if (runRef.current !== myRun) return
        const raw = steps[i]
        if (raw.kind === "user") {
          await sleep(i === 0 ? 200 : 550)
          if (runRef.current !== myRun) return
          push(
            firstUserText && i === 0
              ? { kind: "user", text: firstUserText }
              : resolveStep(raw)
          )
        } else {
          const phrases = thinkPhrasesFor(raw, i > 0 && steps[i - 1].kind === "user")
          if (phrases) {
            // Shimmering "working" phrases (Analysing → Requesting → …).
            setThinking(phrases.map(resolve))
            await sleep(Math.max(1000, phrases.length * 750))
            if (runRef.current !== myRun) {
              setThinking(null)
              return
            }
            setThinking(null)
          } else {
            // Plain typing dots for simple follow-up lines.
            setTyping(true)
            await sleep(delayFor(raw))
            if (runRef.current !== myRun) {
              setTyping(false)
              return
            }
            setTyping(false)
          }
          push(resolveStep(raw))
          await sleep(150)
        }
      }
      setPlaying(false)
    },
    [push, resolve, resolveStep]
  )

  const startScenario = useCallback(
    (id: string, userText?: string) => {
      const scenario = getScenario(id)
      if (!scenario) return
      void play(scenario.steps, userText)
    },
    [play]
  )

  // Reset conversation whenever the selected account changes.
  const resetConversation = useCallback(() => {
    runRef.current++
    setPlaying(false)
    setTyping(false)
    setThinking(null)
    idRef.current = 0
    if (customer) {
      setMessages([{ id: idRef.current++, step: { kind: "ai", text: greeting(customer.name) } }])
    } else {
      setMessages([])
    }
  }, [customer])

  useEffect(() => {
    resetConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId, selectedAccountId])

  // Auto-play a scenario requested from elsewhere (e.g. use-case cards).
  useEffect(() => {
    if (activeScenarioId && customer) {
      startScenario(activeScenarioId)
      dispatch(clearScenario())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenarioId, customer])

  // Auto-scroll to newest.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing, thinking])

  const onSend = () => {
    const text = draft.trim()
    if (!text || playing) return
    setDraft("")
    const id = matchScenario(text)
    if (id) {
      startScenario(id, text)
    } else {
      const myRun = ++runRef.current
      push({ kind: "user", text })
      setPlaying(true)
      void (async () => {
        setThinking(THINK_FALLBACK.map(resolve))
        await sleep(1500)
        if (runRef.current !== myRun) return
        setThinking(null)
        push({
          kind: "ai",
          text: "I can help with that. Here are the things I can do right now — pick one to see it in action:",
        })
        setPlaying(false)
      })()
    }
  }

  const meta = DATA_SOURCE_META[source]

  const pills = useMemo(() => useCases, [])

  if (!customer || !account) return null

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-brand-navy px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-cyan/20">
          <Bot className="h-5 w-5 text-brand-cyan" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">ACSE Assistant</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online · context {account.id}
          </p>
        </div>
        <Badge
          variant={source === "C2M" ? "destructive" : "brand"}
          className="shrink-0"
          title="Active internal data source"
        >
          {meta.short}
        </Badge>
        <button
          onClick={resetConversation}
          disabled={playing}
          className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-40"
          title="Restart conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scrollbar-slim flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} step={m.step} />
        ))}
        {thinking && <ThinkingIndicator phrases={thinking} />}
        {typing && <TypingBubble />}
      </div>

      {/* Pills + input */}
      <div className="border-t bg-white p-3">
        {!playing && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {pills.map((u) => {
              const Icon = getIcon(u.icon)
              return (
                <button
                  key={u.id}
                  onClick={() => startScenario(u.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan/5 hover:text-brand-navy"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                  {u.label}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            disabled={playing}
            placeholder={playing ? "Assistant is responding…" : "Type a request…"}
          />
          <Button size="icon" onClick={onSend} disabled={playing || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Simulated demo · synthetic data · reads/writes {meta.label}
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ step }: { step: ChatStep }) {
  switch (step.kind) {
    case "user":
      return (
        <div className="flex animate-fade-in justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-brand-navy px-3.5 py-2 text-sm text-white">
            {step.text}
          </div>
        </div>
      )
    case "ai":
      return (
        <div className="flex animate-fade-in gap-2">
          <AiAvatar />
          <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
            {step.text}
          </div>
        </div>
      )
    case "status":
      return (
        <div className="flex animate-fade-in justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
            {step.text}
          </div>
        </div>
      )
    case "otp":
      return (
        <div className="flex animate-fade-in gap-2">
          <AiAvatar />
          <div className="max-w-[82%] rounded-xl border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Identity verified · {step.channel === "sms" ? "SMS" : "Email"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{step.text}</p>
            <div className="mt-2 flex gap-1.5">
              {["6", "2", "9", "1", "0", "4"].map((d, i) => (
                <span
                  key={i}
                  className="grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    case "summary":
      return (
        <div className="flex animate-fade-in gap-2">
          <AiAvatar />
          <div className="w-[82%] overflow-hidden rounded-xl border bg-white shadow-sm">
            <div
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-sm font-semibold",
                step.tone === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-brand-cyan/10 text-brand-navy"
              )}
            >
              <ClipboardCheck className="h-4 w-4" />
              {step.title}
            </div>
            <dl className="divide-y">
              {step.rows.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-right text-xs font-medium text-slate-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )
    case "done":
      return (
        <div className="flex animate-fade-in gap-2">
          <AiAvatar />
          <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {step.text}
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}

function AiAvatar() {
  return (
    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-cyan/15">
      <Bot className="h-4 w-4 text-brand-cyan" />
    </span>
  )
}

function TypingBubble() {
  return (
    <div className="flex gap-2">
      <AiAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-100">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-typing-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * The "working" indicator: a sparkle + a shimmering status word that cycles
 * through `phrases` one at a time (Analysing → Requesting → …), like the
 * status text an AI shows while it processes a request.
 */
function ThinkingIndicator({ phrases }: { phrases: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    setI(0)
    if (phrases.length <= 1) return
    const t = setInterval(
      () => setI((p) => (p + 1 < phrases.length ? p + 1 : p)),
      750
    )
    return () => clearInterval(t)
  }, [phrases])

  const label = phrases[Math.min(i, phrases.length - 1)]
  return (
    <div className="flex animate-fade-in gap-2">
      <AiAvatar />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-slate-100">
        <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-brand-cyan" />
        <span
          key={label}
          className="animate-shimmer bg-clip-text text-sm font-medium text-transparent [background-image:linear-gradient(90deg,#94a3b8_0%,#94a3b8_40%,#0a1e35_50%,#94a3b8_60%,#94a3b8_100%)] [background-size:200%_100%]"
        >
          {label}
        </span>
        <span className="flex items-center gap-0.5">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-1 w-1 rounded-full bg-brand-cyan/70 animate-typing-bounce"
              style={{ animationDelay: `${d * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
