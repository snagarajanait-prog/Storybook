import { Bell, CreditCard, Gauge, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"
import { findAccount, findCustomer } from "@/data/customers"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setAccount } from "@/store/demoSlice"

export function AccountDashboard() {
  const dispatch = useAppDispatch()
  const { selectedCustomerId, selectedAccountId } = useAppSelector((s) => s.demo)
  const customer = findCustomer(selectedCustomerId)
  const account = findAccount(customer, selectedAccountId)

  if (!customer || !account) return null

  const maxUsage = Math.max(...account.usage.map((u) => u.value), 1)

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-slim bg-slate-50/60">
      <div className="space-y-4 p-4">
        {/* Account header + switcher */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {customer.name} · {customer.id}
              </p>
              <p className="mt-0.5 font-semibold text-brand-navy">Account details</p>
            </div>
            <Badge
              variant={
                account.status === "Active"
                  ? "success"
                  : account.status === "Pending"
                    ? "warning"
                    : "secondary"
              }
            >
              {account.status}
            </Badge>
          </div>

          {customer.accounts.length > 1 && (
            <div className="mt-3">
              <Select
                value={account.id}
                onValueChange={(v) => dispatch(setAccount(v))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customer.accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.type} · {a.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <dl className="mt-4 space-y-3 text-sm">
            <Row icon={MapPin} label="Service address" value={account.serviceAddress} />
            <Row icon={Gauge} label="Meter" value={`${account.meterId} · ${account.type}`} />
          </dl>
        </div>

        {/* Balance */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
            <CreditCard className="h-4 w-4 text-brand-cyan" />
            Balance
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p
                className={cn(
                  "text-2xl font-bold",
                  account.balance > 0 ? "text-brand-navy" : "text-emerald-600"
                )}
              >
                {account.balance > 0 ? formatCurrency(account.balance) : "$0.00"}
              </p>
              <p className="text-xs text-muted-foreground">
                {account.balance > 0 ? `Due ${account.dueDate}` : "Nothing due"}
              </p>
            </div>
            <Badge variant={account.autopay ? "brand" : "outline"}>
              {account.autopay ? "Autopay on" : "Autopay off"}
            </Badge>
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-brand-navy">
              Usage <span className="text-muted-foreground">({account.unit})</span>
            </p>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </div>
          <div className="mt-4 flex h-28 gap-2">
            {account.usage.map((u) => {
              const h = Math.max(4, Math.round((u.value / maxUsage) * 100))
              const isPeak = u.value === maxUsage && maxUsage > 0
              return (
                <div key={u.month} className="flex flex-1 flex-col">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-sm transition-all",
                        u.value === 0
                          ? "bg-slate-200"
                          : isPeak
                            ? "bg-brand-red"
                            : "bg-brand-cyan/70"
                      )}
                      style={{ height: u.value === 0 ? "2px" : `${h}%` }}
                      title={`${u.month}: ${u.value.toLocaleString()} ${account.unit}`}
                    />
                  </div>
                  <span className="mt-1.5 text-center text-[10px] text-muted-foreground">
                    {u.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
            <Bell className="h-4 w-4 text-brand-cyan" />
            Notifications
          </div>
          <ul className="mt-3 space-y-2">
            {account.notifications.map((n) => (
              <li
                key={n}
                className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
              >
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

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium text-slate-800">{value}</dd>
      </div>
    </div>
  )
}
