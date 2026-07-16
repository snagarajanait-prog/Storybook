import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import App from "./App"
import CopilotPage from "@/pages/CopilotPage"
import ConciergePage from "@/pages/ConciergePage"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Base "Classic" messenger design + marketing site */}
          <Route path="/" element={<App />} />
          {/* Variant chatbot designs — one approach per route */}
          <Route path="/v1" element={<CopilotPage />} />
          <Route path="/v2" element={<ConciergePage />} />
          {/* Unknown paths fall back to the base experience */}
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </Provider>
  </React.StrictMode>
)
