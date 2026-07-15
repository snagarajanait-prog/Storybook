import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

/**
 * The internal data-source toggle the client (Siva) asked for.
 *
 * - "AUTONOMOUS": the AI reads/writes the Autonomous Transaction DB (ATP) with
 *   synthetic data. This is what the public demo world always uses so the real
 *   C2M application is never exposed or overloaded.
 * - "C2M": the AI is wired to the real C2M application. Used only internally to
 *   prove end-to-end functionality (and when showing a prospective customer).
 *
 * Per the meeting: this switch must be controlled *internally only* — never a
 * feature the end user drives. Here it lives in a small corner control.
 */
export type DataSource = "AUTONOMOUS" | "C2M"

interface DataSourceState {
  source: DataSource
}

const initialState: DataSourceState = {
  // Public demo defaults to the safe, synthetic Autonomous DB path.
  source: "AUTONOMOUS",
}

const dataSourceSlice = createSlice({
  name: "dataSource",
  initialState,
  reducers: {
    setDataSource(state, action: PayloadAction<DataSource>) {
      state.source = action.payload
    },
    toggleDataSource(state) {
      state.source = state.source === "C2M" ? "AUTONOMOUS" : "C2M"
    },
  },
})

export const { setDataSource, toggleDataSource } = dataSourceSlice.actions
export default dataSourceSlice.reducer

/** Human-facing metadata for whichever source is active. */
export const DATA_SOURCE_META: Record<
  DataSource,
  { label: string; short: string; system: string; description: string }
> = {
  AUTONOMOUS: {
    label: "Autonomous DB",
    short: "ATP",
    system: "Autonomous Transaction Processing",
    description:
      "Synthetic data. Safe for public demos — the real C2M application is never touched.",
  },
  C2M: {
    label: "C2M (live)",
    short: "C2M",
    system: "Oracle C2M application",
    description:
      "Live end-to-end path. Internal use only — proves the flow against the real C2M system.",
  },
}
