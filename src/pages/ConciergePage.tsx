import { useCallback, useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  Keyboard,
  Lock,
  Mic,
  PanelLeft,
  PhoneOff,
  Quote,
  Send,
  ShieldCheck,
  Users,
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
import { AccountPanel } from "@/components/demo/variants/AccountPanel"
import { CustomerList } from "@/components/demo/variants/CustomerList"
import { SlideOver } from "@/components/demo/variants/SlideOver"
import { VariantSwitcher } from "@/components/demo/variants/VariantSwitcher"
import { DataSourceToggle } from "@/components/demo/DataSourceToggle"
import { clearChatContext } from "@/store/demoSlice"
import { useAppDispatch } from "@/store/hooks"

const IVORY = "#f7f4ee"

/**
 * V2 · "Waterline Concierge".
 *
 * A full-page voice-call experience. Opens on the list of values; once a
 * customer is picked, a persistent account panel sits beside a call stage: a
 * living water-droplet orb whose words rise as a live caption above a hushed
 * single-thread transcript, with a SAY/TYPE call dock. Same engine as every
 * variant — only the presentation differs.
 */
export default function ConciergePage() {
  const dispatch = useAppDispatch()
  const engine = useChatEngine()
  const { customer, account, source, meta, messages, thinking, typing, playing, otpPrompt, submitOtp, scrollRef } =
    engine
  const [panelOpen, setPanelOpen] = useState(false)
  const closePanel = useCallback(() => setPanelOpen(false), [])

  // At lg+ the panel is persistent, so make sure the slide-over never lingers
  // open across a resize (which would duplicate it behind a full-page scrim).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => mq.matches && closePanel()
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [closePanel])

  const hasContext = Boolean(customer && account)
  const lastStep = messages[messages.length - 1]?.step
  const lastIsDone = lastStep?.kind === "done" && !playing
  const callIdle = messages.length <= 1 && !playing && !thinking && !typing
  const seconds = useCallTimer(callIdle, lastIsDone)

  const orbState: OrbState = thinking ? "thinking" : typing ? "speaking" : "idle"
  const stateLabel = thinking
    ? "Thinking…"
    : typing
      ? "Speaking…"
      : otpPrompt
        ? "Waiting for your code"
        : lastIsDone
          ? "Call complete"
          : "On the line"

  // The freshest spoken line becomes the big live caption under the orb.
  let caption = "Connecting you to the ACSE concierge…"
  for (let i = messages.length - 1; i >= 0; i--) {
    const s = messages[i].step
    if (s.kind === "ai" || s.kind === "done") {
      caption = s.text
      break
    }
    if (s.kind === "summary") {
      caption = s.title
      break
    }
  }
  // A live challenge is the concierge's most recent utterance — it outranks the
  // transcript, which hasn't caught up with it yet.
  if (otpPrompt) caption = otpPrompt.text

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden font-sans" style={{ backgroundColor: IVORY }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_16%,rgba(44,165,217,0.16),transparent_62%),radial-gradient(45%_40%_at_82%_98%,rgba(227,57,53,0.05),transparent_55%)]"
      />

      {/* Header */}
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/40 px-4 backdrop-blur-sm md:px-5">
        <div className="flex items-center gap-2.5">
          <Logo className="h-6" />
          <span className="hidden rounded-full border border-brand-cyan/25 px-2 py-0.5 text-[11px] font-medium text-[#16789f] sm:inline">
            Concierge
          </span>
          {hasContext && (
            <>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  lastIsDone ? "bg-slate-400" : "bg-emerald-500 motion-safe:animate-pulse"
                )}
              />
              <span className="font-mono text-xs text-slate-600" aria-label={`Call time ${formatTime(seconds)}`}>
                {lastIsDone ? "Call complete" : formatTime(seconds)}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasContext && customer && account && (
            <button
              onClick={() => dispatch(clearChatContext())}
              title="Change customer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-brand-cyan sm:px-3"
            >
              <Users className="h-3.5 w-3.5 text-brand-cyan" />
              {/* Names the icon-only mobile button without masking the visible
                  label in the accessible name at sm+ (WCAG 2.5.3). */}
              <span className="sr-only">Change customer</span>
              <span className="hidden max-w-[9rem] truncate sm:inline">{customer.name}</span>
            </button>
          )}
          <div className="hidden md:block">
            <VariantSwitcher tone="light" />
          </div>
          <LineChip source={source} short={meta.chatShort} system={meta.chatSystem} playing={playing} />
          {hasContext && (
            <button
              onClick={() => setPanelOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-brand-cyan lg:hidden"
              aria-label="Open account details"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {!hasContext ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
          <CustomerList tone="light" />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-0 flex-1">
          {/* Persistent account panel (desktop) */}
          <aside className="hidden w-[340px] shrink-0 border-r border-slate-200 bg-white/50 lg:block">
            <AccountPanel tone="light" />
          </aside>

          {/* Call stage */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* On short viewports (landscape phones, split-screen) the stage
                yields space so the transcript and call dock stay on screen. */}
            <div className="relative flex h-[38vh] min-h-[280px] shrink-0 flex-col items-center justify-center gap-4 overflow-hidden px-6 pb-2 pt-6 [@media(max-height:560px)]:min-h-0 [@media(max-height:560px)]:shrink [@media(max-height:560px)]:gap-2 [@media(max-height:560px)]:pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">{stateLabel}</p>
              <Orb state={orbState} done={lastIsDone} />
              <div
                aria-hidden
                className="min-h-[3.5rem] max-w-xl text-balance px-2 text-center text-lg leading-snug text-brand-navy md:text-xl"
              >
                {thinking ? (
                  <ShimmerCaption phrases={thinking} />
                ) : typing ? (
                  <span className="text-base text-slate-500">Concierge is speaking…</span>
                ) : (
                  <span key={caption} className="font-medium motion-safe:animate-caption-in">
                    {caption}
                  </span>
                )}
              </div>
            </div>

            {/* Transcript spine */}
            <div ref={scrollRef} className="scrollbar-slim relative min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[620px] px-6 py-8 [mask-image:linear-gradient(to_bottom,transparent,#000_8%,#000_92%,transparent)]">
                <ol role="log" aria-live="polite" className="relative ml-4 space-y-7 border-l border-slate-200/70 pl-6">
                  {messages.map((m) => (
                    <TranscriptTurn key={m.id} msg={m} sourceLabel={meta.chatLabel} />
                  ))}
                  {otpPrompt && <OtpChallengeSlip prompt={otpPrompt} onSubmit={submitOtp} />}
                </ol>
              </div>
            </div>

            <Dock engine={engine} />
          </div>
        </div>
      )}

      {hasContext && (
        <SlideOver open={panelOpen} onClose={closePanel} side="left" tone="light" title="Account details">
          <AccountPanel tone="light" />
        </SlideOver>
      )}
      <DataSourceToggle side="right" />
    </div>
  )
}

/* -------------------------------- Timer ---------------------------------- */

function useCallTimer(idle: boolean, freeze: boolean) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (idle) {
      setSeconds(0)
      return
    }
    if (freeze) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [idle, freeze])
  return seconds
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

/* --------------------------------- Orb ----------------------------------- */

type OrbState = "idle" | "thinking" | "speaking"

function Orb({ state, done }: { state: OrbState; done: boolean }) {
  const active = state !== "idle"
  return (
    <div className="relative grid h-36 w-36 place-items-center [@media(max-height:560px)]:h-20 [@media(max-height:560px)]:w-20 md:h-44 md:w-44">
      {active &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            style={{ animationDelay: `${i * 0.8}s` }}
            className={cn(
              "absolute inset-0 rounded-full border border-brand-cyan/30 motion-safe:animate-orb-ripple",
              state === "speaking" && "[animation-duration:1.4s]"
            )}
          />
        ))}
      {done && (
        <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-emerald-400/50 motion-safe:animate-ring-out" />
      )}
      <div
        aria-hidden
        className="relative h-36 w-36 overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#7fd3f2,#2ca5d9_45%,#0a1e35)] shadow-[0_20px_60px_-15px_rgba(44,165,217,0.6)] motion-safe:animate-orb-breathe [@media(max-height:560px)]:h-20 [@media(max-height:560px)]:w-20 md:h-44 md:w-44"
      >
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.18),transparent_40%)] motion-safe:animate-sheen-rotate" />
        <span className="absolute left-7 top-6 h-10 w-10 rounded-full bg-white/50 blur-md" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex h-10 items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
                className={cn(
                  "h-8 w-1 origin-bottom rounded-full bg-white/75",
                  active ? "motion-safe:animate-wave-eq" : "scale-y-[0.22]"
                )}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  )
}

function ShimmerCaption({ phrases }: { phrases: string[] }) {
  const label = useCyclingPhrase(phrases)
  return (
    <span
      key={label}
      className="animate-shimmer bg-clip-text text-base font-medium text-transparent [background-image:linear-gradient(90deg,#94a3b8,#0a1e35_50%,#94a3b8)] [background-size:200%_100%] md:text-lg"
    >
      {label}
    </span>
  )
}

/* ------------------------------ Transcript ------------------------------- */

function TranscriptTurn({ msg, sourceLabel }: { msg: Msg; sourceLabel: string }) {
  const step = msg.step
  switch (step.kind) {
    case "ai":
      return (
        <li className="relative">
          <SpineDot tone="cyan" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#16789f]">ACSE Concierge</p>
          <p className="mt-1 max-w-[46ch] text-[18px] font-medium leading-relaxed text-brand-navy motion-safe:animate-speak-in md:text-[19px]">
            {step.text}
          </p>
        </li>
      )
    case "user":
      return (
        <li className="relative flex flex-col items-end text-right">
          <SpineDot tone="slate" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">You</p>
          <p className="mt-1 max-w-[46ch] text-[16px] leading-relaxed text-slate-600 motion-safe:animate-speak-in-right">
            “{step.text}”
          </p>
        </li>
      )
    case "status":
      return (
        <li className="relative">
          <div className="flex items-center justify-center gap-3 py-1 text-[12px] italic text-slate-600">
            <span aria-hidden className="h-px flex-1 border-t border-slate-200/70" />
            <span className="flex items-center gap-2 not-italic">
              <MiniEq />
              <span className="italic">
                <StatusText text={step.text} label={sourceLabel} />
              </span>
            </span>
            <span aria-hidden className="h-px flex-1 border-t border-slate-200/70" />
          </div>
        </li>
      )
    case "otp":
      return (
        <li className="relative">
          <OtpSlip channel={step.channel} text={step.text} entered={step.entered} />
        </li>
      )
    case "summary":
      return (
        <li className="relative">
          <ReceiptTicket step={step} />
        </li>
      )
    case "done":
      return (
        <li className="relative">
          <SpineDot tone="emerald" />
          <DoneSeal text={step.text} />
        </li>
      )
    default:
      return null
  }
}

function SpineDot({ tone }: { tone: "cyan" | "slate" | "emerald" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#f7f4ee]",
        tone === "cyan" && "bg-brand-cyan",
        tone === "slate" && "bg-slate-300",
        tone === "emerald" && "bg-emerald-500"
      )}
    />
  )
}

function MiniEq() {
  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.12}s` }}
          className="h-3 w-0.5 origin-bottom rounded-full bg-brand-cyan/70 motion-safe:animate-wave-eq"
        />
      ))}
    </span>
  )
}

function StatusText({ text, label }: { text: string; label: string }) {
  const idx = text.indexOf(label)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="rounded bg-brand-cyan/10 px-1 font-medium not-italic text-brand-navy">{label}</span>
      {text.slice(idx + label.length)}
    </>
  )
}

function OtpSlip({
  channel,
  text,
  entered,
}: {
  channel: "sms" | "email"
  text: string
  /** Present only when the caller keyed the code in; otherwise auto-verified. */
  entered?: string
}) {
  const digits = entered ? [...entered] : [...OTP_DIGITS]
  return (
    <div className="mx-auto max-w-sm animate-fade-in rounded-2xl bg-white/85 p-4 shadow-[0_10px_40px_-20px_rgba(10,30,53,0.4)] ring-1 ring-brand-cyan/20 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-cyan/12 text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="text-[13px] font-medium text-brand-navy">
          Identity verified · {channel === "sms" ? "SMS" : "Email"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600">{text}</p>
      <div className="mt-3 grid grid-cols-6 gap-2" aria-label={`Verification code ${digits.join(" ")}`}>
        {digits.map((d, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 90}ms` }}
            className="grid aspect-square place-items-center rounded-xl bg-brand-navy/[0.04] text-lg font-semibold tabular-nums text-brand-navy ring-1 ring-brand-cyan/10 motion-safe:animate-digit-pop"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The live identity check. Replaced by an OtpSlip once a code is submitted. */
function OtpChallengeSlip({
  prompt,
  onSubmit,
}: {
  prompt: OtpPrompt
  onSubmit: (code: string) => void
}) {
  return (
    <li className="relative">
      <SpineDot tone="cyan" />
      <div className="mx-auto max-w-sm animate-fade-in rounded-2xl bg-white p-4 shadow-[0_10px_40px_-20px_rgba(10,30,53,0.4)] ring-1 ring-brand-cyan/40">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-cyan/12 text-brand-cyan">
            <KeyRound className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium text-brand-navy">
            Verify your identity · {prompt.channel === "sms" ? "SMS" : "Email"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600">{prompt.text}</p>
        <OtpInput tone="ivory" onSubmit={onSubmit} className="mt-3" />
      </div>
    </li>
  )
}

function ReceiptTicket({ step }: { step: Extract<ChatStep, { kind: "summary" }> }) {
  const success = step.tone === "success"
  return (
    <div className="relative mx-auto max-w-md animate-fade-in overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-25px_rgba(10,30,53,0.35)] ring-1 ring-slate-100">
      <span aria-hidden className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" style={{ backgroundColor: IVORY }} />
      <span aria-hidden className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" style={{ backgroundColor: IVORY }} />
      <div
        className={cn(
          "flex items-center gap-2 px-5 py-3 text-[13px] font-semibold",
          success ? "bg-emerald-50 text-emerald-700" : "bg-brand-cyan/10 text-brand-navy"
        )}
      >
        <ClipboardCheck className="h-4 w-4" />
        {step.title}
      </div>
      <dl className="px-1 py-2">
        {step.rows.map(([k, v], i) => (
          <div
            key={k}
            style={{ animationDelay: `${i * 70}ms` }}
            className="flex items-baseline gap-2 px-4 py-2.5 motion-safe:animate-caption-in"
          >
            <dt className="shrink-0 text-[13px] text-slate-600">{k}</dt>
            <span aria-hidden className="h-px flex-1 -translate-y-[3px] border-b border-dotted border-slate-200" />
            <dd className="shrink-0 text-right text-[13px] font-medium tabular-nums text-brand-navy">{v}</dd>
          </div>
        ))}
      </dl>
      {success && (
        <div className="bg-emerald-50/60 px-5 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-emerald-700">
          Confirmed
        </div>
      )}
    </div>
  )
}

function DoneSeal({ text }: { text: string }) {
  const { body, ref } = splitReference(text)
  return (
    <div className="mx-auto flex animate-fade-in items-center gap-3 rounded-2xl bg-emerald-50/70 px-4 py-3 ring-1 ring-emerald-200">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <span className="text-[15px] text-emerald-900">{body}</span>
      {ref && (
        <span className="ml-auto shrink-0 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 font-mono text-xs tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-200">
          {ref}
        </span>
      )}
    </div>
  )
}

/* --------------------------------- Dock ---------------------------------- */

function Dock({ engine }: { engine: ReturnType<typeof useChatEngine> }) {
  const { draft, setDraft, onSend, playing, pills, startScenario, resetConversation } = engine
  const [typeMode, setTypeMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeMode) inputRef.current?.focus()
  }, [typeMode])

  const submit = () => {
    if (!draft.trim()) return
    onSend()
    setTypeMode(false)
  }

  return (
    <div className="relative z-20 shrink-0 p-4">
      <div className="mx-auto w-full max-w-2xl rounded-[28px] bg-white/85 px-4 py-3 shadow-[0_20px_50px_-24px_rgba(10,30,53,0.4)] ring-1 ring-slate-200/70 backdrop-blur-xl">
        {playing ? (
          <div className="flex items-center justify-center gap-3 py-3 text-sm font-medium text-slate-600">
            <span className="flex h-4 items-end gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className="h-4 w-0.5 origin-bottom rounded-full bg-brand-cyan/70 motion-safe:animate-wave-eq"
                />
              ))}
            </span>
            Concierge is on the line…
          </div>
        ) : typeMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeMode(false)}
              aria-label="Back to suggestions"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-500 outline-none ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              <Quote className="h-4 w-4" />
            </button>
            <div className="flex h-12 flex-1 items-center rounded-full bg-slate-50 pl-5 pr-1 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-brand-cyan">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Type what you'd like to say…"
                className="h-full flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-slate-500"
              />
              <button
                onClick={submit}
                disabled={!draft.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-cyan text-white outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="scrollbar-slim flex gap-2 overflow-x-auto pb-2">
              {pills.map((u) => (
                <SayChip key={u.id} pill={u} onClick={() => startScenario(u.id)} />
              ))}
            </div>
            <div className="mt-1 flex items-center justify-center gap-4">
              <button
                onClick={() => setTypeMode(true)}
                aria-label="Type instead"
                title="Type instead"
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-slate-500 outline-none ring-1 ring-slate-200 transition hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                <Keyboard className="h-4 w-4" />
              </button>
              <MicButton />
              <button
                onClick={() => resetConversation()}
                aria-label="End call"
                title="End call"
                className="grid h-11 w-11 place-items-center rounded-full bg-brand-red text-white outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-brand-red"
              >
                <PhoneOff className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
      <p className="mt-1.5 text-center text-[10px] text-slate-500">
        Simulated demo · synthetic data · tap a suggestion or type to talk to the concierge
      </p>
    </div>
  )
}

function MicButton() {
  const [listening, setListening] = useState(false)
  return (
    <button
      onClick={() => setListening((v) => !v)}
      aria-pressed={listening}
      aria-label="Hold the line"
      className="relative grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#8fd4ef,#2ca5d9)] text-white shadow-lg outline-none transition focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2"
    >
      {listening && <span aria-hidden className="absolute inset-0 rounded-full bg-brand-cyan/40 motion-safe:animate-ping" />}
      <Mic className="relative h-6 w-6" />
    </button>
  )
}

function SayChip({ pill, onClick }: { pill: EnginePill; onClick: () => void }) {
  const emergency = pill.category === "Emergency"
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan active:scale-95",
        emergency
          ? "bg-brand-red/8 text-red-700 ring-brand-red/20 hover:bg-brand-red/12"
          : "bg-brand-cyan/[0.08] text-brand-navy ring-brand-cyan/15 hover:bg-brand-cyan/[0.14] hover:ring-brand-cyan/30"
      )}
      title={pill.prompt}
    >
      <Quote className={cn("h-3 w-3", emergency ? "text-red-700" : "text-brand-cyan")} />
      <pill.Icon className={cn("h-3.5 w-3.5", emergency ? "text-red-700" : "text-brand-cyan")} />
      {pill.label}
    </button>
  )
}

/* ------------------------------ Header chip ------------------------------ */

function LineChip({
  source,
  short,
  system,
  playing,
}: {
  source: string
  short: string
  system: string
  playing: boolean
}) {
  const isLive = source === "C2M"
  return (
    <span
      aria-label={`Assistant mode: ${system}`}
      className={cn(
        "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 sm:inline-flex",
        isLive ? "bg-brand-red/5 text-brand-red ring-brand-red/25" : "bg-brand-cyan/5 text-brand-navy ring-brand-cyan/25",
        playing && "motion-safe:animate-pulse"
      )}
    >
      <Lock className={cn("h-3 w-3", isLive ? "text-brand-red" : "text-brand-cyan")} />
      Line · {short}
    </span>
  )
}
