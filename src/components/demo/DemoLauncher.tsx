import { Bot } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openDemo } from "@/store/demoSlice"

/** Floating AI button — the "click the AI icon and the chatbot pops up" entry. */
export function DemoLauncher() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.demo.open)

  if (open) return null

  return (
    <button
      onClick={() => dispatch(openDemo())}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-brand-red py-3 pl-3 pr-5 text-white shadow-xl shadow-brand-red/30 transition-transform hover:scale-[1.03] active:scale-95"
      aria-label="Open the AI assistant"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
        <Bot className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">Ask ACSE AI</span>
      <span className="absolute right-3 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-white ring-2 ring-brand-red" />
    </button>
  )
}
