import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Lead {
  name: string
  email: string
  organization: string
  interest: string
}

/** Which screen the demo panel is currently showing. */
export type DemoStage = "select" | "workspace"

/** Which step of the identity gate is showing. */
export type VerifyStep = "email" | "otp"

/**
 * How the live chat context cleared the identity gate.
 *
 * - "challenge": the customer keyed a one-time code in at the gate.
 * - "session": no gate — the mode inherits an already-authenticated session, so
 *   the code was sent and confirmed before the chat ever opened.
 */
export type VerifiedVia = "challenge" | "session"

/** Hand the chat context to a surface, recording how identity was settled. */
export interface GrantPayload {
  customerId: string
  accountId: string
  via: VerifiedVia
}

interface DemoState {
  /** Is the demo dialog open? */
  open: boolean
  stage: DemoStage
  selectedCustomerId: string | null
  /** Account within the selected customer that sets the chatbot context. */
  selectedAccountId: string | null
  /**
   * Account picked from the list but not yet through the identity gate. While
   * this is set, every design shows the verification steps in place of its list
   * — it is what holds the pick back from becoming the chat context.
   */
  pendingCustomerId: string | null
  pendingAccountId: string | null
  verifyStep: VerifyStep
  /** Address the code was "sent" to — echoed on the code step and after. */
  verifyEmail: string
  /** How the live context was verified; null when there is no context. */
  verifiedVia: VerifiedVia | null
  /** A use-case the user asked to auto-play (storyboard), or null. */
  activeScenarioId: string | null
  /** Captured contact/demo-request leads (Contact form). */
  leads: Lead[]
}

const initialState: DemoState = {
  open: false,
  stage: "select",
  selectedCustomerId: null,
  selectedAccountId: null,
  pendingCustomerId: null,
  pendingAccountId: null,
  verifyStep: "email",
  verifyEmail: "",
  verifiedVia: null,
  activeScenarioId: null,
  leads: [],
}

/**
 * Promote the pending pick to the live chat context and tear the gate down.
 * Shared by both grant actions so the modal and the variant pages can never
 * disagree about what "verified" leaves behind.
 */
function grantContext(state: DemoState, { customerId, accountId, via }: GrantPayload) {
  state.selectedCustomerId = customerId
  state.selectedAccountId = accountId
  state.verifiedVia = via
  state.activeScenarioId = null
  state.pendingCustomerId = null
  state.pendingAccountId = null
  state.verifyStep = "email"
}

/** Drop both the gate and whatever it had already verified. */
function resetVerification(state: DemoState) {
  state.pendingCustomerId = null
  state.pendingAccountId = null
  state.verifyStep = "email"
  state.verifyEmail = ""
  state.verifiedVia = null
}

const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    openDemo(state) {
      state.open = true
    },
    closeDemo(state) {
      state.open = false
    },
    /**
     * Hold an account at the identity gate: the pick is parked here until a code
     * is entered. Only modes that challenge get this far (see `promptsForOtp`).
     */
    beginVerification(
      state,
      action: PayloadAction<{ customerId: string; accountId: string }>
    ) {
      state.pendingCustomerId = action.payload.customerId
      state.pendingAccountId = action.payload.accountId
      state.verifyStep = "email"
      state.verifyEmail = ""
    },
    /** Address keyed in: "send" the code and move to the entry boxes. */
    sendVerificationCode(state, action: PayloadAction<string>) {
      state.verifyEmail = action.payload
      state.verifyStep = "otp"
    },
    /** Step back from the entry boxes to correct the address. */
    editVerificationEmail(state) {
      state.verifyStep = "email"
    },
    /** Abandon the gate and return to the list of values. */
    cancelVerification(state) {
      resetVerification(state)
    },
    selectCustomer(state, action: PayloadAction<GrantPayload>) {
      grantContext(state, action.payload)
      state.stage = "workspace"
    },
    setAccount(state, action: PayloadAction<string>) {
      state.selectedAccountId = action.payload
      state.activeScenarioId = null
    },
    /**
     * Set the chatbot context (customer + account) WITHOUT touching `stage` or
     * `open`. Used by the standalone variant pages (/v1, /v2) so switching the
     * customer there never disturbs the base modal-demo's own flow.
     */
    setChatContext(state, action: PayloadAction<GrantPayload>) {
      grantContext(state, action.payload)
    },
    /**
     * Clear the chatbot context (back to the list of values) WITHOUT touching
     * `stage`/`open`. Used by the variant pages' "Change customer" control.
     */
    clearChatContext(state) {
      state.selectedCustomerId = null
      state.selectedAccountId = null
      state.activeScenarioId = null
      resetVerification(state)
    },
    playScenario(state, action: PayloadAction<string>) {
      state.activeScenarioId = action.payload
    },
    clearScenario(state) {
      state.activeScenarioId = null
    },
    backToCustomerList(state) {
      state.stage = "select"
      state.selectedCustomerId = null
      state.selectedAccountId = null
      state.activeScenarioId = null
      resetVerification(state)
    },
    addLead(state, action: PayloadAction<Lead>) {
      state.leads.push(action.payload)
    },
  },
})

export const {
  openDemo,
  closeDemo,
  beginVerification,
  sendVerificationCode,
  editVerificationEmail,
  cancelVerification,
  selectCustomer,
  setAccount,
  setChatContext,
  clearChatContext,
  playScenario,
  clearScenario,
  backToCustomerList,
  addLead,
} = demoSlice.actions

export default demoSlice.reducer
