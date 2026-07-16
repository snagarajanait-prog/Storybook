import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { DemoSection } from "@/components/sections/DemoSection"
import { PlatformSection } from "@/components/sections/PlatformSection"
import { UseCasesSection } from "@/components/sections/UseCasesSection"
import { BillingSection } from "@/components/sections/BillingSection"
import { ContactSection } from "@/components/sections/ContactSection"
import { DemoDialog } from "@/components/demo/DemoDialog"
import { DemoLauncher } from "@/components/demo/DemoLauncher"
import { DataSourceToggle } from "@/components/demo/DataSourceToggle"
import { VariantSwitcher } from "@/components/demo/variants/VariantSwitcher"

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <DemoSection />
        <PlatformSection />
        <UseCasesSection />
        <BillingSection />
        <ContactSection />
      </main>
      <Footer />

      {/* Demo experience + internal controls (overlay the whole app) */}
      <DemoDialog />
      <DemoLauncher />
      <DataSourceToggle />

      {/* Hop between the three chatbot design approaches */}
      <VariantSwitcher floating />
    </div>
  )
}
