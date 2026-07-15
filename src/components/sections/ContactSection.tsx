import { useState } from "react"
import { Clock, Mail, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppDispatch } from "@/store/hooks"
import { addLead } from "@/store/demoSlice"

const interests = [
  "Customer service automation",
  "Billing exception workflows",
  "Both — full platform",
  "A demo / pricing",
]

export function ContactSection() {
  const dispatch = useAppDispatch()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [interest, setInterest] = useState(interests[3])
  const [notes, setNotes] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(
      addLead({
        name: `${firstName} ${lastName}`.trim(),
        email,
        organization,
        interest,
      })
    )
    toast.success("Thanks — we'll be in touch.", {
      description: "Your details were captured (demo — no email is actually sent).",
    })
    setFirstName("")
    setLastName("")
    setEmail("")
    setOrganization("")
    setNotes("")
  }

  return (
    <section id="contact" className="bg-slate-50/70">
      <div className="container py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left: info */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-cyan">
              Get in touch
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              See ACSE AI in action
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We work with water and utility providers of all sizes. Tell us
              about your operation and we'll show you exactly how ACSE AI fits in.
            </p>

            <ul className="mt-8 space-y-4">
              <InfoRow icon={Mail} label="Email" value="info@acsesolutions.com" />
              <InfoRow icon={MapPin} label="Coverage" value="Serving utilities across North America" />
              <InfoRow icon={Clock} label="Response time" value="Within 1 business day" />
            </ul>
          </div>

          {/* Right: form */}
          <form
            onSubmit={submit}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jordan"
                />
              </Field>
              <Field label="Last name">
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rivera"
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Work email">
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@utility.gov"
                />
              </Field>
              <Field label="Organization">
                <Input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Metro Water District"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="I'm interested in">
                <Select value={interest} onValueChange={setInterest}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interests.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Tell us about your current setup">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Systems you run today, call volume, pain points…"
                  rows={4}
                />
              </Field>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full">
              Send message
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-navy">
        <Icon className="h-4 w-4 text-brand-cyan" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium text-brand-navy">{value}</p>
      </div>
    </li>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
