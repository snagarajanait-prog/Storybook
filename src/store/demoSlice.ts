import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Lead {
  name: string
  email: string
  organization: string
  interest: string
}

/** Which screen the demo panel is currently showing. */
export type DemoStage = "select" | "workspace"

interface DemoState {
  /** Is the demo dialog open? */
  open: boolean
  stage: DemoStage
  selectedCustomerId: string | null
  /** Account within the selected customer that sets the chatbot context. */
  selectedAccountId: string | null
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
  activeScenarioId: null,
  leads: [],
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
    selectCustomer(
      state,
      action: PayloadAction<{ customerId: string; accountId: string }>
    ) {
      state.selectedCustomerId = action.payload.customerId
      state.selectedAccountId = action.payload.accountId
      state.stage = "workspace"
      state.activeScenarioId = null
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
    setChatContext(
      state,
      action: PayloadAction<{ customerId: string; accountId: string }>
    ) {
      state.selectedCustomerId = action.payload.customerId
      state.selectedAccountId = action.payload.accountId
      state.activeScenarioId = null
    },
    /**
     * Clear the chatbot context (back to the list of values) WITHOUT touching
     * `stage`/`open`. Used by the variant pages' "Change customer" control.
     */
    clearChatContext(state) {
      state.selectedCustomerId = null
      state.selectedAccountId = null
      state.activeScenarioId = null
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
    },
    addLead(state, action: PayloadAction<Lead>) {
      state.leads.push(action.payload)
    },
  },
})

export const {
  openDemo,
  closeDemo,
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
