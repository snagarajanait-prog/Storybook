import { ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"

type Tone = "light" | "dark"

const TONES: Record<Tone, string> = {
  light: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  dark: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20",
}

/**
 * How the live chat context cleared the identity gate — the running receipt for
 * a verification that has already happened.
 *
 * It reads differently per mode by design: a challenged customer sees the
 * address their code went to, while a mode on an already-authenticated session
 * (which never showed the gate) sees that its code was sent and confirmed
 * ahead of the chat. That difference is the point — it's why one mode asked and
 * the other didn't.
 */
export function VerifiedChip({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const via = useAppSelector((s) => s.demo.verifiedVia)
  const email = useAppSelector((s) => s.demo.verifyEmail)

  if (!via) return null

  const detail =
    via === "challenge" ? `Verified · ${email}` : "Verified · code already sent for this session"

  return (
    <span
      title={detail}
      className={cn(
        "inline-flex max-w-[16rem] shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className
      )}
    >
      <ShieldCheck className="h-3 w-3 shrink-0" />
      <span className="truncate">{detail}</span>
    </span>
  )
}
