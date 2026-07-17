import { useEffect, useState } from "react"
import { Menu, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/layout/Logo"
import { cn } from "@/lib/utils"
import { useAppDispatch } from "@/store/hooks"
import { openDemo } from "@/store/demoSlice"

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#billing", label: "Billing" },
  { href: "#contact", label: "About" },
]

export function Navbar() {
  const dispatch = useAppDispatch()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 backdrop-blur transition-shadow",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <nav className="container flex h-[70px] items-center justify-between">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[15px] text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Button onClick={() => dispatch(openDemo())} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Try the assistant
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-navy px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => {
              setMobileOpen(false)
              dispatch(openDemo())
            }}
            className="mt-3 w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Try the assistant
          </Button>
        </div>
      )}
    </header>
  )
}
