import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { OtpInput } from "@/components/demo/OtpInput"
import { useAccessGate, type GrantAction } from "@/components/demo/useAccessGate"

type Tone = "light" | "dark" | "ivory"

/** How long the "Sending code…" state is held before the entry boxes appear. */
const SEND_MS = 700

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Per-design chrome. Behaviour is identical everywhere; only the surface
 * changes, so each chatbot design can host the same gate.
 */
const TONES: Record<
  Tone,
  {
    page: string
    card: string
    icon: string
    title: string
    body: string
    muted: string
    meta: string
    metaLabel: string
    label: string
    input: string
    primary: string
    ghost: string
    error: string
    otp: "light" | "dark" | "ivory"
  }
> = {
  light: {
    page: "bg-slate-50/60",
    card: "bg-white shadow-sm ring-1 ring-slate-200",
    icon: "bg-brand-cyan/10 text-brand-cyan",
    title: "text-brand-navy",
    body: "text-slate-700",
    muted: "text-slate-500",
    meta: "bg-slate-50 ring-1 ring-slate-100",
    metaLabel: "text-slate-500",
    label: "text-slate-600",
    input:
      "bg-white text-brand-navy ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-cyan",
    primary: "bg-brand-cyan text-white hover:bg-brand-cyan/90",
    ghost: "text-slate-500 hover:text-brand-navy",
    error: "text-red-600",
    otp: "light",
  },
  dark: {
    page: "",
    card: "bg-white/[0.03] ring-1 ring-white/10 backdrop-blur",
    icon: "bg-brand-cyan/15 text-brand-cyan",
    title: "text-slate-100",
    body: "text-slate-300",
    muted: "text-slate-400",
    meta: "bg-white/[0.04] ring-1 ring-white/[0.06]",
    metaLabel: "text-slate-400",
    label: "text-slate-300",
    input:
      "bg-white/[0.04] text-slate-100 ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-cyan",
    primary: "bg-brand-cyan text-white hover:bg-brand-cyan/90",
    ghost: "text-slate-400 hover:text-white",
    error: "text-red-400",
    otp: "dark",
  },
  ivory: {
    page: "",
    card: "bg-white/70 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm",
    icon: "bg-brand-cyan/10 text-[#16789f]",
    title: "text-brand-navy",
    body: "text-slate-700",
    muted: "text-slate-500",
    meta: "bg-brand-navy/[0.03] ring-1 ring-brand-cyan/10",
    metaLabel: "text-slate-500",
    label: "text-slate-600",
    input:
      "bg-white text-brand-navy ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-cyan",
    primary: "bg-brand-cyan text-white hover:bg-brand-cyan/90",
    ghost: "text-slate-500 hover:text-brand-navy",
    error: "text-red-600",
    otp: "ivory",
  },
}

/** r.chen@example.com → r•••••@example.com — a hint, not a giveaway. */
function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  if (!domain) return email
  return `${user[0]}${"•".repeat(Math.max(user.length - 1, 1))}@${domain}`
}

/**
 * The identity gate: an account picked from the list is held here until the
 * customer confirms an email and keys the one-time code in. Shown by every
 * chatbot design in place of its list — only `tone` and the `grant` action
 * (which differs between the modal and the standalone pages) change.
 *
 * Modes wired to a live session never reach this screen; see `useAccessGate`.
 */
export function AccountVerify({ tone = "light", grant }: { tone?: Tone; grant: GrantAction }) {
  const gate = useAccessGate(grant)
  const t = TONES[tone]
  const [email, setEmail] = useState(gate.email)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const timerRef = useRef<number>()

  // The gate can be torn down mid-send (Cancel, or the mode being switched), so
  // never let a pending timer fire into an unmounted panel.
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  if (!gate.pending) return null
  const { customer, account } = gate.pending

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setError("Enter an email address so we can send your code.")
      return
    }
    setError(null)
    setSending(true)
    timerRef.current = window.setTimeout(() => {
      setSending(false)
      gate.sendCode(value)
    }, SEND_MS)
  }

  return (
    <div className={cn("h-full overflow-y-auto scrollbar-slim px-4 py-8", t.page)}>
      <div className={cn("mx-auto w-full max-w-md rounded-2xl p-6", t.card)}>
        <div className="flex items-center gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", t.icon)}>
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className={cn("text-lg font-semibold", t.title)}>Verify your identity</h2>
            <p className={cn("text-xs", t.muted)}>
              Step {gate.step === "email" ? "1" : "2"} of 2 ·{" "}
              {gate.step === "email" ? "Email address" : "One-time code"}
            </p>
          </div>
        </div>

        {/* The account being unlocked — the pick is not the context yet. */}
        <div className={cn("mt-4 rounded-xl px-3.5 py-2.5", t.meta)}>
          <p className={cn("text-sm font-medium", t.title)}>{customer.name}</p>
          <p className={cn("mt-0.5 truncate text-xs", t.metaLabel)}>
            {account.id} · {account.serviceAddress}
          </p>
        </div>

        {gate.step === "email" ? (
          <form onSubmit={handleEmail} className="mt-5" noValidate>
            <label
              htmlFor="verify-email"
              className={cn("block text-xs font-medium", t.label)}
            >
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail
                className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", t.muted)}
              />
              <input
                id="verify-email"
                type="email"
                value={email}
                autoFocus
                autoComplete="email"
                aria-invalid={Boolean(error)}
                aria-describedby="verify-email-help"
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                placeholder={maskEmail(customer.email)}
                className={cn(
                  "h-11 w-full rounded-xl pl-9 pr-3 text-sm outline-none transition",
                  t.input
                )}
              />
            </div>

            {error && (
              <p role="alert" className={cn("mt-2 text-xs", t.error)}>
                {error}
              </p>
            )}

            <p id="verify-email-help" className={cn("mt-2 text-xs", t.muted)}>
              We'll send a 6-digit code to confirm it's you. Any address is accepted here
              — nothing is really sent.
            </p>

            <button
              type="submit"
              disabled={sending}
              className={cn(
                "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 disabled:opacity-60",
                t.primary
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                "Send code"
              )}
            </button>

            <BackButton onClick={gate.cancel} className={t.ghost}>
              Back to customers
            </BackButton>
          </form>
        ) : (
          <div className="mt-5">
            <p className={cn("text-sm", t.body)}>
              We sent a 6-digit code to{" "}
              <span className={cn("font-medium", t.title)}>{gate.email}</span>. Enter it below
              to open the assistant.
            </p>

            <OtpInput tone={t.otp} onSubmit={gate.submitCode} className="mt-4" />

            <p className={cn("mt-3 text-xs", t.muted)}>Any 6 digits are accepted.</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={gate.editEmail}
                className={cn(
                  "rounded-md text-xs font-medium underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-brand-cyan",
                  t.ghost
                )}
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={gate.cancel}
                className={cn(
                  "rounded-md text-xs font-medium underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-brand-cyan",
                  t.ghost
                )}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BackButton({
  onClick,
  className,
  children,
}: {
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-auto mt-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}
