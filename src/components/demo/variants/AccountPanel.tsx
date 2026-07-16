import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  CalendarClock,
  CreditCard,
  Gauge,
  Mail,
  MapPin,
  Phone,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { findAccount, findCustomer, type Account } from "@/data/customers"
import {
  RANGE_LABEL,
  USAGE_RANGES,
  rangeSeries,
  usageStats,
  type UsageRange,
} from "@/data/usage"
import { setAccount } from "@/store/demoSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

type Tone = "light" | "dark"

/**
 * Tone-scoped class tokens so one panel serves the light and dark variants.
 * Colours for value/status/chart text are chosen to clear WCAG AA on their
 * respective backgrounds (darker shades on the light-tone white surfaces).
 */
function tokens(dark: boolean) {
  return {
    card: dark ? "bg-white/[0.04] ring-1 ring-white/10" : "bg-white ring-1 ring-slate-100 shadow-sm",
    heading: dark ? "text-slate-100" : "text-brand-navy",
    value: dark ? "text-slate-100" : "text-slate-800",
    label: dark ? "text-slate-400" : "text-slate-500",
    faint: dark ? "text-slate-400" : "text-slate-500",
    icon: dark ? "text-slate-400" : "text-slate-400",
    accent: "text-brand-cyan",
    divide: dark ? "divide-white/[0.06]" : "divide-slate-100",
    chipIdle: dark
      ? "text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
      : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
    chipActive: dark
      ? "bg-brand-cyan/15 text-white ring-1 ring-brand-cyan/40"
      : "bg-brand-cyan/10 text-brand-navy ring-1 ring-brand-cyan/30",
    track: dark ? "bg-white/[0.06]" : "bg-slate-100",
    notif: dark ? "bg-white/[0.03] text-slate-300" : "bg-slate-50 text-slate-600",
    // AA-safe value colours: emerald/red read fine on dark, need darkening on white.
    good: dark ? "text-emerald-400" : "text-emerald-700",
    alert: dark ? "text-brand-red" : "text-red-700",
    // Usage bars: full-opacity darker cyan on light so heights are perceivable.
    barFill: dark ? "bg-brand-cyan/70" : "bg-[#16789f]",
    barZero: dark ? "bg-white/10" : "bg-slate-300",
  }
}

/**
 * A comprehensive, theme-aware account/customer detail panel — the persistent
 * "context" surface that sits beside the chatbot on the variant pages, mirroring
 * (and expanding on) the base demo's dashboard. Surfaces everything the demo
 * knows: identity, contact, service, balance, 6-month / 1-year / 2-year usage
 * history with stats, and notifications.
 */
export function AccountPanel({ tone = "light" }: { tone?: Tone }) {
  const dispatch = useAppDispatch()
  const { selectedCustomerId, selectedAccountId } = useAppSelector((s) => s.demo)
  const customer = findCustomer(selectedCustomerId)
  const account = findAccount(customer, selectedAccountId)
  const [range, setRange] = useState<UsageRange>("1Y")

  // Reset the range whenever the account changes so the behaviour is symmetric
  // (not an accident of unmount timing on customer switch).
  useEffect(() => setRange("1Y"), [selectedAccountId])

  // Derive the history once per (account, range); the Concierge call timer
  // re-renders this panel every second, so memoising avoids rebuilding 24 months.
  const usage = useMemo(() => {
    if (!account) return null
    const series = rangeSeries(account, range)
    return { series, stats: usageStats(account), maxUsage: Math.max(...series.map((p) => p.value), 1) }
  }, [account, range])

  if (!customer || !account || !usage) return null
  const dark = tone === "dark"
  const t = tokens(dark)
  const { series, stats, maxUsage } = usage

  const span =
    series.length > 1
      ? `${series[0].label} ${series[0].year} – ${series[series.length - 1].label} ${
          series[series.length - 1].year
        }`
      : ""

  return (
    <div className="flex h-full flex-col">
      {/* Identity */}
      <div className={cn("shrink-0 border-b px-4 py-3.5", dark ? "border-white/10" : "border-slate-200")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn("truncate font-semibold", t.heading)}>{customer.name}</p>
            <p className={cn("text-xs", t.label)}>
              {customer.id} · Customer since {customer.since}
            </p>
          </div>
          <StatusBadge status={account.status} dark={dark} />
        </div>

        {customer.accounts.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {customer.accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => dispatch(setAccount(a.id))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan",
                  a.id === account.id ? t.chipActive : t.chipIdle
                )}
              >
                <span className={t.accent}>{a.type}</span>
                <span className={dark ? "text-slate-400" : "text-slate-500"}>{a.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="scrollbar-slim flex-1 space-y-4 overflow-y-auto p-4">
        {/* Contact + service */}
        <div className={cn("space-y-3 rounded-xl p-4", t.card)}>
          <Row icon={Mail} label="Email" value={customer.email} t={t} />
          <Row icon={Phone} label="Phone" value={customer.phone} t={t} />
          <Row icon={MapPin} label="Service address" value={account.serviceAddress} t={t} />
          <Row icon={Gauge} label="Meter" value={`${account.meterId} · ${account.type}`} t={t} />
        </div>

        {/* Balance */}
        <div className={cn("rounded-xl p-4", t.card)}>
          <div className={cn("flex items-center gap-2 text-sm font-medium", t.heading)}>
            <CreditCard className="h-4 w-4 text-brand-cyan" />
            Balance
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className={cn("text-2xl font-bold", account.balance > 0 ? t.heading : t.good)}>
                {account.balance > 0 ? formatCurrency(account.balance) : "$0.00"}
              </p>
              <p className={cn("flex items-center gap-1 text-xs", t.label)}>
                <CalendarClock className="h-3 w-3" />
                {account.balance > 0 ? `Due ${account.dueDate}` : "Nothing due"}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                account.autopay
                  ? "bg-brand-cyan/10 text-brand-cyan ring-brand-cyan/30"
                  : cn(t.label, dark ? "ring-white/15" : "ring-slate-200")
              )}
            >
              {account.autopay ? "Autopay on" : "Autopay off"}
            </span>
          </div>
        </div>

        {/* Usage history */}
        <div className={cn("rounded-xl p-4", t.card)}>
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium", t.heading)}>
              Usage <span className={t.label}>({account.unit})</span>
            </p>
            <div className={cn("inline-flex rounded-lg p-0.5", t.track)}>
              {USAGE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  title={RANGE_LABEL[r]}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan",
                    range === r
                      ? "bg-brand-cyan text-brand-navy"
                      : dark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-brand-navy"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className="mt-4 flex h-28 items-end gap-[3px]">
            {series.map((p, i) => {
              const h = p.value === 0 ? 2 : Math.max(6, Math.round((p.value / maxUsage) * 100))
              const isPeak =
                stats.peak != null && p.year === stats.peak.year && p.monthIndex === stats.peak.monthIndex
              return (
                <div
                  key={`${p.year}-${p.monthIndex}-${i}`}
                  className={cn(
                    "flex-1 rounded-t-sm transition-all",
                    p.value === 0 ? t.barZero : isPeak ? "bg-brand-red" : t.barFill
                  )}
                  style={{ height: `${h}%` }}
                  title={`${p.label} ${p.year}: ${p.value.toLocaleString()} ${account.unit}`}
                />
              )
            })}
          </div>
          {span && <p className={cn("mt-2 text-center text-[10px]", t.faint)}>{span}</p>}

          {/* Stats */}
          <div className={cn("mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg", t.track)}>
            <Stat label="This year" value={stats.thisYear.toLocaleString()} unit={account.unit} t={t} dark={dark} />
            <Stat label="Last year" value={stats.lastYear.toLocaleString()} unit={account.unit} t={t} dark={dark} />
            <Stat label="Avg / month" value={stats.avgMonthly.toLocaleString()} unit={account.unit} t={t} dark={dark} />
            <Stat
              label="Peak month"
              value={stats.peak ? stats.peak.value.toLocaleString() : "—"}
              unit={stats.peak ? `${account.unit} · ${stats.peak.label}` : ""}
              t={t}
              dark={dark}
            />
          </div>
          <YoY pct={stats.yoyPct} t={t} />
        </div>

        {/* Notifications */}
        <div className={cn("rounded-xl p-4", t.card)}>
          <div className={cn("flex items-center gap-2 text-sm font-medium", t.heading)}>
            <Bell className="h-4 w-4 text-brand-cyan" />
            Notifications
          </div>
          <ul className="mt-3 space-y-2">
            {account.notifications.map((n) => (
              <li key={n} className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-xs", t.notif)}>
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

type T = ReturnType<typeof tokens>

function Row({ icon: Icon, label, value, t }: { icon: typeof MapPin; label: string; value: string; t: T }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.icon)} />
      <div className="min-w-0">
        <p className={cn("text-xs", t.label)}>{label}</p>
        <p className={cn("break-words font-medium", t.value)}>{value}</p>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  t,
  dark,
}: {
  label: string
  value: string
  unit: string
  t: T
  dark: boolean
}) {
  return (
    <div className={cn("px-3 py-2.5", dark ? "bg-brand-navydeep/40" : "bg-white")}>
      <p className={cn("text-[10px] uppercase tracking-wide", t.label)}>{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", t.heading)}>
        {value} {unit && <span className={cn("text-[10px] font-normal", t.faint)}>{unit}</span>}
      </p>
    </div>
  )
}

function YoY({ pct, t }: { pct: number | null; t: T }) {
  if (pct === null) {
    return <p className={cn("mt-2 text-center text-[11px]", t.faint)}>No prior-year baseline yet</p>
  }
  const up = pct >= 0
  const Icon = up ? TrendingUp : TrendingDown
  const color = up ? t.alert : t.good
  return (
    <div className={cn("mt-2.5 flex items-center justify-center gap-1.5 text-xs", t.label)}>
      <Icon className={cn("h-3.5 w-3.5", color)} />
      <span className={cn("font-semibold", color)}>
        {up ? "+" : ""}
        {pct.toFixed(0)}%
      </span>
      <span>year over year</span>
    </div>
  )
}

function StatusBadge({ status, dark }: { status: Account["status"]; dark: boolean }) {
  const map: Record<Account["status"], string> = {
    Active: dark
      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
      : "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Pending: dark
      ? "bg-amber-500/10 text-amber-400 ring-amber-500/30"
      : "bg-amber-50 text-amber-700 ring-amber-600/20",
    Final: dark ? "bg-white/10 text-slate-300 ring-white/15" : "bg-slate-100 text-slate-600 ring-slate-200",
  }
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", map[status])}>
      {status}
    </span>
  )
}
