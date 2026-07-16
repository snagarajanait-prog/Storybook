import { chromium } from "playwright-core"
const BASE = "http://localhost:5173"
const OUT = "C:/Users/DELL/AppData/Local/Temp/claude/c--Users-DELL-projects-DEMO-ACSE/4811381c-ed42-456a-9ade-57bf64f223a7/scratchpad"
const browser = await chromium.launch({ channel: "msedge", headless: true })
const errors = []
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message))
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
await page.goto(BASE + "/", { waitUntil: "networkidle" })
await page.waitForTimeout(900)
await page.locator("header").first().screenshot({ path: `${OUT}/logo2-navbar.png` })
await page.locator("footer").first().scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await page.locator("footer").first().screenshot({ path: `${OUT}/logo2-footer.png` })
await ctx.close()
for (const [route, name] of [["/v1", "v1"], ["/v2", "v2"]]) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const p = await c.newPage()
  p.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message))
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  await p.goto(BASE + route, { waitUntil: "networkidle" })
  await p.waitForTimeout(900)
  await p.locator("header").first().screenshot({ path: `${OUT}/logo2-${name}-header.png` })
  await c.close()
}
await browser.close()
console.log(JSON.stringify({ errorCount: errors.length, errors: errors.slice(0, 5) }, null, 2))
