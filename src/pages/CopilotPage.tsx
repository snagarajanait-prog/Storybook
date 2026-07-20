import { useCallback, useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  KeyRound,
  Loader2,
  PanelLeft,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { cn, splitReference } from "@/lib/utils"
import { type ChatStep } from "@/data/scenarios"
import { OtpInput } from "@/components/demo/OtpInput"
import {
  OTP_DIGITS,
  useChatEngine,
  useCyclingPhrase,
  type EnginePill,
  type Msg,
  type OtpPrompt,
} from "@/components/demo/useChatEngine"
import { Logo } from "@/components/layout/Logo"
import { AccountVerify } from "@/components/demo/AccountVerify"
import { AccountPanel } from "@/components/demo/variants/AccountPanel"
import { CustomerList } from "@/components/demo/variants/CustomerList"
import { SlideOver } from "@/components/demo/variants/SlideOver"
import { VariantSwitcher } from "@/components/demo/variants/VariantSwitcher"
import { DataSourceToggle } from "@/components/demo/DataSourceToggle"
import { setChatContext } from "@/store/demoSlice"
import { useAppSelector } from "@/store/hooks"

/**
 * White-label tenant brand shown top-left. This is the *client's* company, not
 * ACSE — ACSE is credited as "Powered by" on the right. Swap CLIENT_NAME (and
 * the monogram in `ClientBrand`) for the client's real name / logo artwork.
 */
const CLIENT_NAME = "XYZ Company"

/**
 * V1 · "Filament — The Reasoning Thread".
 *
 * A full-viewport, committed-dark immersive copilot. Opens on the list of
 * values; once a customer is picked, a persistent account panel sits beside a
 * conversation that runs down a single glowing cyan filament (bubble-less
 * typeset prose on nodes). Shares the exact chat engine with every variant.
 */
export default function CopilotPage() {
  const engine = useChatEngine()
  const { customer, account, source, meta, messages, thinking, typing, playing, otpPrompt, submitOtp, resetConversation } =
    engine
  const [panelOpen, setPanelOpen] = useState(false)
  const closePanel = useCallback(() => setPanelOpen(false), [])
  // An account picked but held at the identity gate. It outranks the list *and*
  // any standing context, so a fresh pick can never slip in behind the gate.
  const verifying = useAppSelector((s) => Boolean(s.demo.pendingAccountId))

  // At lg+ the panel is persistent, so make sure the slide-over never lingers
  // open across a resize (which would duplicate it behind a full-page scrim).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => mq.matches && closePanel()
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [closePanel])

  const hasContext = Boolean(customer && account) && !verifying

  // Hero state: only the seeded greeting exists and nothing is in flight. Treat
  // the transient empty frame as hero too, so cold entry never flashes an empty
  // docked layout.
  const isHero =
    messages.length <= 1 &&
    !playing &&
    !thinking &&
    !typing &&
    (messages.length === 0 || messages[0]?.step.kind === "ai")
  const greetingText =
    messages[0]?.step.kind === "ai" ? messages[0].step.text : "How can I help you today?"

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-brand-navydeep font-sans text-slate-100 antialiased">
      <AmbientBackdrop />

      {/* Header */}
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-brand-navydeep/60 px-4 backdrop-blur-xl md:px-6">
        {/* White-label: the client's own brand, top-left (not ACSE). */}
        <ClientBrand />

        <div className="ml-auto flex items-center gap-2">
          <VariantSwitcher tone="dark" />
          <SourcePill source={source} system={meta.chatSystem} short={meta.chatShort} />
          {hasContext && (
            <>
              <button
                onClick={() => setPanelOpen(true)}
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-cyan lg:hidden"
                aria-label="Open account details"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                onClick={resetConversation}
                disabled={playing}
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-40"
                aria-label="New chat"
                title="New chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </>
          )}
          <span aria-hidden className="mx-0.5 hidden h-6 w-px bg-white/10 sm:block" />
          <PoweredBy />
        </div>
      </header>

      {!hasContext ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
          {verifying ? (
            <AccountVerify tone="dark" grant={setChatContext} />
          ) : (
            <CustomerList tone="dark" />
          )}
        </div>
      ) : (
        <div className="relative z-10 flex min-h-0 flex-1">
          {/* Persistent account panel (desktop) */}
          <aside className="hidden w-[340px] shrink-0 border-r border-white/10 bg-brand-navy/20 lg:block">
            <AccountPanel tone="dark" />
          </aside>

          {/* Conversation area */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div ref={engine.scrollRef} className="scrollbar-slim relative min-h-0 flex-1 overflow-y-auto">
              {isHero ? (
                <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-5 pb-16 pt-10 text-center">
                  <span className="relative mb-8 grid h-16 w-16 place-items-center">
                    <span className="h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_30%,#7fd3f2,#2ca5d9_55%,#0a1e35)] shadow-[0_0_60px_-8px_rgba(44,165,217,0.7)] motion-safe:animate-orb-breathe" />
                  </span>
                  <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-slate-100 md:text-4xl">
                    {greetingText}
                  </h1>
                  <p className="mt-3 text-[15px] text-slate-400">
                    Ask about a bill, start or stop service, or report a leak — I'll walk it through.
                  </p>
                  <div className="mt-8 w-full">
                    <Composer engine={engine} mode="hero" />
                  </div>
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-2xl px-5 pb-10 pt-10 md:px-0">
                  <Filament active={Boolean(thinking || typing)} />
                  <ol role="log" aria-live="polite" aria-relevant="additions" className="relative space-y-10">
                    {messages.map((m, i) => (
                      <Turn key={m.id} msg={m} source={source} isLast={i === messages.length - 1} playing={playing} />
                    ))}
                    {otpPrompt && <OtpChallengeNode prompt={otpPrompt} onSubmit={submitOtp} />}
                    {thinking && <ThinkingNode phrases={thinking} />}
                    {typing && <TypingNode />}
                  </ol>
                </div>
              )}
            </div>

            {!isHero && (
              <div className="relative shrink-0">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-brand-navydeep to-transparent"
                />
                <div className="relative mx-auto w-full max-w-2xl px-5 pb-6 pt-2">
                  <Composer engine={engine} mode="dock" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account panel on smaller viewports */}
      {hasContext && (
        <SlideOver open={panelOpen} onClose={closePanel} side="left" tone="dark" title="Account details">
          <AccountPanel tone="dark" />
        </SlideOver>
      )}
      <DataSourceToggle side="right" />
    </div>
  )
}

/* ----------------------------- Ambient layers ---------------------------- */

function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_-12%,rgba(44,165,217,0.20),transparent_70%)] motion-safe:animate-aurora-drift" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_100%_100%,rgba(227,57,53,0.08),transparent_70%)] [animation-delay:-8s] motion-safe:animate-aurora-drift" />
      <div className="brand-dot-grid absolute inset-0 opacity-[0.35]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_45%,#0d1b2a_100%)]" />
    </div>
  )
}

/* ------------------------------- Filament -------------------------------- */

function Filament({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-5 md:left-0">
      <span className="absolute left-1.5 top-1 grid -translate-x-1/2 place-items-center">
        <span className="h-3 w-3 rounded-full bg-brand-cyan" />
        <span className="absolute inset-0 rounded-full bg-brand-cyan/40 blur-md motion-safe:animate-orb-breathe" />
      </span>
      <div className="absolute bottom-0 left-1.5 top-8 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-brand-cyan/55 via-brand-cyan/15 to-transparent motion-safe:animate-spine-draw" />
      <div className="absolute bottom-0 left-1.5 top-8 w-[3px] -translate-x-1/2 origin-top bg-brand-cyan/25 blur-[3px] motion-safe:animate-spine-draw" />
      {active && (
        <div className="absolute left-1.5 top-8 h-20 w-[3px] -translate-x-1/2 bg-gradient-to-b from-transparent via-brand-cyan to-transparent blur-[1px] motion-safe:animate-filament-beam" />
      )}
    </div>
  )
}

function Node({ tone = "cyan" }: { tone?: "cyan" | "dim" | "emerald" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-1.5 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full ring-4",
        tone === "cyan" && "bg-brand-cyan ring-brand-cyan/15",
        tone === "dim" && "bg-slate-500 ring-white/[0.04]",
        tone === "emerald" && "bg-emerald-400 ring-emerald-400/20"
      )}
    />
  )
}

/* -------------------------------- Turns ---------------------------------- */

function Turn({
  msg,
  source,
  isLast,
  playing,
}: {
  msg: Msg
  source: string
  isLast: boolean
  playing: boolean
}) {
  const step = msg.step
  switch (step.kind) {
    case "user":
      return (
        <li className="relative flex flex-col items-end pl-9 motion-safe:animate-rise-in">
          <span className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">You</span>
          <div className="w-fit max-w-[75%] rounded-2xl rounded-tr-md bg-white/[0.06] px-4 py-2.5 text-[15px] leading-6 text-slate-100 ring-1 ring-white/10 backdrop-blur">
            <span className="sr-only">You said: </span>
            {step.text}
          </div>
        </li>
      )
    case "ai":
      return (
        <li className="relative pl-9 motion-safe:animate-rise-in">
          <Node />
          <p className="max-w-[68ch] text-[15px] leading-7 text-slate-100/90">
            <span className="sr-only">Assistant said: </span>
            <Lede text={step.text} />
          </p>
        </li>
      )
    case "status": {
      const active = isLast && playing
      return (
        <li className="relative pl-9 motion-safe:animate-rise-in" role="status">
          <Node tone={active ? "cyan" : "dim"} />
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            {active ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-cyan" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
            )}
            {active ? (
              <span className="animate-shimmer bg-clip-text text-transparent [background-image:linear-gradient(90deg,#64748b_0%,#64748b_40%,#f8fafc_50%,#64748b_60%,#64748b_100%)] [background-size:200%_100%]">
                {step.text}
              </span>
            ) : (
              <span>{step.text}</span>
            )}
          </div>
        </li>
      )
    }
    case "otp":
      return (
        <li className="relative pl-9 motion-safe:animate-rise-in">
          <Node />
          <OtpCard channel={step.channel} text={step.text} entered={step.entered} />
        </li>
      )
    case "summary":
      return (
        <li className="relative pl-9 motion-safe:animate-rise-in">
          <Node />
          <SummaryCard step={step} source={source} />
        </li>
      )
    case "done":
      return (
        <li className="relative pl-9 motion-safe:animate-rise-in">
          <span aria-hidden className="absolute left-1.5 top-1.5 -translate-x-1/2">
            <span className="block h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400/50 motion-safe:animate-ring-out" />
          </span>
          <DoneBand text={step.text} />
        </li>
      )
    default:
      return null
  }
}

/** Renders the first sentence one weight brighter as a typographic lede. */
function Lede({ text }: { text: string }) {
  const m = text.match(/^(.*?[.?!])(\s+)([\s\S]+)$/)
  if (!m) return <span className="font-medium text-slate-50">{text}</span>
  return (
    <>
      <span className="font-medium text-slate-50">{m[1]}</span>
      {m[2]}
      {m[3]}
    </>
  )
}

function OtpCard({
  channel,
  text,
  entered,
}: {
  channel: "sms" | "email"
  text: string
  /** Present only when the customer keyed the code in; otherwise auto-verified. */
  entered?: string
}) {
  const digits = entered ? [...entered] : [...OTP_DIGITS]
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 shadow-[0_0_40px_-18px_rgba(16,185,129,0.5)] ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/12 text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="text-[13px] font-medium text-slate-100">
          Identity verified · {channel === "sms" ? "SMS" : "Email"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{text}</p>
      <div className="mt-3 grid grid-cols-6 gap-2" aria-label={`Verification code ${digits.join(" ")}`}>
        {digits.map((d, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 90}ms` }}
            className="grid h-11 place-items-center rounded-xl bg-white/[0.05] font-mono text-lg text-brand-cyan ring-1 ring-white/10 motion-safe:animate-digit-pop"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The live identity check. Replaced by an OtpCard once a code is submitted. */
function OtpChallengeNode({
  prompt,
  onSubmit,
}: {
  prompt: OtpPrompt
  onSubmit: (code: string) => void
}) {
  return (
    <li className="relative pl-9 motion-safe:animate-rise-in">
      <Node />
      <div className="rounded-2xl bg-white/[0.04] p-4 shadow-[0_0_40px_-18px_rgba(44,165,217,0.5)] ring-1 ring-brand-cyan/25 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-cyan/12 text-brand-cyan">
            <KeyRound className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium text-slate-100">
            Verify your identity · {prompt.channel === "sms" ? "SMS" : "Email"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{prompt.text}</p>
        <OtpInput tone="dark" onSubmit={onSubmit} className="mt-3" />
      </div>
    </li>
  )
}

function SummaryCard({ step, source }: { step: Extract<ChatStep, { kind: "summary" }>; source: string }) {
  const success = step.tone === "success"
  const Icon = success ? CheckCircle2 : ClipboardCheck
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl">
      <div className={cn("h-0.5 w-full", success ? "bg-emerald-400/70" : "bg-brand-cyan/70")} />
      <div className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold text-slate-100">
        <Icon className={cn("h-4 w-4", success ? "text-emerald-300" : "text-brand-cyan")} />
        {step.title}
      </div>
      <dl className="divide-y divide-white/[0.06]">
        {step.rows.map(([k, v], i) => {
          const routed = /^(routed|processed)/i.test(k)
          return (
            <div
              key={k}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "flex items-start justify-between gap-4 px-4 py-2.5 motion-safe:animate-row-reveal",
                routed && "bg-white/[0.02]"
              )}
            >
              <dt className="flex items-center gap-1.5 text-xs text-slate-400">
                {routed && (
                  <span className={cn("h-1.5 w-1.5 rounded-full", source === "C2M" ? "bg-brand-red" : "bg-brand-cyan")} />
                )}
                {k}
              </dt>
              <dd className="text-right text-[13px] font-medium text-slate-100">{v}</dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

function DoneBand({ text }: { text: string }) {
  const { body, ref } = splitReference(text)
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-emerald-400/[0.07] px-4 py-3.5 text-[14px] text-emerald-100 shadow-[0_0_50px_-20px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400/25 backdrop-blur">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
      <span>
        {body}{" "}
        {ref && (
          <span className="ml-0.5 whitespace-nowrap rounded-md bg-emerald-400/10 px-2 py-0.5 font-mono text-[12px] text-emerald-200">
            {ref}
          </span>
        )}
      </span>
    </div>
  )
}

function ThinkingNode({ phrases }: { phrases: string[] }) {
  const label = useCyclingPhrase(phrases)
  return (
    <li className="relative pl-9">
      <Node />
      <div className="flex items-center gap-2" aria-label="Assistant is working">
        <span
          key={label}
          className="animate-shimmer bg-clip-text text-sm font-medium text-transparent [background-image:linear-gradient(90deg,#64748b_0%,#64748b_40%,#f8fafc_50%,#64748b_60%,#64748b_100%)] [background-size:200%_100%]"
        >
          {label}
        </span>
        <span className="flex items-center gap-0.5">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-1 w-1 rounded-full bg-brand-cyan/70 motion-safe:animate-typing-bounce"
              style={{ animationDelay: `${d * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </li>
  )
}

function TypingNode() {
  return (
    <li className="relative pl-9" aria-hidden>
      <Node />
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-brand-cyan/80 motion-safe:animate-typing-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </li>
  )
}

/* ------------------------------- Composer -------------------------------- */

function Composer({ engine, mode }: { engine: ReturnType<typeof useChatEngine>; mode: "hero" | "dock" }) {
  const { draft, setDraft, onSend, playing, pills, startScenario, meta } = engine
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea with the draft.
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(200, ta.scrollHeight)}px`
  }, [draft])

  return (
    <div>
      {mode === "hero" ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pills.map((u) => (
            <Chip key={u.id} pill={u} disabled={playing} onClick={() => startScenario(u.id)} />
          ))}
        </div>
      ) : (
        !playing && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pills.map((u) => (
              <Chip key={u.id} pill={u} disabled={playing} onClick={() => startScenario(u.id)} className="shrink-0" />
            ))}
          </div>
        )
      )}

      <div className="flex items-end gap-2 rounded-[28px] bg-white/[0.06] px-3 py-2.5 shadow-[0_12px_60px_-16px_rgba(44,165,217,0.4)] ring-1 ring-white/12 backdrop-blur-2xl transition focus-within:shadow-[0_12px_70px_-14px_rgba(44,165,217,0.55)] focus-within:ring-brand-cyan/40">
        <Sparkles className="mb-2.5 ml-1 h-4 w-4 shrink-0 text-slate-500" />
        <textarea
          ref={taRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          disabled={playing}
          placeholder={playing ? "Assistant is responding…" : "Ask ACSE AI to start service, explain a bill, report a leak…"}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          onClick={onSend}
          disabled={playing || !draft.trim()}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-cyan text-brand-navydeep shadow-[0_0_20px_-4px_rgba(44,165,217,0.7)] outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navydeep disabled:opacity-30 disabled:shadow-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Illustrative conversation · non-production data · reads/writes {meta.chatLabel}
      </p>
    </div>
  )
}

function Chip({
  pill,
  onClick,
  disabled,
  className,
}: {
  pill: EnginePill
  onClick: () => void
  disabled: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-slate-300 outline-none ring-1 ring-white/10 backdrop-blur transition hover:bg-brand-cyan/10 hover:text-white hover:ring-brand-cyan/40 focus-visible:ring-2 focus-visible:ring-brand-cyan active:scale-95 disabled:opacity-40",
        className
      )}
    >
      <pill.Icon className="h-3.5 w-3.5 text-brand-cyan" />
      {pill.label}
    </button>
  )
}

/* ------------------------------ Header brand ----------------------------- */

/**
 * The client's own brand, top-left (white-label). The mark here is a placeholder
 * monogram derived from CLIENT_NAME — replace it with an `<img>` of the client's
 * real logo when supplied (drop the artwork next to `acse-logo.png` and import
 * it the same way `Logo` does).
 */
function ClientBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-navy text-sm font-bold text-white ring-1 ring-white/10">
        {CLIENT_NAME.charAt(0)}
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-slate-100">
        {CLIENT_NAME}
      </span>
    </div>
  )
}

/** "Powered by ACSE" attribution, top-right. */
function PoweredBy() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:inline">
        Powered by
      </span>
      <Logo className="h-5" />
    </div>
  )
}

/* ----------------------------- Header pieces ----------------------------- */

function SourcePill({ source, system, short }: { source: string; system: string; short: string }) {
  const isLive = source === "C2M"
  return (
    <span
      aria-label={`Assistant mode: ${system}`}
      className={cn(
        "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 sm:inline-flex",
        isLive ? "bg-brand-red/10 text-brand-red ring-brand-red/40" : "bg-brand-cyan/10 text-brand-cyan ring-brand-cyan/30"
      )}
    >
      {isLive ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-red" />
        </span>
      ) : (
        <FlaskConical className="h-3 w-3" />
      )}
      Mode · {short}
    </span>
  )
}
