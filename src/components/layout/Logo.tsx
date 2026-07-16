import { cn } from "@/lib/utils"
import logoUrl from "./acse-logo.png"

/**
 * The ACSE Solutions AI lockup.
 *
 * `acse-logo.png` is the supplied artwork (kept alongside as `download.png`)
 * with its transparent padding trimmed off. The PNG keeps its transparent
 * background, so it sits directly on whatever surface hosts it — navy navbar,
 * dark footer, or the light Concierge header alike.
 *
 * `className` sets the image height (defaults to h-8); the aspect ratio is
 * preserved via `w-auto`.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="ACSE Solutions AI"
      width={638}
      height={220}
      className={cn("h-8 w-auto select-none", className)}
    />
  )
}
