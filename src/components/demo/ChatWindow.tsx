import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
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
import { type ChatStep } from "@/data/scenarios"
import { OtpInput } from "@/components/demo/OtpInput"
import { VerifiedChip } from "@/components/demo/VerifiedChip"
import {
  OTP_DIGITS,
  useChatEngine,
  useCyclingPhrase,
  type OtpPrompt,
} from "@/components/demo/useChatEngine"

export function ChatWindow() {
  const {
    customer,
    account,
    source,
    meta,
    pills,
    messages,
    thinking,
    typing,
    playing,
    otpPrompt,
    submitOtp,
    draft,
    setDraft,
    onSend,
    startScenario,
    resetConversation,
    scrollRef,
  } = useChatEngine()

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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online · context {account.id}
            </p>
            <VerifiedChip tone="dark" />
          </div>
        </div>
        <Badge
          variant={source === "C2M" ? "destructive" : "brand"}
          className="shrink-0"
          title="Active assistant mode"
        >
          {meta.chatShort}
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
        {otpPrompt && <OtpChallenge prompt={otpPrompt} onSubmit={submitOtp} />}
        {thinking && <ThinkingIndicator phrases={thinking} />}
        {typing && <TypingBubble />}
      </div>

      {/* Pills + input */}
      <div className="border-t bg-white p-3">
        {!playing && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {pills.map((u) => (
              <button
                key={u.id}
                onClick={() => startScenario(u.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan/5 hover:text-brand-navy"
              >
                <u.Icon className="h-3.5 w-3.5 text-brand-cyan" />
                {u.label}
              </button>
            ))}
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
          Illustrative conversation · non-production data · reads/writes {meta.chatLabel}
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
    case "otp": {
      // `entered` is present only when the customer keyed the code in herself;
      // otherwise this card is the auto-verified one and shows the demo code.
      const digits = step.entered ? [...step.entered] : [...OTP_DIGITS]
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
              {digits.map((d, i) => (
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
    }
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

/** The live identity check. Replaced by a verified card once a code is sent. */
function OtpChallenge({
  prompt,
  onSubmit,
}: {
  prompt: OtpPrompt
  onSubmit: (code: string) => void
}) {
  return (
    <div className="flex animate-fade-in gap-2">
      <AiAvatar />
      <div className="max-w-[82%] rounded-xl border border-brand-cyan/40 bg-white p-3 shadow-sm ring-1 ring-brand-cyan/10">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
          <KeyRound className="h-4 w-4 text-brand-cyan" />
          Verify your identity · {prompt.channel === "sms" ? "SMS" : "Email"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{prompt.text}</p>
        <OtpInput tone="light" onSubmit={onSubmit} className="mt-2.5" />
      </div>
    </div>
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
  const label = useCyclingPhrase(phrases)
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
