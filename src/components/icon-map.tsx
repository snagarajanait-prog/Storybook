import {
  ArrowLeftRight,
  CalendarClock,
  CloudOff,
  Droplets,
  HelpCircle,
  Power,
  PowerOff,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from "lucide-react"

/** Resolve a lucide icon by the string name stored in data. */
const icons: Record<string, LucideIcon> = {
  Power,
  PowerOff,
  ArrowLeftRight,
  TrendingUp,
  CalendarClock,
  CloudOff,
  UserCog,
  Droplets,
}

export function getIcon(name: string): LucideIcon {
  return icons[name] ?? HelpCircle
}
