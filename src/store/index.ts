import { configureStore } from "@reduxjs/toolkit"

import dataSourceReducer from "./dataSourceSlice"
import demoReducer from "./demoSlice"

export const store = configureStore({
  reducer: {
    dataSource: dataSourceReducer,
    demo: demoReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
