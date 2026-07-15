import { cn } from "@/lib/utils"

export function Logo({
  className,
  onLight = false,
}: {
  className?: string
  onLight?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-cyan/15 ring-1 ring-brand-cyan/30">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M12 3l7 12H5L12 3z" fill="#2ca5d9" />
          <circle cx="12" cy="17" r="2.4" fill="#e33935" />
        </svg>
      </span>
      <span
        className={cn(
          "text-[17px] font-bold tracking-tight",
          onLight ? "text-brand-navy" : "text-white"
        )}
      >
        ACSE<span className="text-brand-cyan"> AI</span>
      </span>
    </div>
  )
}
