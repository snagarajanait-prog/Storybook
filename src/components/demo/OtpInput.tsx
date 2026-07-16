import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

export const OTP_LENGTH = 6

/**
 * Per-design looks for the entry boxes. Behaviour is identical everywhere; only
 * the chrome changes, so each chatbot design can host the same input without
 * reimplementing the keyboard handling.
 */
const TONES = {
  light: "h-10 rounded-md bg-white text-base font-semibold text-slate-700 ring-1 ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-cyan",
  dark: "h-11 rounded-xl bg-white/[0.05] font-mono text-lg text-brand-cyan ring-1 ring-white/10 placeholder:text-slate-600 focus:ring-2 focus:ring-brand-cyan",
  ivory:
    "h-11 rounded-xl bg-brand-navy/[0.04] text-lg font-semibold tabular-nums text-brand-navy ring-1 ring-brand-cyan/10 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-cyan",
} as const

/**
 * Six single-digit boxes that submit as soon as the last one is filled — the
 * demo never has to hunt for a separate button. Handles auto-advance,
 * backspace-through, arrow keys, and pasting a whole code.
 *
 * Any six digits are accepted; the assistant verifies whatever is entered. The
 * point is to show the challenge, not to gatekeep a scripted demo.
 */
export function OtpInput({
  onSubmit,
  tone = "light",
  className,
}: {
  onSubmit: (code: string) => void
  tone?: keyof typeof TONES
  className?: string
}) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""))
  const refs = useRef<(HTMLInputElement | null)[]>([])
  // Latches on the submitting change so a stray keystroke landing in the same
  // tick can't fire a second time before the prompt unmounts.
  const sentRef = useRef(false)

  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), OTP_LENGTH - 1)]?.focus()

  const commit = (next: string[]) => {
    setDigits(next)
    if (!sentRef.current && next.every(Boolean)) {
      sentRef.current = true
      onSubmit(next.join(""))
    }
  }

  /** Write `chars` from box `start` onward — one typed digit or a pasted run. */
  const fill = (start: number, chars: string) => {
    const next = [...digits]
    let at = start
    for (const ch of chars) {
      if (at >= OTP_LENGTH) break
      next[at++] = ch
    }
    focus(at)
    commit(next)
  }

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "")
    if (!cleaned) {
      const next = [...digits]
      next[i] = ""
      setDigits(next)
      return
    }
    fill(i, cleaned)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const next = [...digits]
      // Empty box: clear the one before it and step back, so holding backspace
      // walks the code out rather than stalling.
      const target = next[i] ? i : Math.max(i - 1, 0)
      next[target] = ""
      setDigits(next)
      focus(target)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      focus(i - 1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      focus(i + 1)
    }
  }

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const cleaned = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!cleaned) return
    e.preventDefault()
    fill(i, cleaned.slice(0, OTP_LENGTH - i))
  }

  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          // Selecting on focus makes an already-filled box overtype cleanly.
          onFocus={(e) => e.currentTarget.select()}
          className={cn("w-full text-center outline-none transition", TONES[tone])}
        />
      ))}
    </div>
  )
}
