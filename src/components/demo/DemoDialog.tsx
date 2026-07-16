import { useState } from "react"
import { ArrowLeft, LayoutDashboard, MessagesSquare } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CustomerSelect } from "@/components/demo/CustomerSelect"
import { AccountVerify } from "@/components/demo/AccountVerify"
import { AccountDashboard } from "@/components/demo/AccountDashboard"
import { ChatWindow } from "@/components/demo/ChatWindow"
import { findCustomer } from "@/data/customers"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { backToCustomerList, closeDemo, selectCustomer } from "@/store/demoSlice"

export function DemoDialog() {
  const dispatch = useAppDispatch()
  const { open, stage, selectedCustomerId, pendingAccountId } = useAppSelector((s) => s.demo)
  const customer = findCustomer(selectedCustomerId)
  const [mobileTab, setMobileTab] = useState<"account" | "chat">("chat")
  // An account is picked but held at the identity gate — the list gives way to
  // the verification steps until it clears.
  const verifying = Boolean(pendingAccountId)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dispatch(closeDemo())}>
      <DialogContent
        hideClose
        // The internal data-source toggle sits above the overlay so operators can
        // flip C2M / Autonomous mid-demo; keep those clicks from closing the dialog.
        onInteractOutside={(e) => {
          const target = e.target
          if (target instanceof Element && target.closest("[data-internal-toggle]")) {
            e.preventDefault()
          }
        }}
        className="flex h-[88vh] max-h-[900px] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-0"
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
          {stage === "workspace" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch(backToCustomerList())
                setMobileTab("chat")
              }}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Change customer
            </Button>
          ) : (
            <div className="pl-1">
              <DialogTitle className="text-base text-brand-navy">
                ACSE AI · Interactive assistant
              </DialogTitle>
              <DialogDescription className="text-xs">
                {verifying
                  ? "Confirm your identity to open the assistant."
                  : "Select a customer to begin. No login required."}
              </DialogDescription>
            </div>
          )}

          {stage === "workspace" && customer && (
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:block">
                {customer.name}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(closeDemo())}
            className={cn(stage === "select" && "ml-auto")}
          >
            Close
          </Button>
        </div>

        {stage === "select" ? (
          <div className="min-h-0 flex-1">
            {/* a11y: workspace title is set above; select uses the header title */}
            {verifying ? <AccountVerify tone="light" grant={selectCustomer} /> : <CustomerSelect />}
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Customer workspace</DialogTitle>
            {/* Mobile pane switcher */}
            <div className="flex gap-1 border-b bg-slate-50 p-1.5 md:hidden">
              <TabButton
                active={mobileTab === "chat"}
                onClick={() => setMobileTab("chat")}
                icon={MessagesSquare}
                label="Assistant"
              />
              <TabButton
                active={mobileTab === "account"}
                onClick={() => setMobileTab("account")}
                icon={LayoutDashboard}
                label="Account"
              />
            </div>

            <div className="flex min-h-0 flex-1">
              <div
                className={cn(
                  "min-h-0 w-full border-r md:block md:w-[340px] md:shrink-0",
                  mobileTab === "account" ? "block" : "hidden"
                )}
              >
                <AccountDashboard />
              </div>
              <div
                className={cn(
                  "min-h-0 w-full min-w-0 md:block md:flex-1",
                  mobileTab === "chat" ? "block" : "hidden"
                )}
              >
                <ChatWindow />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof MessagesSquare
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-white text-brand-navy shadow-sm" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
